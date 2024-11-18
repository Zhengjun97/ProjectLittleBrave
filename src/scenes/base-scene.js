import Phaser from "../lib/phaser.js";
import { Controls } from "../utils/controls.js";
import { SCENE_KEYS } from "./scene-keys.js";

export class BaseScene extends Phaser.Scene {
    /** @type {Controls} */
    _contorls;

    constructor(config) {
        super(config);
        if (this.constructor === BaseScene) {
            throw new Error('BaseScene is an abstract class and cannot be instantiated directly.')
        }
    }

    init(data) {
        this._log(`[${this.constructor.name}:init] invoked`);
    }

    preload() {
        this._log(`[${this.constructor.name}:preload] invoked`);
    }
    create() {
        this._log(`[${this.constructor.name}:create] invoked`);

        this._contorls = new Controls(this);
    }

    update(time){

    }

    _log(message) {
        console.log(`%c${message}`, 'color: orange; background: black;');
    }
}