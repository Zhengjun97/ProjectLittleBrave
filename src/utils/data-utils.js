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

  /**
 * Utility function for retrieving the Item objects from the items.json data file.
 * @param {Phaser.Scene} scene the Phaser 3 Scene to get cached JSON file from
 * @param {number} itemId the id of the item to retrieve from the item.json file
 * @returns {import('../types/typedef.js').Item | undefined}}
 */
  static getItem(scene, itemId) {
    /**@type {import('../types/typedef.js').Item[]} */
    const data = scene.cache.json.get(DATA_ASSET_KEYS.ITEMS);

    return data.find((item) => item.id === itemId);
  }

  /**
 * Utility function for retrieving the Item objects from the items.json data file.
 * @param {Phaser.Scene} scene the Phaser 3 Scene to get cached JSON file from
 * @param {number[]} itemIds the list of id of the item to retrieve from the item.json file
 * @returns {import('../types/typedef.js').Item[] | undefined}
 */
  static getItems(scene, itemIds) {
    /**@type {import('../types/typedef.js').Item[]} */
    const data = scene.cache.json.get(DATA_ASSET_KEYS.ITEMS);
    return data.filter((item) => {
      return itemIds.some((id) => id === item.id);
    });

  }

  /**
 * Utility function for retrieving a Monster object from the monsters.json data file.
 * @param {Phaser.Scene} scene the Phaser 3 Scene to get cached JSON file from
 * @param {number} monsterId the monster id to retrieve from the monsters.json file
 * @returns {import('../types/typedef.js').Monster}
 */
  static getMonsterById(scene, monsterId) {
    /** @type {import('../types/typedef.js').Monster[]} */
    const data = scene.cache.json.get(DATA_ASSET_KEYS.MONSTERS);
    return data.find((monster) => monster.id === monsterId);
  }

  /**
  * @param {Phaser.Scene} scene the Phaser 3 Scene to get cached JSON file from
  * @param {number} areaId
  * @returns {number[][]}
  */
  static getEncounterAreaDetails(scene, areaId) {
    /** @type {import('../types/typedef.js').EncounterData} */
    const data = scene.cache.json.get(DATA_ASSET_KEYS.ENCOUNTERS);
    return data[areaId];
  }
}