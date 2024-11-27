import { HEALTH_BAR_ASSET_KEYS } from "../assets/asset-keys.js";
import Phaser from "../lib/phaser.js";

/**
 * @typedef AnimatedBarConfig
 * @type {object}
 * @property {Phaser.Scene} scene the Phaser 3 scene the battle menu will be added to 
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} [scaleY=0.7]
 * @property {string} leftCapAssetKey
 * @property {string} middleCapAssetKey
 * @property {string} rightCapAssetKey
 * @property {string} leftShadowCapAssetKey
 * @property {string} middleShadowCapAssetKey
 * @property {string} rightShadowCapAssetKey
 */

export class AnimatedBar {
    /** @protected @type {Phaser.Scene} */
    _scene;
    /** @protected @type {Phaser.GameObjects.Container} */
    _container
    /** @protected @type {number} */
    _fullWidth
    /**@protected  @type {number} */
    _scaleY
    /** @protected @type {Phaser.GameObjects.Image} */
    _leftCap
    /** @protected @type {Phaser.GameObjects.Image} */
    _midCap
    /** @protected  @type {Phaser.GameObjects.Image} */
    _rightCap
    /** @protected @type {Phaser.GameObjects.Image} */
    _leftShadowCap
    /** @protected @type {Phaser.GameObjects.Image} */
    _midShadowCap
    /** @protected @type {Phaser.GameObjects.Image} */
    _rightShadowCap
    /** @protected @type {AnimatedBarConfig} */
    _config;

    /**
     * @param {AnimatedBarConfig} config the configuration used for this Animated bar component
     */
    constructor(config) {
        this._scene = config.scene;
        if (this.constructor === AnimatedBar) {
            throw new Error('AnimatedBar is an abstract class and cannot instantiated.');
        }
        this._fullWidth = config.width;
        this._scaleY = config.scaleY;
        this._config = config;

        this._container = this._scene.add.container(config.x, config.y, []);
        this._createBarShadowImages(config.x, config.y);
        this._createBarImages(config.x, config.y);
        this._setMeterPercentage(1);

    }

    get container() {
        return this._container;
    }

    /**
     * @param {number} x the x position to place the animated bar game object
     * @param {number} y the y position to place the animated bar game object
     * @returns {void}
     */
    _createBarShadowImages(x, y) {
        this._leftShadowCap = this._scene.add.image(x, y, this._config.leftShadowCapAssetKey).setOrigin(0, 0.5).setScale(1, this._scaleY);
        this._midShadowCap = this._scene.add.image(this._leftShadowCap.x + this._leftShadowCap.width, y, this._config.middleShadowCapAssetKey).setOrigin(0, 0.5).setScale(1, this._scaleY);
        this._rightShadowCap = this._scene.add.image(this._midShadowCap.x + this._midShadowCap.displayWidth, y, this._config.rightShadowCapAssetKey).setOrigin(0, 0.5).setScale(1, this._scaleY);
        this._midShadowCap.displayWidth = this._fullWidth;
        this._container.add([this._leftShadowCap, this._midShadowCap, this._rightShadowCap]);
    }

    /**
     * @param {number} x the x position to place the animated bar game object
     * @param {number} y the y position to place the animated bar game object
     * @returns {void}
     */
    _createBarImages(x, y) {
        this._leftCap = this._scene.add.image(x, y, this._config.leftCapAssetKey).setOrigin(0, 0.5).setScale(1, this._scaleY);
        this._midCap = this._scene.add.image(this._leftCap.x + this._leftCap.width, y, this._config.middleCapAssetKey).setOrigin(0, 0.5).setScale(1, this._scaleY);
        this._rightCap = this._scene.add.image(this._midCap.x + this._midCap.displayWidth, y, this._config.rightCapAssetKey).setOrigin(0, 0.5).setScale(1, this._scaleY);

        this._container.add([this._leftCap, this._midCap, this._rightCap]);
    }

    /**
     * @param {number} [percent=1] a number bewteen 0 and 1 that is used for setting how filled the animated bar is
     */
    _setMeterPercentage(percent = 1) {
        const width = this._fullWidth * percent;
        this._midCap.displayWidth = width;
        this._updateBarGameObjects();
    }

    _updateBarGameObjects() {
        this._rightCap.x = this._midCap.x + this._midCap.displayWidth;
        const isVisible = this._midCap.displayWidth > 0;
        this._leftCap.visible = isVisible;
        this._midCap.visible = isVisible;
        this._rightCap.visible = isVisible;
    }



    /**
     * @param {number} [percent=1] a number bewteen 0 and 1 that is used for setting how filled the animated bar is
     * @param {Object} [options] 
     * @param {number} [options.duration=1000] 
     * @param {() => void} [options.callback]
     * @param {boolean} [options.skipBattleAnimations=false] 
     */
    setMeterPercentageAnimated(percent, options) {
        const width = this._fullWidth * percent;


        if (options?.skipBattleAnimations) {
            this._setMeterPercentage(percent);
            if (options?.callback) {
                options.callback();
            }
            return;
        }

        this._scene.tweens.add({
            targets: this._midCap,
            displayWidth: width,
            duration: options?.duration || options?.duration === 0 ? 0 : 1000, ease: Phaser.Math.Easing.Sine.Out,
            onUpdate: () => {
                this._updateBarGameObjects();
            },
            onComplete: options?.callback,
        });
    }
}