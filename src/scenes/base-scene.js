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
        if (data) {
            this._log(`[${this.constructor.name}:init] invoked, , data provied: ${JSON.stringify(data)}`);
            return;
        }
        this._log(`[${this.constructor.name}:init] invoked`);
    }

    preload() {
        this._log(`[${this.constructor.name}:preload] invoked`);
    }
    create() {
        this._log(`[${this.constructor.name}:create] invoked`);

        this._contorls = new Controls(this);
        this.events.on(Phaser.Scenes.Events.RESUME, this.handleSceneResume, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneCleanUp, this);

        this.scene.bringToTop();
    }

    update(time){

    }

    handleSceneResume(sys, data) {
        this._contorls.lockInput = false;
        if (data) {
            this._log(`[${this.constructor.name}:handleSceneResume] invoked, data provied: ${JSON.stringify(data)}`);
            return;
        }
        this._log(`[${this.constructor.name}:handleSceneResume] invoked`);

    }

    handleSceneCleanUp() {
        this._log(`[${this.constructor.name}:handleSceneCleanUp] invoked`);
        this.events.off(Phaser.Scenes.Events.RESUME, this.handleSceneResume, this);
    }

    _log(message) {
        console.log(`%c${message}`, 'color: orange; background: black;');
    }
}