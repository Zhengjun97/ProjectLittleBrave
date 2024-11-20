import { MONSTER_PARTY_ASSET_KEYS } from "../assets/asset-keys.js";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../assets/font-keys.js";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../utils/data-manager.js";
import { DataUtils } from "../utils/data-utils.js";
import { BaseScene } from "./base-scene.js";
import { SCENE_KEYS } from "./scene-keys.js";

const UI_TEXT_STYLE = Object.freeze({
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME, color: '#ffffff', fontSize: '24px',
});

const MONSTER_MOVE_STYLE = Object.freeze({
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME, color: '#000000', fontSize: '40px',
});

export class MonsterDetailsScene extends BaseScene {
    /** @type {import("../types/typedef.js").Monster} */
    #monsterDetails;
    /** @type {import("../types/typedef.js").Attack[]} */
    #monsterAttack;

    constructor() {
        super({
            key: SCENE_KEYS.MONSTER_DETAILS_SCENE,
        });
    }

    init(data) {
        super.init(data);

        this.#monsterDetails = data.monster;
        if (this.#monsterDetails === undefined) {
            this.#monsterDetails = dataManager.store.get(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY)[0];
        }
        
        this.#monsterAttack = [];
        this.#monsterDetails.attackIds.forEach((attackId) =>{
            const monsterAttack = DataUtils.getMonsterAttack(this, attackId);
            if (monsterAttack !== undefined) {
                this.#monsterAttack.push(monsterAttack);
            }
        })
    }

    create() {
        super.create();
        
        //create main backgroud and title
        this.add.image(0,0,MONSTER_PARTY_ASSET_KEYS.MONSTER_DETAILES_BACKGROUND).setOrigin(0);
        this.add.text(10,0,'Character Details', {
            ...UI_TEXT_STYLE,
            fontSize: '48px',
        });
        //add character details
        this.add.text(20, 60, `Lv. ${this.#monsterDetails.currentLevel}`, {
            ...UI_TEXT_STYLE,
            fontSize: '40px',
        });
        this.add.text(200, 60, this.#monsterDetails.name, {
            ...UI_TEXT_STYLE,
            fontSize: '40px',
        });
        this.add.image(90,320,this.#monsterDetails.assetKey).setOrigin(0, 1).setScale(0.5);

        if (this.#monsterAttack[0] !== undefined) {
            this.add.text(560, 82, this.#monsterAttack[0].name, MONSTER_MOVE_STYLE);
        }
        if (this.#monsterAttack[1] !== undefined) {
            this.add.text(560, 162, this.#monsterAttack[1].name, MONSTER_MOVE_STYLE);
        }
        if (this.#monsterAttack[2] !== undefined) {
            this.add.text(560, 242, this.#monsterAttack[2].name, MONSTER_MOVE_STYLE);
        }
        if (this.#monsterAttack[3] !== undefined) {
            this.add.text(560, 322, this.#monsterAttack[3].name, MONSTER_MOVE_STYLE);
        }
    }

    update() {
        super.update();

        if (this._contorls.isInputLocked) {
            return;
        }
        if (this._contorls.wasBackKeyPressed()) {
            this.#goBackToPreviousScene();
            return;
        }
        if (this._contorls.wasSpaceKeyPressed()) {
            this.#goBackToPreviousScene();
            return;
        }

    }

    #goBackToPreviousScene() {
        this._contorls.lockInput = true;
        this.scene.stop(SCENE_KEYS.MONSTER_DETAILS_SCENE);
        this.scene.resume(SCENE_KEYS.MONSTER_PARTY_SCENE);
    }
}