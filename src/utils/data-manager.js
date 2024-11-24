import { MONSTER_ASSET_KEYS } from "../assets/asset-keys.js";
import { DIRECTION } from "../common/direction.js";
import { BATTLE_SCENE_OPTIONS, BATTLE_STYLE_OPTIONS, SOUND_OPTIONS, TEXT_SPEED_OPTIONS } from "../common/options.js";
import { TEXT_SPEED, TILE_SIZE } from "../config.js";
import Phaser from "../lib/phaser.js";
import { DataUtils } from "./data-utils.js";
import { exhaustiveGuard } from "./guard.js";

const LOCAL_STORAGE_KEY = 'MONSTER_TAMER_DATA';

/**
 * @typedef MonsterData
 * @type {object}
 * @property {import('../types/typedef.js').Monster[]} inParty
 */


/**
 * @typedef GlobalState
 * @type {object}
 * @property {object} player
 * @property {object} player.position
 * @property {object} player.position.x
 * @property {object} player.position.y
 * @property {import("../common/direction.js").Direction} player.direction
 * @property {object} options
 * @property {import("../common/options.js").TextSpeedMenuOptions} options.textSpeed
 * @property {import("../common/options.js").BattleSceneMenuOptions} options.battleSceneAnimations
 * @property {import("../common/options.js").BattleStyleMenuOptions} options.battleStyle
 * @property {import("../common/options.js").SoundMenuOptions} options.sound
 * @property {import("../common/options.js").VolumeMenuOptions} options.volume
 * @property {import("../common/options.js").MenuColorOptions} options.menuColor
 * @property {boolean} gameStarted
 * @property {MonsterData} monsters
 * @property {import("../types/typedef.js").Inventory} inventory
 */

/** @type {GlobalState} */
const initialState = {
  player: {
    position: {
      x: 6 * TILE_SIZE,
      y: 21 * TILE_SIZE
    },
    direction: DIRECTION.DOWN,
  },
  options: {
    textSpeed: TEXT_SPEED_OPTIONS.MID,
    battleSceneAnimations: BATTLE_SCENE_OPTIONS.ON,
    battleStyle: BATTLE_STYLE_OPTIONS.SHIFT,
    sound: SOUND_OPTIONS.ON,
    volume: 4,
    menuColor: 0,
  },
  gameStarted: false,
  monsters: {
    inParty: [],
  },
  inventory: [
    {
      item: {
        id: 1,
      },
      quantity: 1,
    },
  ],
};

export const DATA_MANAGER_STORE_KEYS = Object.freeze({
  PLAYER_POSITION: 'PLAYER_POSITION',
  PLAYER_DIRECTION: 'PLAYER_DIRECTION',
  OPTIONS_TEXT_SPEED: 'OPTIONS_TEXT_SPEED',
  OPTIONS_BATTLE_SCENE_ANIMATIONS: 'OPTIONS_BATTLE_SCENE_ANIMATIONS',
  OPTIONS_BATTLE_STYLE: 'OPTIONS_BATTLE_STYLE',
  OPTIONS_SOUND: 'OPTIONS_SOUND',
  OPTIONS_VOLUME: 'OPTIONS_VOLUME',
  OPTIONS_MENU_COLOR: 'OPTIONS_MENU_COLOR',
  GAME_STARTED: 'GAME_STARTED',
  MONSTERS_IN_PARTY: 'MONSTERS_IN_PARTY',
  INVENTORY: 'INVENTORY',
});

class DataManager extends Phaser.Events.EventEmitter {
  /** @type {Phaser.Data.DataManager} */
  #store;

  constructor() {
    super();
    this.#store = new Phaser.Data.DataManager(this);
    this.#updateDataManager(initialState);
  }

  /** @type {Phaser.Data.DataManager} */
  get store() {
    return this.#store;
  }

  /**
   * @param {Phaser.Scene} scene 
   * @returns {void}
   */
  init(scene) {
    const startingMonster = DataUtils.getMonsterById(scene, 1);
    this.#store.set(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY, [startingMonster]);
  }

