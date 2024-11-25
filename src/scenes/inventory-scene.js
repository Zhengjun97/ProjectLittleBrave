import { INVENTORY_ASSET_KEYS, UI_ASSET_KEYS } from "../assets/asset-keys.js";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../assets/font-keys.js";
import { DIRECTION } from "../common/direction.js";
import { dataManager } from "../utils/data-manager.js";
import { exhaustiveGuard } from "../utils/guard.js";
import { NineSlice } from "../utils/nine-slice.js";
import { BaseScene } from "./base-scene.js";
import { SCENE_KEYS } from "./scene-keys.js";

const CANCEL_TEXT_DESCRIPTION = 'Close your bag, and go back to adventring!';
const INVENTORY_ITEM_POSITION = Object.freeze({
    x: 50,
    y: 14,
    space: 50
});

const INVENTORY_TEXT_STYLE = Object.freeze({
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME, color: '#000000', fontSize: '30px',
});

/**
 * @typedef InventoryItemGameObjects
 * @type {object}
 * @property {Phaser.GameObjects.Text} [itemName]
 * @property {Phaser.GameObjects.Text} [quantitySign]
 * @property {Phaser.GameObjects.Text} [quantity]
 */

/**
 * @typedef {import('../types/typedef.js').InventoryItem & { gameObjects: InventoryItemGameObjects }} InventoryItemWithGameObjects
 */

