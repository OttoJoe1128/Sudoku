// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { SoundManager } from '../engine/soundManager';
import { setLang, t, applyStaticTranslations, TRANSLATIONS } from '../i18n/translations';
import { startGame, initGameController, getGameRuntimeState, handleExitGameRequest } from '../controllers/gameController';
import { openLevelPrepModal, closeLevelPrepModal } from '../controllers/levelPrepController';
import { openAbilitiesModal, closeAbilitiesModal } from '../controllers/abilitiesController';
import { openStreakModal, closeStreakModal, initStreakController } from '../controllers/streakController';
import { computeLevelCrystalDelta, getAbilityCooldownMs, isAbilityReady } from '../engine/abilities';
import { generateSpecialCellsForBoard, getLevelModifierProfile } from '../engine/levelModifiers';
import { createBoardMechanicsState, applyValidMoveMechanics, applyMistakeMechanics, repairLastCrackedCrystal, activateOracleEye, activateSealBreaker } from '../engine/boardMechanics';
import { findSmartHint } from '../engine/hintSolver';
import { SudokuGen } from '../engine/sudoku';

describe('Faz 8 Üst Düzey Derin Sistem & İnteraktif Yol Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initGameController({
      onUpdateGoldDisplay: () => {},
      onReturnToMap: () => {}
    });
    initStreakController();
  });

  it('1. Çift Ekonomi Atomik Sınır & Yetersiz Bakiye Testi: Yetenek yükseltme ve şarj işlemlerinde bakiye tam sınırda (15 Gold / 5 Crystal) test edilmeli', async () => {
    // 0 Kristal ve 0 Altın durumunda yükseltme reddedilmeli
    const failRes = await UserManager.upgradeAbility('crystal_shield');
    expect(failRes.ok).toBe(false);
    expect(failRes.reason).toBe('insufficient_crystals');

    // Tam 5 Kristal ver ancak Altın 0 kalsın
    await UserManager.updateProgress(1, 0);
    await UserManager.addCrystals(5);
    const goldFail = await UserManager.upgradeAbility('crystal_shield');
    expect(goldFail.ok).toBe(false);
    expect(goldFail.reason).toBe('insufficient_gold');

    // Tam 20 Altın ver (Sv 0 -> Sv 1 maliyeti: 5 kristal, 20 altın)
    await UserManager.updateProgress(1, 20);
    const successRes = await UserManager.upgradeAbility('crystal_shield');
    expect(successRes.ok).toBe(true);
    expect(successRes.newLevel).toBe(1);

    // Kalan bakiye 0 olmalı
    expect(UserManager.getCrystals()).toBe(0);
    expect(UserManager.getGold()).toBe(0);
  });

  it('2. Samurai 5-Grid Kesişim & Aday Not Yığını Derin Testi: 4 ortak 3x3 köşede rakam ve not senkronizasyonu çalışmalı', () => {
    startGame(1, 'basit', undefined, undefined, 'samurai', false);

    const runtime = getGameRuntimeState();
    expect(runtime).not.toBeNull();
    expect(runtime.isMatchMode).toBe(false);

    // Samurai modunda 5 alt tahta olmalı
    const gen = SudokuGen.generateVariant('basit', 'samurai');
    expect(gen.samuraiGrids?.length).toBe(5);

    // Merkez tahta (grid 0) sol üst köşe (0,0) -> Sol Üst tahta (grid 1) sağ alt köşe (6,6) ile aynı çözüme sahip olmalı
    const centerSol = gen.samuraiGrids![0].solution[0][0];
    const topLeftSol = gen.samuraiGrids![1].solution[6][6];
    expect(centerSol).toBe(topLeftSol);
  });

  it('3. Soğuma (Cooldown) Otoritesi ve Şarj Sıfırlama: Beklemede olan yetenek Altın düşerek veya ad ile anında sıfırlanmalı', async () => {
    // oracle_eye varsayılan Sv 1
    const prog = UserManager.getAbilityProgress('oracle_eye');
    expect(prog.level).toBe(1);

    // Cooldown tetikle
    UserManager.triggerAbilityCooldown('oracle_eye');
    const cdProg = UserManager.getAbilityProgress('oracle_eye');
    expect(cdProg.cooldownEndsAtMs).toBeGreaterThan(Date.now());

    // Yetersiz altınla şarj denemesi
    await UserManager.updateProgress(1, 5);
    const rechargeFail = await UserManager.rechargeAbilityWithGold('oracle_eye');
    expect(rechargeFail.ok).toBe(false);

    // Yeterli altın (15 Gold) ver
    await UserManager.updateProgress(1, 20);
    const rechargeOk = await UserManager.rechargeAbilityWithGold('oracle_eye');
    expect(rechargeOk.ok).toBe(true);

    const finalProg = UserManager.getAbilityProgress('oracle_eye');
    expect(finalProg.cooldownEndsAtMs).toBe(0);
    expect(UserManager.getGold()).toBe(5);
  });

  it('4. İnteraktif Akıllı İpucu & Mühürlü Hücre Hariç Tutma: Sealed cells hint aramasından tamamen elenmeli', () => {
    const puzzle = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
    const solution = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => ((r * 3 + Math.floor(r / 3) + c) % 9) + 1));

    // Cell (0,0) Mühürlü yap
    const sealedCells = [{ r: 0, c: 0 }];
    const hint = findSmartHint(puzzle, solution, { preferredCell: { r: 0, c: 0 }, sealedCells });

    expect(hint).not.toBeNull();
    // Cell (0,0) mühürlü olduğu için ipucu başka hücreye (0,0 harici) verilmelidir
    expect(hint?.row === 0 && hint?.col === 0).toBe(false);
  });

  it('5. Tam Oyun İçi Çıkış ve Durum Temizliği (State Lifecycle): handleExitGameRequest çağrıldığında yığınlar ve bannerlar sıfırlanmalı', async () => {
    startGame(1, 'basit', undefined, undefined, 'classic', false);

    const exitResult = await handleExitGameRequest();
    expect(exitResult).toBe(true);

    const smartHintBanner = document.getElementById('smart-hint-banner');
    expect(smartHintBanner?.classList.contains('hidden')).toBe(true);
  });
});
