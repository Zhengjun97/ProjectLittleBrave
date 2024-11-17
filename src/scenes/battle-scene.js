import { MONSTER_ASSET_KEYS } from "../assets/asset-keys.js";
import { DIRECTION } from "../common/direction.js";
import { BATTLE_SCENE_OPTIONS } from "../common/options.js";
import Phaser from "../lib/phaser.js";
import { Controls } from "../utils/controls.js";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../utils/data-manager.js";
import { createSceneTransition } from "../utils/scene-transition.js";
import { StateMachine } from "../utils/state-machine.js";
import { BaseScene } from "./base-scene.js";
import { ATTACK_TARGET, AttackManager } from "./battle/attacks/attack-manager.js";
import { Background } from "./battle/background.js";
import { EnemyBattleMonster } from "./battle/monsters/enemy-battle-monster.js";
import { PlayerBattleMonster } from "./battle/monsters/player-battle-monster.js";
import { BattleMenu } from "./battle/ui/menu/battle-menu.js";
import { SCENE_KEYS } from "./scene-keys.js";

const BATTLE_STATES = Object.freeze({
  INTRO: 'INTRO',
  PRE_BATTLE_INFO: 'PRE_BATTLE_INFO',
  BRING_OUT_MONSTER: 'BRING_OUT_MONSTER',
  PLAYER_INPUT: 'PLAYER_INPUT',
  ENEMY_INPUT: 'ENEMY_INPUT',
  BATTLE: 'BATTLE',
  POST_ATTACK_CHECK: 'POST_ATTACK_CHECK',
  FINISHED: 'FINISHED',
  RUN_ATTEMPT: 'RUN_ATTEMPT',
});


