import Phaser from "../lib/phaser.js";
import { ATTACK_KEYS } from "../scenes/battle/attacks/attack-keys.js";
/**
 * @typedef BattleMonsterConfig
 * @type {Object}
 * @property {Phaser.Scene} scene
 * @property {Monster} monsterDetails
 * @property {number} [scaleHealthBarBackgroundImageByY = 1]
 * @property {boolean} [skipBattleAnimations=false] used to skip all animation tied to the monster during battle
 */

/**
 * @typedef Monster
 * @type {Object}
 * @property {number} id
 * @property {number} monsterId
 * @property {string} name
 * @property {string} assetKey
 * @property {number} [assetFrame=0]
 * @property {number} currentLevel
 * @property {number} maxHp
 * @property {number} currentHp
 * @property {number} baseAttack
 * @property {number[]} attackIds
 */

/**
 * @typedef Coordinate
 * @type {Object}
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef Attack
 * @type {Object}
 * @property {number} id
 * @property {string} name
 * @property {import("../scenes/battle/attacks/attack-keys.js").AttackKeys} animationName
 */

/**
 * @typedef Animation
 * @type {object}
 * @property {string} key
 * @property {number[]} [frames]
 * @property {number} frameRate
 * @property {number} repeat
 * @property {number} delay
 * @property {boolean} yoyo
 * @property {string} assetKey
 */