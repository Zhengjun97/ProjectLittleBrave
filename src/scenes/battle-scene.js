import { BATTLE_ASSET_KEYS, MONSTER_ASSET_KEYS  } from "../assets/asset-keys.js";
import { DIRECTION } from "../common/direction.js";
import Phaser from "../lib/phaser.js";
import { Background } from "./battle/background.js";
import { BattleMenu } from "./battle/ui/menu/battle-menu.js";
import { HealthBar } from "./battle/ui/menu/health-bar.js";
import { SCENE_KEYS } from "./scene-keys.js";



export class BattleScene extends Phaser.Scene{
    /** @type {BattleMenu} */
    #battleMenu;
    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    #cursorKeys;
    constructor() {
        super({
            key: SCENE_KEYS.BATTLE_SCENE, //unique key for pharse scene
        });
        
    }

    //phaser life cycle events


    create() {
        console.log(`[${BattleScene.name}:create] invoked`);
        //create main background
        const background = new Background(this);
        background.showForest();
        //render player and enemy monster
        this.add.image(768,144,MONSTER_ASSET_KEYS.CARNODUSK,(0)).setFlipX(true).setScale(0.5);
        this.add.image(256,316,MONSTER_ASSET_KEYS.IGUANIGNITE,(0)).setScale(2);

        //render out the player HP bar
        const playerHealthBar = new HealthBar(this, 34, 34);
        const playerMsName = this.add.text(30,20,'Main Character', {color: '#7E3D3F', fontSize: '32px'});
        this.add.container(556,318,[this.add.image(0,0,BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND).setOrigin(0)
            , playerMsName, 
            playerHealthBar.container,
            this.add.text(playerMsName.width + 35,23,'L5', {color: '#ED474B', fontSize: '28px'}),
            this.add.text(30,55,'HP', {color: '#FF6505', fontSize: '24px', fontStyle: 'italic'}),
            this.add.text(443,80,'25/25', {color: '#7E3D3F', fontSize: '16px',}).setOrigin(1,0),
            ]);

        //render out the enemy HP bar
        const enemyHealthBar = new HealthBar(this, 34, 34);
        const enemyMsName = this.add.text(30,20,'Dark Knight', {color: '#7E3D3F', fontSize: '32px'});
        this.add.container(0,0,[this.add.image(0,0,BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND).setOrigin(0)
            , enemyMsName, 
            enemyHealthBar.container,
            this.add.text(enemyMsName.width + 35,23,'L5', {color: '#ED474B', fontSize: '28px'}),
            this.add.text(30,55,'HP', {color: '#FF6505', fontSize: '24px', fontStyle: 'italic'}),
            ]);
            
        //render out the main info and sub info panes
        this.#battleMenu = new BattleMenu(this);
        this.#battleMenu.showMainBattleMenu();

        this.#cursorKeys = this.input.keyboard.createCursorKeys();

        playerHealthBar.setMeterPercentageAnimated(0.5,{
            duration: 3000,
            callback: () =>{
                console.log('Animation Completed');
            }
        });

    }

    update() {
        const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(this.#cursorKeys.space);
        if (wasSpaceKeyPressed) {
            this.#battleMenu.handlePlayerInput('OK');

            //check if the player selected an attack, and update display text
            if (this.#battleMenu.selectedAttack === undefined) {
                return;
            }
            console.log(`Player selected the following move: ${this.#battleMenu.selectedAttack}`);
            this.#battleMenu.hideMsAttackSubMenu();
            this.#battleMenu.updateInfoPaneMessageAndWaitForInput(['You attacks the enemy'], () => {
                this.#battleMenu.showMainBattleMenu();
            });
        }

        if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.shift)) {
            this.#battleMenu.handlePlayerInput('CANCEL');
            return;
        }

        /** @type {import('../common/direction.js').Direction}*/
        let selectDirection = DIRECTION.NONE;
        if (this.#cursorKeys.left.isDown) {
            selectDirection = DIRECTION.LEFT;
        } else if (this.#cursorKeys.right.isDown) {
            selectDirection = DIRECTION.RIGHT;
        } else if (this.#cursorKeys.up.isDown) {
            selectDirection = DIRECTION.UP;
        } else if (this.#cursorKeys.down.isDown) {
            selectDirection = DIRECTION.DOWN;
        }

        if (selectDirection !== DIRECTION.NONE) {
            this.#battleMenu.handlePlayerInput(selectDirection);
        }
    }

}