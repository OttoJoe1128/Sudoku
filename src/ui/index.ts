import { coreUI } from './modules/coreUI';
import { boardUI } from './modules/boardUI';
import { modalsUI } from './modules/modalsUI';
import { socialUI } from './modules/socialUI';
import { mapUI } from './modules/mapUI';
import { shopUI } from './modules/shopUI';
import { utilsUI } from './modules/utilsUI';

export * from './types';

export const UIManager = {
    ...coreUI,
    ...boardUI,
    ...modalsUI,
    ...socialUI,
    ...mapUI,
    ...shopUI,
    ...utilsUI
};
