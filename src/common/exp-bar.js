import Phaser from "../lib/phaser.js";
import { EXP_BAR_ASSET_KEYS, HEALTH_BAR_ASSET_KEYS } from "../assets/asset-keys.js";
import { AnimatedBar } from "./animated-bar.js";

export class ExpBar extends AnimatedBar {

    /**
     * 
     * @param {Phaser.Scene} scene the Phaser 3 scene the battle menu will be added to 
     * @param {number} x
     * @param {number} y
     * @param {number} [width=360]
     * @param {number} [scaleY=0.4]
     */
    constructor(scene, x, y, width = 360, scaleY = 0.4) {
        super({
            scene,
            x,
            y,
            width,
            scaleY,
            leftCapAssetKey: EXP_BAR_ASSET_KEYS.EXP_LEFT_CAP,
            leftShadowCapAssetKey: HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW,
            middleCapAssetKey: EXP_BAR_ASSET_KEYS.EXP_MIDDLE,
            middleShadowCapAssetKey: HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW,
            rightCapAssetKey: EXP_BAR_ASSET_KEYS.EXP_RIGHT_CAP                                                                      ,
            rightShadowCapAssetKey: HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW,
        });


    }
}