/**
 * @typedef CustomInventory
 * @type {InventoryItemWithGameObjects[]}
 */

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
    /**@type {Phaser.GameObjects.Text} */
    #selectedInventoryDescriptionText;
    /**@type {Phaser.GameObjects.Image} */
    #userInputCursor;
    /**@type {CustomInventory} */
    #inventory;
    /**@type {number} */
    #selectedInventroyOptionIndex;

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
        const inventory = dataManager.getInventory(this);
        /*
        this.#inventory = [
            {
                name: 'potion',
                description: 'A basic healing item that will heal 30 HP from a single character',
                quantity: 10,
                GameObjects: {},
            },
        ];*/
        this.#inventory = inventory.map((inventoryItem) => {
            return {
                item: inventoryItem.item,
                quantity: inventoryItem.quantity,
                gameObjects: {},
            };
        });
        this.#selectedInventroyOptionIndex = 0;
    }

    create() {
        super.create();

        //create background
        this.add.image(0, 0, INVENTORY_ASSET_KEYS.INVENTORY_BACKGROUND).setOrigin(0);
        this.add.image(40, 120, INVENTORY_ASSET_KEYS.INVENTORY_BAG).setOrigin(0).setScale(0.5);

        const container = this.#niceSliceMainContainer.createNineSliceContainer(this, 700, 360, UI_ASSET_KEYS.MENU_BACKGROUND).setPosition(300, 20);
        const containerBackground = this.add.rectangle(4, 4, 692, 352, 0xffff88).setOrigin(0).setAlpha(0.6);
        container.add(containerBackground);
        const titleContainer = this.#niceSliceMainContainer.createNineSliceContainer(this, 240, 64, UI_ASSET_KEYS.MENU_BACKGROUND).setPosition(64, 20);
        const titileContainerBackground = this.add.rectangle(4, 4, 232, 56, 0xffff88).setOrigin(0).setAlpha(0.6);
        titleContainer.add(titileContainerBackground);

        const textTile = this.add.text(116, 28, 'Item', INVENTORY_TEXT_STYLE).setOrigin(0.5);
        titleContainer.add(textTile);

        //create inventory text from available items
        this.#inventory.forEach((inventoryItem, index) => {
            const itemText = this.add.text(INVENTORY_ITEM_POSITION.x, INVENTORY_ITEM_POSITION.y + index * INVENTORY_ITEM_POSITION.space, inventoryItem.item.name, INVENTORY_TEXT_STYLE);
            const qty1Text = this.add.text(620, INVENTORY_ITEM_POSITION.y + 2 + index * INVENTORY_ITEM_POSITION.space, 'x', {
                color: '#000000',
                fontSize: '30px',
            });
            const qty2Text = this.add.text(650, INVENTORY_ITEM_POSITION.y + index * INVENTORY_ITEM_POSITION.space, `${inventoryItem.quantity}`, INVENTORY_TEXT_STYLE);
            container.add([itemText, qty1Text, qty2Text]);
            inventoryItem.gameObjects = {
                itemName: itemText,
                quantity: qty2Text,
                quantitySign: qty1Text,
            };
        });

        //create cancel text
        const cancelText = this.add.text(INVENTORY_ITEM_POSITION.x, INVENTORY_ITEM_POSITION.y + this.#inventory.length * INVENTORY_ITEM_POSITION.space, 'Cancel', INVENTORY_TEXT_STYLE);
        container.add(cancelText);
        //create player input cursor
        this.#userInputCursor = this.add.image(30, 30, UI_ASSET_KEYS.CURSOR).setScale(3);
        container.add(this.#userInputCursor);
        //create inventory description text
        this.#selectedInventoryDescriptionText = this.add.text(25, 420, '', {
            ...INVENTORY_TEXT_STYLE, ...{
                wordWrap: {
                    width: this.scale.width - 18
                }, color: '#ffffff',
            }
        });

        this.#updateItemDescriptionText();
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
            if (this.#isCancelButtonSelected()) {
                this.#goBackToPreviousScene();
                return;
            }

            this._contorls.lockInput = true;
            const sceneDataToPass = {
                previousSceneName: SCENE_KEYS.INVENTORY_SCENE,
                itemSelected: this.#inventory[this.#selectedInventroyOptionIndex].item,
            };
            this.scene.launch(SCENE_KEYS.MONSTER_PARTY_SCENE, sceneDataToPass);
            this.scene.pause(SCENE_KEYS.INVENTORY_SCENE);
            return;
        }

        const selectedDirection = this._contorls.getDirectionKeyJustPressed();
        if (selectedDirection !== DIRECTION.NONE) {
            this.#movePlayerInputCursor(selectedDirection);
            this.#updateItemDescriptionText();
        }

    }

    #updateItemDescriptionText() {
        if (this.#isCancelButtonSelected()) {
            this.#selectedInventoryDescriptionText.setText(CANCEL_TEXT_DESCRIPTION);
            return;
        }
        this.#selectedInventoryDescriptionText.setText(this.#inventory[this.#selectedInventroyOptionIndex].item.description);

    }

    #isCancelButtonSelected() {
        return this.#selectedInventroyOptionIndex === this.#inventory.length;
    }

    #goBackToPreviousScene() {
        this._contorls.lockInput = true;
        this.scene.stop(SCENE_KEYS.INVENTORY_SCENE);
        this.scene.resume(this.#sceneData.previousSceneName);
    }

    /**
    * @param {import("../common/direction.js").Direction} direction 
    * @returns {void}
    */
    #movePlayerInputCursor(direction) {
        switch (direction) {
            case DIRECTION.UP:
                this.#selectedInventroyOptionIndex -= 1;
                if (this.#selectedInventroyOptionIndex < 0) {
                    this.#selectedInventroyOptionIndex = this.#inventory.length;
                }
                break;
            case DIRECTION.DOWN:
                this.#selectedInventroyOptionIndex += 1;
                if (this.#selectedInventroyOptionIndex > this.#inventory.length) {
                    this.#selectedInventroyOptionIndex = 0;
                }
                break;
            case DIRECTION.LEFT:
            case DIRECTION.RIGHT:
                return;
            case DIRECTION.NONE:
                break;
            default:
                exhaustiveGuard(direction);
        }

        const y = 30 + this.#selectedInventroyOptionIndex * 50;

        this.#userInputCursor.setY(y);
    }
}