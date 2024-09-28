import { HEALTH_BAR_ASSET_KEYS } from "../../../../assets/asset-keys.js";
import Phaser from "../../../../lib/phaser.js";

export class HealthBar {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {Phaser.GameObjects.Container} */
    #healthBarContainer
    /** @type {number} */
    #fullWidth
    /** @type {number} */
    #scaleY

    /**
     * 
     * @param {Phaser.Scene} scene the Phaser 3 scene the battle menu will be added to 
     * @param {number} x
     * @param {number} y
     */
    constructor(scene, x , y) {
        this.#scene = scene;
        this.#fullWidth = 360;
        this.#scaleY = 0.7;
        this.#healthBarContainer = this.#scene.add.container(x, y, []);
        this.#createHPImages(x, y);
    }

    get container() {
        return this.#healthBarContainer;
    }

    /**
     * 
     * @param {number} x the x position to place the health bar container
     * @param {number} y the y position to place the health bar container
     * @returns {void}
     */
    #createHPImages(x,y) {
        const leftCap = this.#scene.add.image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP).setOrigin(0,0.5).setScale(1, this.#scaleY);
        const midCap = this.#scene.add.image(leftCap.x + leftCap.width, y, HEALTH_BAR_ASSET_KEYS.MIDDLE).setOrigin(0,0.5).setScale(1, this.#scaleY);
        midCap.displayWidth = 360;
        const rightCap = this.#scene.add.image(midCap.x + midCap.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP).setOrigin(0,0.5).setScale(1, this.#scaleY);
        
        this.#healthBarContainer.add([leftCap, midCap, rightCap]);
    }
}