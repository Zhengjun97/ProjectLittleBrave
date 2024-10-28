import { TITLE_ASSET_KEYS, UI_ASSET_KEYS } from "../assets/asset-keys.js";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../assets/font-keys.js";
import Phaser from "../lib/phaser.js";
import { SCENE_KEYS } from "./scene-keys.js";


/** @tpye {Phaser.Type.GameObjects.Text.TextStyle} */
export const MENU_TEXT_STYLE = Object.freeze({
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME, color: '#cfecff', fontSize: '30px',
 });


const PLAYER_INPUT_CURSOR_POSITION = Object.freeze({
    x: 150
});


export class TitleScene extends Phaser.Scene{
    /**@type {Phaser.GameObjects.Image} */
    #mainMenuCursorPhaserImageGameObject;

    constructor() {
        super({
            key: SCENE_KEYS.TITLE_SCENE, //unique key for pharse scene
        });
    }

    create(){
        console.log(`[${TitleScene.name}:create] invoked`);

        //create title scene background
        this.add.image(0,0,TITLE_ASSET_KEYS.BACKGROUND).setOrigin(0).setScale(0.65);
        this.add.image(this.scale.width/2,this.scale.height/3,TITLE_ASSET_KEYS.PANEL).setScale(0.6,0.6).setAlpha(1);
        this.add.image(this.scale.width/2,this.scale.height/3+50,TITLE_ASSET_KEYS.TITLE).setScale(0.55).setAlpha(1);

        //create menu
        const menuBgWidth = 500;

        //TODO: replace with slice image
        const menuBg = this.add.image(125,0,UI_ASSET_KEYS.MENU_BACKGROUND).setOrigin(0).setScale(2.4,2);
        const menuBgContainer = this.add.container(0,0,[menuBg]);
        const newGameText = this.add.text(menuBgWidth/2, 40,'New Game',MENU_TEXT_STYLE).setOrigin(0.5);
        const continueText = this.add.text(menuBgWidth/2, 90,'Continue',MENU_TEXT_STYLE).setOrigin(0.5);
        const optionText = this.add.text(menuBgWidth/2, 140,'Options',MENU_TEXT_STYLE).setOrigin(0.5);

        const menuContainer = this.add.container(0,0,[menuBgContainer,newGameText,continueText,optionText]);
        menuContainer.setPosition(this.scale.width/2 - menuBgWidth / 2,300);


        //create cursors
        this.#mainMenuCursorPhaserImageGameObject = this.add.image(PLAYER_INPUT_CURSOR_POSITION.x,41,UI_ASSET_KEYS.CURSOR).setOrigin(0.5).setScale(2.5,2.5);

        menuBgContainer.add(this.#mainMenuCursorPhaserImageGameObject);
        this.tweens.add({
            delay:0,
            duration: 500,
            repeat:-1,
            x:{
                from: PLAYER_INPUT_CURSOR_POSITION.x,
                start: PLAYER_INPUT_CURSOR_POSITION.x,
                to:PLAYER_INPUT_CURSOR_POSITION.x+3,
            },
            targets: this.#mainMenuCursorPhaserImageGameObject,
        });
        //add in fase effect
    }



}