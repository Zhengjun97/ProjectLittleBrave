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
    /** @type {Phaser.GameObjects.Image} */
    #leftCap
    /** @type {Phaser.GameObjects.Image} */
    #midCap
    /** @type {Phaser.GameObjects.Image} */
    #rightCap
    /** @type {Phaser.GameObjects.Image} */
    #leftShadowCap
    /** @type {Phaser.GameObjects.Image} */
    #midShadowCap
    /** @type {Phaser.GameObjects.Image} */
    #rightShadowCap

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
        this.#createHealthBarShadowImages(x, y);
        this.#createHPImages(x, y);
        this.#setMeterPercentage(1);
        
    }

    get container() {
        return this.#healthBarContainer;
    }

    /**
     * @param {number} x the x position to place the health bar game object
     * @param {number} y the y position to place the health bar game object
     * @returns {void}
     */
    #createHealthBarShadowImages(x, y) {
        this.#leftShadowCap = this.#scene.add.image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW).setOrigin(0,0.5).setScale(1, this.#scaleY);
        this.#midShadowCap = this.#scene.add.image(this.#leftShadowCap.x + this.#leftShadowCap.width, y, HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW).setOrigin(0,0.5).setScale(1, this.#scaleY);
        this.#rightShadowCap = this.#scene.add.image(this.#midShadowCap.x + this.#midShadowCap.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW).setOrigin(0,0.5).setScale(1, this.#scaleY);
        this.#midShadowCap.displayWidth = this.#fullWidth;
        this.#healthBarContainer.add([this.#leftShadowCap, this.#midShadowCap, this.#rightShadowCap]);
    }

    /**
     * @param {number} x the x position to place the health bar game object
     * @param {number} y the y position to place the health bar game object
     * @returns {void}
     */
    #createHPImages(x,y) {
        this.#leftCap = this.#scene.add.image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP).setOrigin(0,0.5).setScale(1, this.#scaleY);
        this.#midCap = this.#scene.add.image(this.#leftCap.x + this.#leftCap.width, y, HEALTH_BAR_ASSET_KEYS.MIDDLE).setOrigin(0,0.5).setScale(1, this.#scaleY);
        this.#rightCap = this.#scene.add.image(this.#midCap.x + this.#midCap.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP).setOrigin(0,0.5).setScale(1, this.#scaleY);
        
        this.#healthBarContainer.add([this.#leftCap, this.#midCap, this.#rightCap]);
    }

    /**
     * @param {number} [percent=1] a number bewteen 0 and 1 that is used for setting how filled the health bar is
     */
    #setMeterPercentage(percent = 1) {
        const width =this.#fullWidth * percent;
        this.#midCap.displayWidth = width;
        this.#rightCap.x = this.#midCap.x + this.#midCap.displayWidth;
    }

    /**
     * @param {number} [percent=1] a number bewteen 0 and 1 that is used for setting how filled the health bar is
     * @param {Object} [options] 
     * @param {number} [options.duration=1000] 
     * @param {() => void} [options.callback] 
     */
    setMeterPercentageAnimated(percent, options) {
        const width =this.#fullWidth * percent;

        this.#scene.tweens.add({
            targets: this.#midCap,
            displayWidth: width,
            duration: options?.duration || 1000,
            ease: Phaser.Math.Easing.Sine.Out,
            onUpdate: () => {
                this.#rightCap.x = this.#midCap.x + this.#midCap.displayWidth;
                const isVisible =  this.#midCap.displayWidth > 0;
                this.#leftCap.visible = isVisible;
                this.#midCap.visible = isVisible;
                this.#rightCap.visible = isVisible;
            },
            onComplete: options?.callback,
        });
    }
}