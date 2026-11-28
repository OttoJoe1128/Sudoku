// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui';
import { setLang } from '../i18n/translations';

describe('Faz IV — Adım 2: Harita ve Çatallanma Topoğrafyası', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    UIManager.navigate('map');
  });

  it('1. Biyom Zemin Geçişleri: 300, 700 ve 1000 seviyelerinde zemin teması değişmeli', () => {
    UIManager.renderMap(50, 1, 55, () => {});
    const scrollArea = document.getElementById('map-scroll-area');
    expect(scrollArea?.className).toContain('from-emerald-950');

    UIManager.renderMap(350, 340, 360, () => {});
    expect(scrollArea?.className).toContain('from-amber-950');

    UIManager.renderMap(800, 790, 810, () => {});
    expect(scrollArea?.className).toContain('from-rose-950');
  });

  it('2. 50. Bölüm Muazzam Bölge Rün Kapısı: 50. seviyede ⛩️ Kadim Rün Kapısı çerçevesi render edilmeli', () => {
    UIManager.renderMap(50, 45, 55, () => {});
    const gateBtn = document.querySelector('[data-map-gate="50"]');
    expect(gateBtn).not.toBeNull();

    const node50 = document.getElementById('map-node-50');
    expect(node50?.innerHTML).toContain('Kadim Rün Kapısı');
  });

  it('3. Çatallanan Yollar (Branching Nodes): Sonu 4 ve 7 ile biten seviyelerde Risk ve Hız levhaları olmalı', () => {
    UIManager.renderMap(10, 1, 15, () => {});

    const node4 = document.getElementById('map-node-4');
    const node7 = document.getElementById('map-node-7');

    expect(node4?.innerHTML).toContain('Risk');
    expect(node4?.innerHTML).toContain('Hız');

    expect(node7?.innerHTML).toContain('Risk');
    expect(node7?.innerHTML).toContain('Hız');
  });

  it('4. Sis Perdesi (Fog of War): Güncel seviyenin 2 adım ötesindeki düğümler puslu olmalı', () => {
    UIManager.renderMap(5, 1, 15, () => {});

    const currentActiveNode = document.getElementById('map-node-5');
    const futureFoggyNode = document.getElementById('map-node-10');

    expect(currentActiveNode?.style.filter).toBe('');
    expect(futureFoggyNode?.style.filter).toContain('blur');
    expect(futureFoggyNode?.style.opacity).toBe('0.45');
  });
});