  /**
   * @returns {void}
   */
  loadData() {
    if (typeof Storage === 'undefined') {
      console.warn(`[${DataManager.name}:loadData] localStorage is not supported, will not able to save and load data`);
      return;
    }

    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData === null) {
      return;
    }
    try {
      const parsedData = JSON.parse(savedData);
      this.#updateDataManager(parsedData);
    } catch (error) {
      console.warn(`[${DataManager.name}:loadData] encountered an error while attempting to load and parse saved data.`);
    }
  }

  saveData() {
    if (typeof Storage === 'undefined') {
      console.warn(`[${DataManager.name}:saveData] localStorage is not supported, will not able to save and load data`);
      return;
    }

    const dataToSave = this.#dataManagerDataToGlobalStateObject();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  }

  /**
   * @param {Phaser.Scene} scene 
   * @returns {void}
   */
  startNewGame(scene) {
    //get existing data before resetting all of the data, so we can persist options data
    const existingData = { ...this.#dataManagerDataToGlobalStateObject() };
    existingData.player.position = { ...initialState.player.position };
    existingData.player.direction = initialState.player.direction;
    existingData.gameStarted = initialState.gameStarted;
    existingData.monsters = {
      inParty: [...initialState.monsters.inParty],
    };
    existingData.inventory = initialState.inventory;

    this.#store.reset();
    this.#updateDataManager(existingData);
    this.init(scene);
    this.saveData();
  }



  /**
   * @returns {number}
   */
  getAnimatedTextSpeed() {
    /** @type {import('../common/options.js').TextSpeedMenuOptions | undefined} */
    const chosenTextSpeed = this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED);
    if (chosenTextSpeed === undefined) {
      return TEXT_SPEED.MEDIUM;
    }

    switch (chosenTextSpeed) {
      case TEXT_SPEED_OPTIONS.FAST:
        return TEXT_SPEED.FAST;
      case TEXT_SPEED_OPTIONS.MID:
        return TEXT_SPEED.MEDIUM;
      case TEXT_SPEED_OPTIONS.SLOW:
        return TEXT_SPEED.SLOW;
      default:
        exhaustiveGuard(chosenTextSpeed);
    }
  }

  /**
   * @param {Phaser.Scene} scene 
   * @returns {import("../types/typedef.js").InventoryItem[]}
   */
  getInventory(scene) {
    /** @type {import("../types/typedef.js").InventoryItem[]} */
    const items = [];
    /** @type {import("../types/typedef.js").Inventory} */
    const inventory = this.#store.get(DATA_MANAGER_STORE_KEYS.INVENTORY);
    inventory.forEach((baseItem) => {
      const item = DataUtils.getItem(scene, baseItem.item.id);
      items.push({
        item: item,
        quantity: baseItem.quantity,
      });
    });
    return items;
  }

  /**
   * @param {import("../types/typedef.js").InventoryItem[]} items 
   * @returns {void}
   */
  updateInventory(items) {
    const inventory = items.map((item) => {
      return {
        item: {
          id: item.item.id,
        },
        quantity: item.quantity 
      }; 
    });
    this.#store.set(DATA_MANAGER_STORE_KEYS.INVENTORY, inventory);
  }

  /**
   * 
   * @param {GlobalState} data 
   * @returns {void}
   */
  #updateDataManager(data) {
    this.#store.set({
      [DATA_MANAGER_STORE_KEYS.PLAYER_POSITION]: data.player.position,
      [DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION]: data.player.direction,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED]: data.options.textSpeed,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS]: data.options.battleSceneAnimations,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_STYLE]: data.options.battleStyle,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND]: data.options.sound,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME]: data.options.volume,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR]: data.options.menuColor,
      [DATA_MANAGER_STORE_KEYS.GAME_STARTED]: data.gameStarted,
      [DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY]: data.monsters.inParty,
      [DATA_MANAGER_STORE_KEYS.INVENTORY]: data.inventory,
    });
  }

  #dataManagerDataToGlobalStateObject() {
    return {
      player: {
        position: {
          x: this.#store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION).x,
          y: this.#store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION).y,
        },
        direction: this.#store.get(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION),
      },
      options: {
        textSpeed: this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED),
        battleSceneAnimations: this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS),
        battleStyle: this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_STYLE),
        sound: this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND),
        volume: this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME),
        menuColor: this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR),
      },
      gameStarted: this.#store.get(DATA_MANAGER_STORE_KEYS.GAME_STARTED),
      monsters: {
        inParty: [...this.#store.get(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY)],
      },
      inventory: this.#store.get(DATA_MANAGER_STORE_KEYS.INVENTORY),
    };
  }
}

export const dataManager = new DataManager();

