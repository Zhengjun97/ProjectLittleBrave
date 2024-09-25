/**
 * @typedef {keyof typeof BATTLE_MENU_OPTION} BattleMenuOpt
 */

/** @enum {BattleMenuOpt} */
export const BATTLE_MENU_OPTION = Object.freeze({
    FIGHT: 'FIGHT',
    SWITCH: 'SWITCH',
    ITEM: 'ITEM',
    RUN: 'RUN',
});

/**
 * @typedef {keyof typeof ATTACK_MOVE_OPT} AttackMoveOpt
 */

/** @enum {AttackMoveOpt} */
export const ATTACK_MOVE_OPT = Object.freeze({
    MOVE_1: 'MOVE_1',
    MOVE_2: 'MOVE_2',
    MOVE_3: 'MOVE_3',
    MOVE_4: 'MOVE_4',
});

/**
 * @typedef {keyof typeof ACTIVE_BATTLE_MENU} ActiveBattleMenu
 */

/** @enum {ActiveBattleMenu} */
export const ACTIVE_BATTLE_MENU = Object.freeze({
    BATTLE_MAIN: 'BATTLE_MAIN',
    BATTLE_MOVE_SELECT: 'BATTLE_MOVE_SELECT',
    BATTLE_ITEM: 'BATTLE_ITEM',
    BATTLE_SWITCH: 'BATTLE_SWITCH',
    BATTLE_RUN: 'BATTLE_RUN',
});
