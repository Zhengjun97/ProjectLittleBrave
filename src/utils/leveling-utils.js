/**
 * @typedef statChanges
 * @type {object}
 * @property {number} level 
 * @property {number} health 
 * @property {number} attack 
 */


export function totalExpNeededForLevel(level) {
    if (level > 100) {
        return 100 ** 3;
    }
    return level ** 3;
}

export function calculateExpBarCurrentValue(currentLevel, currentExp) {
    const expNeededForCurrentLevel = totalExpNeededForLevel(currentLevel);
    let currentExpForBar = currentExp - expNeededForCurrentLevel;
    if (currentExpForBar < 0) {
        currentExpForBar = 0;
    }
    const expForNextLevel = totalExpNeededForLevel(currentLevel + 1);
    const maxExpForBar = expForNextLevel - expNeededForCurrentLevel;

    return currentExpForBar / maxExpForBar;
}

export function expNeedForNextLevel(currentLevel, currentExp) {
    if (currentLevel >= 100) {
        return 0;
    }
    return totalExpNeededForLevel(currentLevel + 1) - currentExp;
}

export function calculatedExpGainedFromMonster(baseExp, currentLevel, isActiveMonster) {
    return Math.round(((baseExp * currentLevel) / 7) * (1 / (isActiveMonster ? 1 : 2)));
}

/**
 * @param {import("../types/typedef").Monster} monster 
 * @param {number} gainedExp 
 * @returns {statChanges}
 */
export function handleMonsterGainingExp(monster, gainedExp) {
    const statChanges = {
        level: 0,
        health: 0,
        attack: 0,
    };

    if (monster.currentLevel >= 100) {
        return statChanges;
    }

    monster.currentExp += gainedExp;
    let gainedLevel = false;
    do {
        gainedLevel = false;
        const expRequiredForNextLevel = totalExpNeededForLevel(monster.currentLevel + 1);
        if (monster.currentExp >= expRequiredForNextLevel) {
            monster.currentLevel += 1;
            const bonusAttack = Phaser.Math.Between(0,1);
            const bonusHealth = Phaser.Math.Between(0,3);
            const hpIncrease = 5 + bonusHealth;
            const atkIncrease = 1 + bonusAttack;
            monster.maxHp += hpIncrease;
            monster.currentAttack += atkIncrease;
            statChanges.level += 1;
            statChanges.health += hpIncrease;
            statChanges.attack += atkIncrease;
            
            gainedLevel = true;
        }
    }while (gainedLevel);

    return statChanges;
}