import { BATTLE_ASSET_KEYS, HEALTH_BAR_ASSET_KEYS, MONSTER_ASSET_KEYS, MONSTER_PARTY_ASSET_KEYS, UI_ASSET_KEYS } from "../assets/asset-keys.js";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../assets/font-keys.js";
import { DIRECTION } from "../common/direction.js";
import Phaser from "../lib/phaser.js";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../utils/data-manager.js";
import { exhaustiveGuard } from "../utils/guard.js";
import { BaseScene } from "./base-scene.js";
import { HealthBar } from "./battle/ui/menu/health-bar.js";
import { SCENE_KEYS } from "./scene-keys.js";

const UI_TEXT_STYLE = Object.freeze({
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME, color: '#ffffff', fontSize: '24px',
});

const MONSTER_PARTY_POSTITION = Object.freeze({
    EVEN: {
        x: 0,
        y: 10
    },
    ODD: {
        x: 510,
        y: 40
    },
    increment: 150,
});

export class MonsterPartyScene extends BaseScene {
    /**@type {Phaser.GameObjects.Image[]} */
    #monsterPartyBackgrounds;
    /**@type {Phaser.GameObjects.Image} */
    #cancelButton;
    /**@type {Phaser.GameObjects.Text} */
    #infoTextGameObject;
    /**@type {HealthBar[]} */
    #healthBars;
    /**@type {Phaser.GameObjects.Text[]} */
    #healthBarsTextGameObjects;
    /**@type {number} */
    #selectedPartyMonsterIndex;
    /**@type {import("../types/typedef.js").Monster[]} */
    #monster;

    #sceneData;



    constructor() {
        super({
            key: SCENE_KEYS.MONSTER_PARTY_SCENE, //unique key for pharse scene
        });
    }

    init(data) {
        super.init(data);

        this.#sceneData = data;
        this.#monsterPartyBackgrounds = [];
        this.#healthBars = [];
        this.#healthBarsTextGameObjects = [];
        this.#selectedPartyMonsterIndex = 0;
        this.#monster = dataManager.store.get(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY);
    }

    create() {
        super.create();

        //create background
        this.add.rectangle(0,0, this.scale.width, this.scale.height, 0x000000, 1).setOrigin(0);
        this.add.tileSprite(0, 0, this.scale.width, this.scale.height, MONSTER_PARTY_ASSET_KEYS.PARTY_BACKGROUND, 0).setOrigin(0).setAlpha(0.7);
        //create button
        const buttonContainer = this.add.container(883, 519, []);
        this.#cancelButton = this.add.image(0, 0, UI_ASSET_KEYS.BULE_BUTTON, 0).setOrigin(0).setScale(0.7, 1).setAlpha(0.7);
        const cancleText = this.add.text(66.5, 20.6, 'cancel', UI_TEXT_STYLE).setOrigin(0.5);
        buttonContainer.add([this.#cancelButton, cancleText]);
        //create info container
        const infoContainer = this.add.container(4, this.scale.height - 69, []);
        const infoDisplay = this.add.rectangle(0, 0, 867, 65, 0xede4f3, 1).setOrigin(0).setStrokeStyle(8, 0x905ac2, 1);
        this.#infoTextGameObject = this.add.text(15, 14, 'as', {
            fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME, color: '#000000', fontSize: '23px',
        })
        infoContainer.add([infoDisplay, this.#infoTextGameObject]);
        this.#updateInfoContainerText();

        //create the character
        this.#monster.forEach((monster, index) => {
            const isEven = index % 2 === 0;
            const x = isEven ? MONSTER_PARTY_POSTITION.EVEN.x : MONSTER_PARTY_POSTITION.ODD.x;
            const y = (isEven ? MONSTER_PARTY_POSTITION.EVEN.y : MONSTER_PARTY_POSTITION.ODD.y) + MONSTER_PARTY_POSTITION.increment * Math.floor(index / 2);
            this.#createMonster(x, y, monster);
        });
        this.#movePlayerInputCursor(DIRECTION.NONE);
        //this.add.image(0,0,BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND).setOrigin(0).setScale(1.1, 1.2);

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
        const wasSpaceKeyPressed = this._contorls.wasSpaceKeyPressed();
        if (wasSpaceKeyPressed) {
            if (this.#selectedPartyMonsterIndex === -1) {
                this.#goBackToPreviousScene();
                return;
            }

            this._contorls.lockInput = true;
            const sceneDataToPass = {
                monster: this.#monster[this.#selectedPartyMonsterIndex]
            };
            this.scene.launch(SCENE_KEYS.MONSTER_DETAILS_SCENE, sceneDataToPass);
            this.scene.pause(SCENE_KEYS.MONSTER_PARTY_SCENE);
            return;
        }
        const selectedDirection = this._contorls.getDirectionKeyJustPressed();
        if (selectedDirection !== DIRECTION.NONE) {
            this.#movePlayerInputCursor(selectedDirection);
            this.#updateInfoContainerText();
        }
    }

