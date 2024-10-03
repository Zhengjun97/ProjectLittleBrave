import { BATTLE_ASSET_KEYS, MONSTER_ASSET_KEYS  } from "../assets/asset-keys.js";
import { DIRECTION } from "../common/direction.js";
import Phaser from "../lib/phaser.js";
import { StateMachine } from "../utils/state-machine.js";
import { Background } from "./battle/background.js";
import { EnemyBattleMonster } from "./battle/monsters/enemy-battle-monster.js";
import { PlayerBattleMonster } from "./battle/monsters/player-battle-monster.js";
import { BattleMenu } from "./battle/ui/menu/battle-menu.js";
import { HealthBar } from "./battle/ui/menu/health-bar.js";
import { SCENE_KEYS } from "./scene-keys.js";

export class BattleScene extends Phaser.Scene{
    /** @type {BattleMenu} */
    #battleMenu;
    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    #cursorKeys;
    /** @type {EnemyBattleMonster}*/
    #activeEnemyMonster;
    /** @type {PlayerBattleMonster}*/
    #activePlayerMonster;
    /** @type {number} */
    #activePlayerAttackIndex;
    /** @type {StateMachine} */
    #battleStateMachine

    constructor() {
        super({
            key: SCENE_KEYS.BATTLE_SCENE, //unique key for pharse scene
        });
        
    }

    //phaser life cycle events

    init() {
        this.#activePlayerAttackIndex = -1;
    }

    create() {
        console.log(`[${BattleScene.name}:create] invoked`);
        //create main background
        const background = new Background(this);
        background.showForest();
        //render player and enemy monster
        this.#activeEnemyMonster = new EnemyBattleMonster({
            scene: this,
            monsterDetails: {
                name: MONSTER_ASSET_KEYS.CARNODUSK,
                assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
                assetFrame: 0,
                currentHp: 25,
                maxHp: 25,
                attackIds: [1],
                baseAttack: 5,
                currentLevel: 5
            },
        });

        this.#activePlayerMonster = new PlayerBattleMonster({
            scene: this,
            monsterDetails: {
                name: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetFrame: 0,
                currentHp: 25,
                maxHp: 25,
                attackIds: [2],
                baseAttack: 5,
                currentLevel: 5
            },
        });
            
        //render out the main info and sub info panes
        this.#battleMenu = new BattleMenu(this, this.#activePlayerMonster);
        this.#battleMenu.showMainBattleMenu();
        
        //create state machine
        this.#battleStateMachine = new StateMachine('battle', this);
        this.#battleStateMachine.addState({
            name: 'INTRO',
            onEnter: () => {
                this.time.delayedCall(1000, () => {
                    this.#battleStateMachine.setState('BATTLE');
                });
            },
        });

        this.#battleStateMachine.addState({
            name: 'BATTLE',
        });

        this.#battleStateMachine.setState('INTRO');

        this.#cursorKeys = this.input.keyboard.createCursorKeys();
        
    }

    update() {
        const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(this.#cursorKeys.space);
        if (wasSpaceKeyPressed) {
            this.#battleMenu.handlePlayerInput('OK');

            //check if the player selected an attack, and update display text
            if (this.#battleMenu.selectedAttack === undefined) {
                return;
            }
        
            this.#activePlayerAttackIndex = this.#battleMenu.selectedAttack;

            if (!this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex]) {
                return;
            }

            console.log(`Player selected the following move: ${this.#battleMenu.selectedAttack}`);
            this.#battleMenu.hideMsAttackSubMenu();
            this.#handleBattleSequence();
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

    #handleBattleSequence() {
        // general battle flow
        // show attack used, brief pause
        // then play attack animation, brief pause
        // then play damage animation, brief pause
        // then play health bar animation, brief pause
        // then repeat the steps above 

        this.#playerAttack();
    }

    #playerAttack() {
        this.#battleMenu.updateInfoPaneMessageAndWaitForInput([`You used ${this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex].name}`], () => {
            this.time.delayedCall(500, () => {
                this.#activeEnemyMonster.takeDamage(this.#activePlayerMonster.baseAttack, ()=>{
                    this.#enemyAttack();
                });
            });
        });
    }

    #enemyAttack() {
        if (this.#activeEnemyMonster.isFainted) {
            this.#postBattleSequenceCheck();
            return;
        }

        this.#battleMenu.updateInfoPaneMessageAndWaitForInput([`For ${this.#activeEnemyMonster.name} used ${this.#activeEnemyMonster.attacks[0].name}`], () => {
            this.time.delayedCall(500, () => {
                this.#activePlayerMonster.takeDamage(this.#activeEnemyMonster.baseAttack, ()=>{
                    this.#postBattleSequenceCheck();
                });
            });
        });
    }

    #postBattleSequenceCheck() {
        if (this.#activeEnemyMonster.isFainted) {
            this.#battleMenu.updateInfoPaneMessageAndWaitForInput([`Wild ${this.#activeEnemyMonster.name} fainted`, 'You have gained some exp'], () => {
                this.#transitionToNextScene();
            });
            return;
        }

        if (this.#activePlayerMonster.isFainted) {
            this.#battleMenu.updateInfoPaneMessageAndWaitForInput([`${this.#activePlayerMonster.name} fainted`, 'You lose, escaping to safety...'], () => {
                this.#transitionToNextScene();
            });
            return;
        }

        this.#battleMenu.showMainBattleMenu();
    }

    #transitionToNextScene() {
        this.cameras.main.fadeOut(600,0,0,0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(SCENE_KEYS.BATTLE_SCENE);
        });
    }
}