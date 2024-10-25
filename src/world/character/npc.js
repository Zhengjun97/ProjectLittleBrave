import { CHARACTER_ASSET_KEYS } from "../../assets/asset-keys.js";
import { DIRECTION } from "../../common/direction.js";
import { exhaustiveGuard } from "../../utils/guard.js";
import { Character } from "./character.js";


/**
 * @typedef {Omit<import('./character').CharacterConfig, 'assetKey' | 'idleFrameConfig'> & {frame: number, messages: string[]}} NPCConfig
 */

export class NPC extends Character {
    /** @type {string[]} */
    #messages;
    /**
     * @param {NPCConfig} config
     */
    constructor(config) {
      super({
        ...config,
        assetKey: CHARACTER_ASSET_KEYS.NPC,
        origin: { x: 0, y: 0 },
        idleFrameConfig: {
          DOWN: config.frame,
          UP: config.frame + 1,
          NONE: config.frame,
          LEFT: config.frame + 2,
          RIGHT: config.frame + 2,
        },
      });
      
      this.#messages = config.messages;
      this._phaserGameObject.setScale(4);
    }

    /** @type {string[]} */
    get messages() {
        return [...this.#messages];
    }

    /**
     * @param {import("../../common/direction.js").Direction} playerDirection
     * @returns {void} 
     */
    facePlayer(playerDirection){
        switch(playerDirection){
            case DIRECTION.DOWN:
                this._phaserGameObject.setFrame(this._idleFrameConfig.UP).setFlipX(false);
                break;
            case DIRECTION.LEFT:
                this._phaserGameObject.setFrame(this._idleFrameConfig.RIGHT).setFlipX(false);
                break;
            case DIRECTION.RIGHT:
                this._phaserGameObject.setFrame(this._idleFrameConfig.LEFT).setFlipX(true);
                break;
            case DIRECTION.UP:
                this._phaserGameObject.setFrame(this._idleFrameConfig.DOWN).setFlipX(false);
                break;
            case DIRECTION.NONE:
                break;
            default:
                exhaustiveGuard(playerDirection);
        }
    }
}