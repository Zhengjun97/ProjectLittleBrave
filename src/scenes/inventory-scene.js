import { INVENTORY_ASSET_KEYS, UI_ASSET_KEYS } from "../assets/asset-keys.js";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../assets/font-keys.js";
import { NineSlice } from "../utils/nine-slice.js";
import { BaseScene } from "./base-scene.js";
import { SCENE_KEYS } from "./scene-keys.js";

const INVENTORY_TEXT_STYLE = Object.freeze({
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME, color: '#000000', fontSize: '30px',
});

/**
 * @typedef InventorySceneData
 * @type {object}
 * @property {string} previousSceneName
 */
export class InventoryScene extends BaseScene {
    /**@type {InventorySceneData} */
    #sceneData;
    /**@type {NineSlice} */
    #niceSliceMainContainer;

    constructor() {
        super({
            key: SCENE_KEYS.INVENTORY_SCENE, //unique key for pharse scene
        });
    }

    /**
    * @param {InventorySceneData} data 
    * @returns {void}
    */
    init(data) {
        super.init(data);

        this.#sceneData = data;

        this.#niceSliceMainContainer = new NineSlice({
            cornerCutSize: 32,
            textureManager: this.sys.textures,
            assetKeys: [UI_ASSET_KEYS.MENU_BACKGROUND]
        });
    }

    create() {
        super.create();

        //create background
        this.add.image(0,0, INVENTORY_ASSET_KEYS.INVENTORY_BACKGROUND).setOrigin(0);
        this.add.image(40,120, INVENTORY_ASSET_KEYS.INVENTORY_BAG).setOrigin(0).setScale(0.5);

        const container = this.#niceSliceMainContainer.createNineSliceContainer(this, 700, 360, UI_ASSET_KEYS.MENU_BACKGROUND).setPosition(300, 20);
        const containerBackground = this.add.rectangle(4,4,692, 352, 0xffff88).setOrigin(0).setAlpha(0.6);
        container.add(containerBackground);
        const titleContainer = this.#niceSliceMainContainer.createNineSliceContainer(this, 240, 64, UI_ASSET_KEYS.MENU_BACKGROUND).setPosition(64, 20);
        const titileContainerBackground = this.add.rectangle(4,4,232, 56, 0xffff88).setOrigin(0).setAlpha(0.6);
        titleContainer.add(titileContainerBackground);

        const textTile =this.add.text(116, 28, 'Item', INVENTORY_TEXT_STYLE).setOrigin(0.5);
        titleContainer.add(textTile);
    
    }
}