    #updateInfoContainerText() {
        if (this.#selectedPartyMonsterIndex === -1) {
            this.#infoTextGameObject.setText('Go back to previous menu');
            return;
        }
        this.#infoTextGameObject.setText('Choose the character');
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {import("../types/typedef.js").Monster} monsterDetail
     * @returns 
     */
    #createMonster(x, y, monsterDetail) {
        const container = this.add.container(x, y, []);
        const background = this.add.image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND).setOrigin(0).setScale(1.1, 1.2);
        this.#monsterPartyBackgrounds.push(background);

        const leftShadowCap = this.add.image(160, 67, HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW).setOrigin(0).setAlpha(0.5);
        const midShadowCap = this.add.image(leftShadowCap.x + leftShadowCap.width, 67, HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW).setOrigin(0).setAlpha(0.5);
        const rightShadowCap = this.add.image(midShadowCap.x + midShadowCap.displayWidth, 67, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW).setOrigin(0).setAlpha(0.5);
        midShadowCap.displayWidth = 285;

        const healthBar = new HealthBar(this, 100, 40, 240);
        healthBar.setMeterPercentageAnimated(monsterDetail.currentHp / monsterDetail.maxHp, {
            duration: 0,
            skipBattleAnimations: true
        });
        this.#healthBars.push(healthBar);

        const monsterNameGameText = this.add.text(162, 36, monsterDetail.name, { fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME, color: '#ffffff', fontSize: '30px' });


        const monsterHealthBarLevelText = this.add.text(26, 116, `Lv. ${monsterDetail.currentLevel}`, { fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME, color: '#ffffff', fontSize: '22px' });


        const monsterHpText = this.add.text(164, 75, 'HP', { fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME, color: '#FF6505', fontSize: '24px', fontStyle: 'italic' });
        const healthBarTextGameObject = this.add.text(458, 95, `${monsterDetail.currentHp}/${monsterDetail.maxHp}`, { fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME, color: '#ffffff', fontSize: '38px', }).setOrigin(1, 0);
        this.#healthBarsTextGameObjects.push(healthBarTextGameObject);
        const monsterImage = this.add.image(35, 20, monsterDetail.assetKey).setOrigin(0).setScale(0.25);

        container.add([background, leftShadowCap, midShadowCap, rightShadowCap, healthBar.container, monsterImage, monsterNameGameText, monsterHealthBarLevelText, monsterHpText, healthBarTextGameObject]);
        return container;
    }

    #goBackToPreviousScene() {
        this._contorls.lockInput = true;
        this.scene.stop(SCENE_KEYS.MONSTER_PARTY_SCENE);
        this.scene.resume(this.#sceneData.previousSceneName);
    }

    /**
     * @param {import("../common/direction.js").Direction} direction 
     * @returns {void}
     */
    #movePlayerInputCursor(direction) {
        switch (direction) {
            case DIRECTION.UP:
                if (this.#selectedPartyMonsterIndex === -1) {
                    this.#selectedPartyMonsterIndex = this.#monster.length;
                }
                this.#selectedPartyMonsterIndex -= 1;
                if (this.#selectedPartyMonsterIndex < 0) {
                    this.#selectedPartyMonsterIndex = 0;
                }
                this.#monsterPartyBackgrounds[this.#selectedPartyMonsterIndex].setAlpha(1);
                this.#cancelButton.setTexture(UI_ASSET_KEYS.BULE_BUTTON, 0).setAlpha(0.7);
                break;
            case DIRECTION.DOWN:
                if (this.#selectedPartyMonsterIndex === -1) {
                    break;
                }
                this.#selectedPartyMonsterIndex += 1;
                if (this.#selectedPartyMonsterIndex > this.#monster.length -1) {
                    this.#selectedPartyMonsterIndex = -1;
                }
                if (this.#selectedPartyMonsterIndex === -1) {
                    this.#cancelButton.setTexture(UI_ASSET_KEYS.BULE_BUTTON_SELECTED, 0).setAlpha(1);
                    break;
                }
                this.#monsterPartyBackgrounds[this.#selectedPartyMonsterIndex].setAlpha(1);
                break;
            case DIRECTION.LEFT:
            case DIRECTION.RIGHT:
            case DIRECTION.NONE:
                break;
            default:
                exhaustiveGuard(direction);
        }

        this.#monsterPartyBackgrounds.forEach((obj, index)=>{
            if (index === this.#selectedPartyMonsterIndex) {
                return;
            }
            obj.setAlpha(0.7);
        })
    }


}