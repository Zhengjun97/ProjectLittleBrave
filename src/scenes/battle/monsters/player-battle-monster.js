import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../../../assets/font-keys.js";
import { ExpBar } from "../../../common/exp-bar.js";
import { calculateExpBarCurrentValue, handleMonsterGainingExp } from "../../../utils/leveling-utils.js";
import { BattleMonster } from "./battle-monster.js";

/**
 * @type {import("../../../types/typedef.js").Coordinate}
 */
const PLAYER_POSITION = Object.freeze({
    x: 256,
    y: 316,
})

export class PlayerBattleMonster extends BattleMonster {
    /**@type {Phaser.GameObjects.Text} */
    #healthBarTextGameObject;
    /**@type {ExpBar} */
    #expBar;

    /**
     * @param {import("../../../types/typedef.js").BattleMonsterConfig} config
     */
    constructor(config) {
        super(config, PLAYER_POSITION);
        this._phaserGameObject.setScale(1).setFlipX(true);
        this._phaserHealthBarGameContainer.setPosition(556, 318);

        this.#addHealthBarComponents();
        this.#addExpBarComponents();
    }

    #setHealthBarText() {
        this.#healthBarTextGameObject.setText(`${this._currentHealth}/${this._maxHealth}`);
    }

    #addHealthBarComponents() {
        this.#healthBarTextGameObject = this._scene.add.text(443, 80, '', { fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME, color: '#7E3D3F', fontSize: '16px', }).setOrigin(1, 0);

        this.#setHealthBarText();
        this._phaserHealthBarGameContainer.add(this.#healthBarTextGameObject);

    }

    /**
     * @param {number} damage 
     * @param {()=> void} [callback] 
     */
    takeDamage(damage, callback) {
        super.takeDamage(damage, callback);
        this.#setHealthBarText();
    }

    /**
 * @param {() => void} callback 
 * @returns {void}
 */
    playMonsterAppearAnimation(callback) {
        const startXPos = -30;
        const endXPos = PLAYER_POSITION.x;
        this._phaserGameObject.setPosition(startXPos, PLAYER_POSITION.y);
        this._phaserGameObject.setAlpha(1);

        if (this._skipBattleAnimations) {
            this._phaserGameObject.setX(endXPos);
            callback();
            return;
          }
        
        this._scene.tweens.add({
            delay: 0,
            duration: 800,
            x: {
                from: startXPos,
                start: startXPos,
                to: endXPos,
            },
            targets: this._phaserGameObject,
            onComplete: () => {
                callback();
            },
        });
    }

    /**
     * @param {() => void} callback 
     * @returns {void}
     */
    playMonsterHealthBarAppearAnimation(callback) {
        const startXPos = 800;
        const endXPos = this._phaserHealthBarGameContainer.x;
        this._phaserHealthBarGameContainer.setPosition(startXPos, this._phaserHealthBarGameContainer.y);
        this._phaserHealthBarGameContainer.setAlpha(1);

        if (this._skipBattleAnimations) {
            this._phaserHealthBarGameContainer.setX(endXPos);
            callback();
            return;
          }
        
        this._scene.tweens.add({
            delay: 0,
            duration: 800,
            x: {
                from: startXPos,
                start: startXPos,
                to: endXPos,
            },
            targets: this._phaserHealthBarGameContainer,
            onComplete: () => {
                callback();
            },
        });
    }

    /**
     * @param {() => void} callback 
     * @returns {void}
     */
    playDeathAnimation(callback) {
        const startYPos = this._phaserGameObject.y;
        const endYPos = startYPos + 400;

        if (this._skipBattleAnimations) {
            this._phaserGameObject.setY(endYPos);
            callback();
            return;
          }
        
        this._scene.tweens.add({
            delay: 0,
            duration: 2000,
            y: {
                from: startYPos,
                start: startYPos,
                to: endYPos,
            },
            targets: this._phaserGameObject,
            onComplete: () => {
                callback();
            },
        });
    }

    /**
     * @param {number} updatedHp 
     * @returns {void}
     */
    updateMonsterHealth(updatedHp) {
        this._currentHealth = updatedHp;
        if (this._currentHealth > this._maxHealth) {
            this._currentHealth = this._maxHealth;
        }
        this._healthBar.setMeterPercentageAnimated(this._currentHealth / this._maxHealth, {
            skipBattleAnimations: true,
        });
        this.#setHealthBarText();
    }

    /**
     * @returns {void}
     */
    #addExpBarComponents() {
        this.#expBar = new ExpBar(this._scene, 34, 54);
        this.#expBar.setMeterPercentageAnimated(
            calculateExpBarCurrentValue(this._monsterDetails.currentLevel, this._monsterDetails.currentExp), 
            {skipBattleAnimations: true});

        const monsterExpText = this._scene.add.text(30, 100, 'EXP', {
            fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
            color: '#6505FF',
            fontSize: '14px',
            fontStyle: 'italic',
        });
        this._phaserHealthBarGameContainer.add([monsterExpText,this.#expBar.container]);
    }

    /**
     * @param {number} gainedExp 
     * @returns {import("../../../utils/leveling-utils.js").statChanges}
     */
    updateMonsterExp(gainedExp) {
        return handleMonsterGainingExp(this._monsterDetails, gainedExp);
    }

    /**
     * @param {()=> void} callback 
     * @param {boolean} levelUp 
     * @returns {void}
     */
    updateMonsterExpBar(callback, levelUp) {
        const cb = () => {
            this._setMonsterLevelText();
            this._maxHealth = this._monsterDetails.maxHp;
            this.updateMonsterHealth(this._currentHealth);
            callback();
        }

        if (levelUp) {
            this.#expBar.setMeterPercentageAnimated(
                1, {
                    callback: () => {
                        this._scene.time.delayedCall(500, ()=>{
                            this.#expBar.setMeterPercentageAnimated(0, {skipBattleAnimations: true});
                            this.#expBar.setMeterPercentageAnimated(calculateExpBarCurrentValue(this._monsterDetails.currentLevel, this._monsterDetails.currentExp), {
                                callback: cb,
                            });
                        });
                    }
                }
            );

            return;
        }
        this.#expBar.setMeterPercentageAnimated(calculateExpBarCurrentValue(this._monsterDetails.currentLevel, this._monsterDetails.currentExp), {
            callback: cb,
        });
    }

}