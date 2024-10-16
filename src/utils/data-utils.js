import { DATA_ASSET_KEYS } from '../assets/asset-keys.js';

export class DataUtils {
    static getMonsterAttack(scene, attackId) {
        /**@type {import('../types/typedef.js').Attack[]} */
        const data = scene.cache.json.get(DATA_ASSET_KEYS.ATTACKS);

        return data.find((attack) => attack.id === attackId);
    }

    /**
     * Utility function for retrieving the Animation objects from the animations.json data file.
     * @param {Phaser.Scene} scene the Phaser 3 Scene to get cached JSON file from
     * @returns {import('../types/typedef.js').Animation[]}
     */
    static getAnimations(scene) {
        /** @type {import('../types/typedef.js').Animation[]} */
        const data = scene.cache.json.get(DATA_ASSET_KEYS.ANIMATIONS);
        return data;
    }
}