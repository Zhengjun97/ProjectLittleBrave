import { UI_ASSET_KEYS } from "../assets/asset-keys.js";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../assets/font-keys.js";
import Phaser from "../lib/phaser.js";
import { NineSlice } from "../utils/nine-slice.js";
import { SCENE_KEYS } from "./scene-keys.js";

/** @tpye {Phaser.Type.GameObjects.Text.TextStyle} */
const OPTIONS_TEXT_STYLE = Object.freeze({
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME, color: '#ffffff', fontSize: '30px',
 });

const OPTION_MENU_OPTION_INFO_MSG = Object.freeze({
    TEXT_SPEED: 'Choose one of three text display speeds.',
    BATTLE_SCENE: 'Choose to display battle animations and effects or not.',
    BATTLE_STYLE: 'Choose to allow you to be recalled between rounds.',
    SOUND: 'Choose to enbale or disable the sound.',
    VOLUME: 'Choose the volume for the music and sound effects of the game.',
    MENU_COLOR: 'Choose one of the three menue color options.',
    CONFIRM: 'Save your changes and go back to the main menu.',
});

export class OptionsScene extends Phaser.Scene {
    /** @type {Phaser.GameObjects.Container} */
    #mainContainer;
    /** @type {NineSlice} */
    #nineSliceMainContainer;
    /** @type {Phaser.GameObjects.Group} */
    #textSpeedOptionTextGameObjects;
    /** @type {Phaser.GameObjects.Group} */
    #battleSceneOptionTextGameObjects;
    /** @type {Phaser.GameObjects.Group} */
    #battleStyleOptionTextGameObjects;
    /** @type {Phaser.GameObjects.Group} */
    #soundOptionTextGameObjects;
    /** @type {Phaser.GameObjects.Rectangle} */
    #volumeOptionsMenuCursor;
    /** @type {Phaser.GameObjects.Text} */
    #volumeOptionsVauleText;
    /** @type {Phaser.GameObjects.Text} */
    #selectedMenuColorTextGameObject;
    /** @type {Phaser.GameObjects.Container} */
    #infoContainer;
    /** @type {Phaser.GameObjects.Text} */
    #selectedOptionInfoMsgTextGameObject;
    /** @type {Phaser.GameObjects.Rectangle} */
    #optionsMenuCursor;

    constructor() {
        super({
            key: SCENE_KEYS.OPTIONS_SCENE, //unique key for pharse scene
        });
    }

    init() {
        console.log(`[${OptionsScene.name}:init] invoked`);
        this.#nineSliceMainContainer = new NineSlice({
            cornerCutSize: 32,
            textureManager: this.sys.textures,
            assetKey: UI_ASSET_KEYS.MENU_BACKGROUND
        });
    }

    create() {
        console.log(`[${OptionsScene.name}:create] invoked`);

        const {width, height} = this.scale;
        const optionMenuWidth = width -200;

        //main options container
        this.#mainContainer = this.#nineSliceMainContainer.createNineSliceContainer(this, optionMenuWidth, 432);
        this.#mainContainer.setX(100).setY(20);

        //create main option sections
        this.add.text(width / 2, 40, 'Options', OPTIONS_TEXT_STYLE).setOrigin(0.5);
        const menuOptionsPositon = {
            x: 25,
            yStart: 55,
            yIncrement: 55
        };
        const menuOptions = ['Text Speed', 'Battle Scene', 'Battle Style', 'Sound', 'Volume', 'Menu Color','Close'];
        menuOptions.forEach((option, index) => {
            const x = menuOptionsPositon.x;
            const y = menuOptionsPositon.yStart + menuOptionsPositon.yIncrement * index;
            const textGameObject = this.add.text(x,y,option,OPTIONS_TEXT_STYLE);
            this.#mainContainer.add(textGameObject);
        });

        //create text speed options
        this.#textSpeedOptionTextGameObjects = this.add.group([
            this.add.text(420,75,'Slow', OPTIONS_TEXT_STYLE),
            this.add.text(590,75,'Mid', OPTIONS_TEXT_STYLE),
            this.add.text(760,75,'Fast', OPTIONS_TEXT_STYLE)
        ]);

        //create battle scene options
        this.#battleSceneOptionTextGameObjects = this.add.group([
            this.add.text(420,130,'On', OPTIONS_TEXT_STYLE),
            this.add.text(590,130,'Off', OPTIONS_TEXT_STYLE),
        ]);

        //create battle style options
        this.#battleStyleOptionTextGameObjects = this.add.group([
            this.add.text(420,185,'Set', OPTIONS_TEXT_STYLE),
            this.add.text(590,185,'Shift', OPTIONS_TEXT_STYLE),
        ]);

        //create sounds options
        this.#soundOptionTextGameObjects = this.add.group([
            this.add.text(420,240,'On', OPTIONS_TEXT_STYLE),
            this.add.text(590,240,'Off', OPTIONS_TEXT_STYLE),
        ]);

        //create volume options
        this.add.rectangle(420, 312, 300, 4, 0xffffff, 1).setOrigin(0, 0.5);
        this.#volumeOptionsMenuCursor = this.add.rectangle(710, 312, 10, 25, 0xff2222, 1).setOrigin(0, 0.5);
        this.#volumeOptionsVauleText = this.add.text(760, 295, '100%', OPTIONS_TEXT_STYLE);
        
        //frame options
        this.#selectedMenuColorTextGameObject = this.add.text(590, 350, '', OPTIONS_TEXT_STYLE);
        this.add.image(530, 352, UI_ASSET_KEYS.CURSOR).setOrigin(1,0).setScale(2.5).setFlipX(true);
        this.add.image(660, 352, UI_ASSET_KEYS.CURSOR).setOrigin(0,0).setScale(2.5);
        
        //option details container
        this.#infoContainer = this.#nineSliceMainContainer.createNineSliceContainer(this, optionMenuWidth, 100);
        this.#infoContainer.setX(100).setY(height - 110);
        this.#selectedOptionInfoMsgTextGameObject = this.add.text(125, 480, OPTION_MENU_OPTION_INFO_MSG.TEXT_SPEED, {
            ...OPTIONS_TEXT_STYLE, 
            ...{
                wordWrap: {width: width - 250},
            }
        });

        this.#optionsMenuCursor = this.add.rectangle(110, 70, optionMenuWidth - 20, 40, 0xffffff, 0).setOrigin(0).setStrokeStyle(4, 0xe4434a, 1);
    }
}

