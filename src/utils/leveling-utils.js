/**
 * @typedef statChanges
 * @type {object}
 * @property {number} level 
 * @property {number} health 
 * @property {number} attack 
 */


export function calculateExpBarCurrentValue(currentLevel, currentExp) {
    return 5;
}

export function expNeedForNextLevel(currentLevel, currentExp) {
    return 5;
}

export function calculatedExpGainedFromMonster(baseExp, currentLevel, isActiveMonster) {
    return 10;
}

/**
 * @param {*} monster 
 * @param {*} gainedExp 
 * @returns {statChanges}
 */
export function handleMonsterGainingExp(monster, gainedExp) {
    const statChanges = {
        level: 1,
        health: 10,
        attack: 10,
    };

    return statChanges;
}