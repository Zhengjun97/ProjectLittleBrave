import { UI_ASSET_KEYS } from "../assets/asset-keys.js";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../assets/font-keys.js";
import Phaser from "../lib/phaser.js";
import { NineSlice } from "../utils/nine-slice.js";
import { SCENE_KEYS } from "./scene-keys.js";

/** @tpye {Phaser.Type.GameObjects.Text.TextStyle} */
const OPTIONS_TEXT_STYLE = Object.freeze({
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME, color: '#ffffff', fontSize: '30px',
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
        
        //frame options

        //option
    }
}