export class BattleScene extends BaseScene {
  /** @type {BattleMenu} */
  #battleMenu;
  /** @type {EnemyBattleMonster} */
  #activeEnemyMonster;
  /** @type {PlayerBattleMonster} */
  #activePlayerMonster;
  /** @type {number} */
  #activePlayerAttackIndex;
  /** @type {StateMachine} */
  #battleStateMachine;
  /** @type {AttackManager} */
  #attackManager;
  /** @type {boolean} */
  #skipAnimations;
  /** @type {number} */
  #activeEnemyAttackIndex;



  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE,
    });
  }

  init() {
    super.init();

    this.#activePlayerAttackIndex = -1;
    this.#activeEnemyAttackIndex = -1;
    const chosenBattleSceneOption = dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS);
    if (chosenBattleSceneOption === undefined || chosenBattleSceneOption === BATTLE_SCENE_OPTIONS.ON) {
      this.#skipAnimations = false;
      return;
    }
    this.#skipAnimations = true;
  }

  create() {
    super.create();

    // create main background
    const background = new Background(this);
    background.showForest();

    // render out the player and enemy monsters
    this.#activeEnemyMonster = new EnemyBattleMonster({
      scene: this,
      monsterDetails: {
        id: 2,
        monsterId: 2,
        name: MONSTER_ASSET_KEYS.CARNODUSK,
        assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
        assetFrame: 0,
        currentHp: 25,
        maxHp: 25,
        attackIds: [1],
        baseAttack: 5,
        currentLevel: 5,
      },
      skipBattleAnimations: this.#skipAnimations,
    });

    this.#activePlayerMonster = new PlayerBattleMonster({
      scene: this,
      monsterDetails: dataManager.store.get(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY)[0], skipBattleAnimations: this.#skipAnimations,
    });

    // render out the main info and sub info panes
    this.#battleMenu = new BattleMenu(this, this.#activePlayerMonster, this.#skipAnimations);
    this.#createBattleStateMachine();
    this.#attackManager = new AttackManager(this, this.#skipAnimations);


    this._contorls.lockInput = true;
  }

  update() {
    super.update();
    this.#battleStateMachine.update();

    if (this._contorls.isInputLocked) {
      return;
    }

    const wasSpaceKeyPressed = this._contorls.wasSpaceKeyPressed();
    // limit input based on the current battle state we are in
    // if we are not in the right battle state, return early and do not process input
    if (
      wasSpaceKeyPressed &&
      (this.#battleStateMachine.currentStateName === BATTLE_STATES.PRE_BATTLE_INFO ||
        this.#battleStateMachine.currentStateName === BATTLE_STATES.POST_ATTACK_CHECK ||
        this.#battleStateMachine.currentStateName === BATTLE_STATES.RUN_ATTEMPT)
    ) {
      this.#battleMenu.handlePlayerInput('OK');
      return;
    }

    if (this.#battleStateMachine.currentStateName !== BATTLE_STATES.PLAYER_INPUT) {
      return;
    }

    if (wasSpaceKeyPressed) {
      this.#battleMenu.handlePlayerInput('OK');

      //check if the player attempted to run
      if (this.#battleMenu.isAttemptToRun) {
        this.#battleStateMachine.setState(BATTLE_STATES.RUN_ATTEMPT);
        return;
      }

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
      this.#battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
    }

    if (this._contorls.wasBackKeyPressed()) {
      this.#battleMenu.handlePlayerInput('CANCEL');
      return;
    }

    const selectedDirection = this._contorls.getDirectionKeyJustPressed();

    if (selectedDirection !== DIRECTION.NONE) {
      this.#battleMenu.handlePlayerInput(selectedDirection);
    }
  }

  /**
   * @param {()=> void} callback 
   * @returns {void}
   */
  #playerAttack(callback) {
    if (this.#activePlayerMonster.isFainted) {
      callback();
      return;
    }

    this.#battleMenu.updateInfoPaneMessageNoInputRequired(
      `${this.#activePlayerMonster.name} used ${this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex].name}`,
      () => {
        this.time.delayedCall(500, () => {
          this.#attackManager.playAttackAnimation(
            this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex].animationName,
            ATTACK_TARGET.ENEMY,
            () => {
              this.#activeEnemyMonster.playTakeDmgAnimation(() => {
                this.#activeEnemyMonster.takeDamage(this.#activePlayerMonster.baseAttack, () => {
                  callback();
                });
              });
            }
          );
        });
      },
    );
  }

  /**
   * @param {()=> void} callback 
   * @returns {void}
   */
  #enemyAttack(callback) {
    if (this.#activeEnemyMonster.isFainted) {
      callback();
      return;
    }

    //console.log(`for ${this.#activeEnemyMonster.name} used ${this.#activeEnemyMonster.attacks[this.#activeEnemyAttackIndex].name}`);

    this.#battleMenu.updateInfoPaneMessageNoInputRequired(
      `for ${this.#activeEnemyMonster.name} used ${this.#activeEnemyMonster.attacks[this.#activeEnemyAttackIndex].name}`,
      () => {
        this.time.delayedCall(500, () => {
          this.#attackManager.playAttackAnimation(
            this.#activeEnemyMonster.attacks[this.#activeEnemyAttackIndex].animationName,
            ATTACK_TARGET.PLAYER,
            () => {
              this.#activePlayerMonster.playTakeDmgAnimation(() => {
                this.#activePlayerMonster.takeDamage(this.#activeEnemyMonster.baseAttack, () => {
                  callback();
                });
              });
            }
          );
        });
      },
    );
  }

  #postBattleSequenceCheck() {
    if (this.#activeEnemyMonster.isFainted) {
      this.#activeEnemyMonster.playDeathAnimation(() => {
        this.#battleMenu.updateInfoPaneMessageAndWaitForInput(
          [`${this.#activeEnemyMonster.name} dead`, 'You have gained some experience'],
          () => {
            this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
          },
        );
      });
      return;
    }

    if (this.#activePlayerMonster.isFainted) {
      this.#activePlayerMonster.playDeathAnimation(() => {
        this.#battleMenu.updateInfoPaneMessageAndWaitForInput(
          [`${this.#activePlayerMonster.name} dead`, 'You lost, escaping to safety...'],
          () => {
            this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
          },
        );
      });
      return;
    }

    this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
  }

  #transitionToNextScene() {
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE_KEYS.WORLD_SCENE);
    });
  }

  #createBattleStateMachine() {
    this.#battleStateMachine = new StateMachine('battle', this);

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.INTRO,
      onEnter: () => {
        // wait for any scene setup and transitions to complete
        createSceneTransition(this, {
          skipSceneTransition: this.#skipAnimations,
          callback: () => {
            this.#battleStateMachine.setState(BATTLE_STATES.PRE_BATTLE_INFO);
          }
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.PRE_BATTLE_INFO,
      onEnter: () => {
        // wait for enemy monster to appear on the screen and notify player about the wild monster
        this.#activeEnemyMonster.playMonsterAppearAnimation(() => {
          this.#activeEnemyMonster.playMonsterHealthBarAppearAnimation(() => undefined);
          this._contorls.lockInput = false;
          this.#battleMenu.updateInfoPaneMessageAndWaitForInput(
            [`${this.#activeEnemyMonster.name} appeared!`],
            () => {
              // wait for text animation to complete and move to next state
              this.#battleStateMachine.setState(BATTLE_STATES.BRING_OUT_MONSTER);
            },
          );
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.BRING_OUT_MONSTER,
      onEnter: () => {
        // wait for player monster to appear on the screen and notify the player about monster
        this.#activePlayerMonster.playMonsterAppearAnimation(() => {
          this.#activePlayerMonster.playMonsterHealthBarAppearAnimation(() => undefined);
          this.#battleMenu.updateInfoPaneMessageNoInputRequired(
            `go ${this.#activePlayerMonster.name}!`,
            () => {
              // wait for text animation to complete and move to next state
              this.time.delayedCall(1200, () => {
                this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
              });
            },
          );
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.PLAYER_INPUT,
      onEnter: () => {
        this.#battleMenu.showMainBattleMenu();
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.ENEMY_INPUT,
      onEnter: () => {
        // pick a random move for the enemy monster, and in the future implement some type of AI behavior
        this.#activeEnemyAttackIndex = this.#activeEnemyMonster.pickRandomMove();
        this.#battleStateMachine.setState(BATTLE_STATES.BATTLE);
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.BATTLE,
      onEnter: () => {
        // general battle flow
        // show attack used, brief pause
        // then play attack animation, brief pause
        // then play damage animation, brief pause
        // then play health bar animation, brief pause
        // then repeat the steps above for the other monster

        //beacause run attempt failed the enemy will attack
        if (this.#battleMenu.isAttemptToRun) {
          this.time.delayedCall(500, ()=> {
            this.#enemyAttack(()=>{
              this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
            });
          });
          return;
        }

        const randomNumber = Phaser.Math.Between(0,1);
        if (randomNumber === 0) {
          this.#playerAttack(()=>{
            this.#enemyAttack(()=>{
              this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
            });
          });
          return;
        }

        this.#enemyAttack(()=>{
          this.#playerAttack(()=>{
            this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
          });
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.POST_ATTACK_CHECK,
      onEnter: () => {
        this.#postBattleSequenceCheck();
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.FINISHED,
      onEnter: () => {
        this.#transitionToNextScene();
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.RUN_ATTEMPT,
      onEnter: () => {
        const randomNumber = Phaser.Math.Between(1, 10);
        if (randomNumber > 5) {
          //player has run away successfully
          this.#battleMenu.updateInfoPaneMessageAndWaitForInput(
            [`You got away safely!`],
            () => {
              this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
            },
          );
          return;
        }
        //player failed to run away, allow enemy to take their turn
        this.#battleMenu.updateInfoPaneMessageAndWaitForInput(['You failed to run away...'], ()=>{
          this.time.delayedCall(200, ()=> {
            this.#battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
          });
        });
      },
    });

    // start the state machine
    this.#battleStateMachine.setState('INTRO');
  }
}