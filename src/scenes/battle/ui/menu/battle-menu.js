import Phaser from "../../../../lib/phaser.js";
import { UI_ASSET_KEYS } from "../../../../assets/asset-keys.js";
import { DIRECTION } from "../../../../common/direction.js";
import { exhaustiveGuard } from "../../../../utils/guard.js";
import { ACTIVE_BATTLE_MENU, ATTACK_MOVE_OPT, BATTLE_MENU_OPTION } from "./battle-menu-options.js";
import { BATTLE_UI_TEXT_STYLE } from "./battle-menu-config.js";
import { BattleMonster } from "../../monsters/battle-monster.js";

const BATTLE_MENU_CURSOR_POS = Object.freeze({
    x: 42,
    y: 38,
});

const ATTACK_MENUE_CURSOR_POS = Object.freeze({
    x: 42,
    y: 38,
});

export class BattleMenu {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {Phaser.GameObjects.Container} */
    #mainBattleMenuPhaserContainerGameObj;
    /** @type {Phaser.GameObjects.Container} */
    #moveSelectionSubBattleMenuPhaserContainerGameObj;
    /** @type {Phaser.GameObjects.Text} */
    #battleTextGameObjLine1;
    /** @type {Phaser.GameObjects.Text} */
    #battleTextGameObjLine2;
    /** @type {Phaser.GameObjects.Image} */
    #mainBattleMenuCursorPhaserImgGameObj;
    /** @type {Phaser.GameObjects.Image} */
    #attackBattleMenuCursorPhaserImgGameObj;
    /** @type {import("./battle-menu-options.js").BattleMenuOpt} */
    #selectBattleMenuOpt;
    /** @type {import("./battle-menu-options.js").AttackMoveOpt} */
    #selectAttackMenuOpt;
    /** @type {import("./battle-menu-options.js").ActiveBattleMenu} */
    #activeBattleMenu;
    /** @type {string[]} */
    #queuedInfoPanelMessage;
    /** @type {() => void | undefined} */
    #queuedInfoPanelCallBack;
    /** @type {boolean} */
    #waitingForPlayerInput;
    /** @type {number | undefined} */
    #selectedAttackIndex;
    /** @type {BattleMonster} */
    #activePlayerMonster

    /**
     * 
     * @param {Phaser.Scene} scene the Phaser 3 scene the battle menu will be added to 
     * @param {BattleMonster} activePlayerMonster  
    */
    constructor(scene, activePlayerMonster) {
        this.#scene = scene;
        this.#activePlayerMonster = activePlayerMonster;
        this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
        this.#selectBattleMenuOpt = BATTLE_MENU_OPTION.FIGHT;
        this.#selectAttackMenuOpt = ATTACK_MOVE_OPT.MOVE_1;
        this.#queuedInfoPanelMessage = [];
        this.#queuedInfoPanelCallBack = undefined;
        this.#waitingForPlayerInput = false;
        this.#selectedAttackIndex = undefined;
        this.#mainInfoPane();
        this.#createMainBattleMenu();
        this.#createMsAttackSubMenu();
    }

    /** @type {number | undefined} */
    get selectedAttack() {
        if (this.#activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
            return this.#selectedAttackIndex;
        }
        return undefined;
    }

    showMainBattleMenu() {
        this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
        this.#battleTextGameObjLine1.setText('what should');
        this.#mainBattleMenuPhaserContainerGameObj.setAlpha(1);
        this.#battleTextGameObjLine1.setAlpha(1);
        this.#battleTextGameObjLine2.setAlpha(1);

        this.#selectBattleMenuOpt = BATTLE_MENU_OPTION.FIGHT;
        this.#mainBattleMenuCursorPhaserImgGameObj.setPosition(BATTLE_MENU_CURSOR_POS.x, BATTLE_MENU_CURSOR_POS.y);
        this.#selectedAttackIndex = undefined;
    }

    hideMainBattleMenu() {
        this.#mainBattleMenuPhaserContainerGameObj.setAlpha(0);
        this.#battleTextGameObjLine1.setAlpha(0);
        this.#battleTextGameObjLine2.setAlpha(0);
    }

    showMsAttackSubMenu() {
        this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT;
        this.#moveSelectionSubBattleMenuPhaserContainerGameObj.setAlpha(1);
    }

    hideMsAttackSubMenu() {
        this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
        this.#moveSelectionSubBattleMenuPhaserContainerGameObj.setAlpha(0);
    }

    /**
     * @param {import("../../../../common/direction.js").Direction|'OK'|'CANCEL'} input
     */
    handlePlayerInput(input) {
        if (this.#waitingForPlayerInput && (input === 'CANCEL' || input === 'OK')) {
            this.#updateInfoPaneWithMessage();
            return;
        }

        if (input === 'CANCEL') {
            this.#swtichToMainBattleMenu();
            return;
        }
        if (input === 'OK') {
            if (this.#activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
                this.#handlePlayerChooseMainBattleOpt();
                return;
            }

            if (this.#activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
                this.#handlePlayerChooseAttack();

                return;
            }
            this.hideMainBattleMenu();
            this.showMsAttackSubMenu();
            return;
        }

        this.#updateSelectedBattleMenuOptFromInput(input);
        this.#moveMainBattleMenuCursor();
        this.#updateSelectedMoveOptFromInput(input);
        this.#moveMoveSelectBattleMenuCursor();

    }

    /**
     * 
     * @param {string[]} messages 
     * @param {() => void} [callback]
     */
    updateInfoPaneMessageAndWaitForInput(messages, callback) {
        this.#queuedInfoPanelCallBack = callback;
        this.#queuedInfoPanelMessage = messages;

        this.#updateInfoPaneWithMessage();
    }

    #updateInfoPaneWithMessage() {
        this.#waitingForPlayerInput = false;
        this.#battleTextGameObjLine1.setText('').setAlpha(1);

        //check if all message have been displayed from the queue and call the callback
        if (this.#queuedInfoPanelMessage.length ===0) {
            if (this.#queuedInfoPanelCallBack) {
                this.#queuedInfoPanelCallBack();
                this.#queuedInfoPanelCallBack = undefined;
            }
            return;
        }

        //get first message from queue and animate message
        const messageToDisplay = this.#queuedInfoPanelMessage.shift();
        this.#battleTextGameObjLine1.setText(messageToDisplay);
        this.#waitingForPlayerInput = true;
    }

    //render out the main info and sub info panes
    #createMainBattleMenu() {
        this.#battleTextGameObjLine1 = this.#scene.add.text(20, 468, 'what should', BATTLE_UI_TEXT_STYLE);
        this.#battleTextGameObjLine2 = this.#scene.add.text(20, 512, `I do next?`, BATTLE_UI_TEXT_STYLE);

        this.#mainBattleMenuCursorPhaserImgGameObj = this.#scene.add.image(BATTLE_MENU_CURSOR_POS.x, BATTLE_MENU_CURSOR_POS.y, UI_ASSET_KEYS.CURSOR, 0).setOrigin(0.5).setScale(2.5);

        this.#mainBattleMenuPhaserContainerGameObj = this.#scene.add.container(520, 448,[this.#mainInfoSubPane(), 
            this.#scene.add.text(55, 22, BATTLE_MENU_OPTION.FIGHT, BATTLE_UI_TEXT_STYLE),
            this.#scene.add.text(240, 22, BATTLE_MENU_OPTION.RUN, BATTLE_UI_TEXT_STYLE),
            this.#scene.add.text(55, 70, BATTLE_MENU_OPTION.ITEM, BATTLE_UI_TEXT_STYLE),
            this.#mainBattleMenuCursorPhaserImgGameObj,
        ]);

        this.hideMainBattleMenu();
    }

    #createMsAttackSubMenu() {
        this.#attackBattleMenuCursorPhaserImgGameObj = this.#scene.add.image(42, 38, UI_ASSET_KEYS.CURSOR, 0).setOrigin(0.5).setScale(2.5);
        
        /** @type {string[]} */
        const attackNames =[];
        for (let i = 0; i < 4; i+= 1) {
            attackNames.push(this.#activePlayerMonster.attacks[i]?.name || '-');
        }

        this.#moveSelectionSubBattleMenuPhaserContainerGameObj = this.#scene.add.container(0, 448, [
            this.#scene.add.text(55, 22, attackNames[0], BATTLE_UI_TEXT_STYLE),
            this.#scene.add.text(240, 22, attackNames[1], BATTLE_UI_TEXT_STYLE),
            this.#scene.add.text(55, 70, attackNames[2], BATTLE_UI_TEXT_STYLE),
            this.#scene.add.text(240, 70, attackNames[3], BATTLE_UI_TEXT_STYLE),
            this.#attackBattleMenuCursorPhaserImgGameObj,
        ]);

        this.hideMsAttackSubMenu();
    }

    #mainInfoPane() {
        const padding = 4;
        const rectHeight = 124;
        this.#scene.add.rectangle(padding, this.#scene.scale.height - rectHeight - padding, this.#scene.scale.width - padding * 2, rectHeight, 0xede4f3,1).setOrigin(0).setStrokeStyle(8, 0xe4434a, 1);

    }

    #mainInfoSubPane() {
        const rectWidth = 500;
        const rectHeight = 124;
        return this.#scene.add.rectangle(0, 0, rectWidth, rectHeight, 0xede4f3,1).setOrigin(0).setStrokeStyle(8, 0x905ac2, 1);
    }

    /**
     * @param {import("../../../../common/direction.js").Direction} direction
     */
    #updateSelectedBattleMenuOptFromInput(direction) {
        if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
            return;
        }

        if(this.#selectBattleMenuOpt === BATTLE_MENU_OPTION.FIGHT) {
            switch(direction) {
                case DIRECTION.RIGHT:
                    this.#selectBattleMenuOpt = BATTLE_MENU_OPTION.RUN;
                    return;
                case DIRECTION.DOWN:
                    this.#selectBattleMenuOpt = BATTLE_MENU_OPTION.ITEM;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.UP:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }


        if(this.#selectBattleMenuOpt === BATTLE_MENU_OPTION.ITEM) {
            switch(direction) {
                case DIRECTION.RIGHT:
                case DIRECTION.UP:
                    this.#selectBattleMenuOpt = BATTLE_MENU_OPTION.FIGHT;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.DOWN:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }

        if(this.#selectBattleMenuOpt === BATTLE_MENU_OPTION.RUN) {
            switch(direction) {
                case DIRECTION.LEFT:
                    this.#selectBattleMenuOpt = BATTLE_MENU_OPTION.FIGHT;
                    return;
                case DIRECTION.UP:
                case DIRECTION.RIGHT:
                case DIRECTION.DOWN:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }
    }

    #moveMainBattleMenuCursor() {
        if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
            return;
        }

        switch (this.#selectBattleMenuOpt) {
            case BATTLE_MENU_OPTION.FIGHT:
                this.#mainBattleMenuCursorPhaserImgGameObj.setPosition(BATTLE_MENU_CURSOR_POS.x, BATTLE_MENU_CURSOR_POS.y);
                return;
            case BATTLE_MENU_OPTION.ITEM:
                this.#mainBattleMenuCursorPhaserImgGameObj.setPosition(BATTLE_MENU_CURSOR_POS.x, 86);
                return;
            case BATTLE_MENU_OPTION.RUN:
                this.#mainBattleMenuCursorPhaserImgGameObj.setPosition(228, BATTLE_MENU_CURSOR_POS.y);
                return;
            default:
                exhaustiveGuard(this.#selectBattleMenuOpt);
        }
    }

    /**
     * @param {import("../../../../common/direction.js").Direction} direction
     */
    #updateSelectedMoveOptFromInput(direction) {
        if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
            return;
        }

        if(this.#selectAttackMenuOpt === ATTACK_MOVE_OPT.MOVE_1) {
            switch(direction) {
                case DIRECTION.RIGHT:
                    this.#selectAttackMenuOpt = ATTACK_MOVE_OPT.MOVE_2;
                    return;
                case DIRECTION.DOWN:
                    this.#selectAttackMenuOpt = ATTACK_MOVE_OPT.MOVE_3;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.UP:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }

        if(this.#selectAttackMenuOpt === ATTACK_MOVE_OPT.MOVE_2) {
            switch(direction) {
                case DIRECTION.LEFT:
                    this.#selectAttackMenuOpt = ATTACK_MOVE_OPT.MOVE_1;
                    return;
                case DIRECTION.DOWN:
                    this.#selectAttackMenuOpt = ATTACK_MOVE_OPT.MOVE_4;
                    return;
                case DIRECTION.RIGHT:
                case DIRECTION.UP:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }

        if(this.#selectAttackMenuOpt === ATTACK_MOVE_OPT.MOVE_3) {
            switch(direction) {
                case DIRECTION.RIGHT:
                    this.#selectAttackMenuOpt = ATTACK_MOVE_OPT.MOVE_4;
                    return;
                case DIRECTION.UP:
                    this.#selectAttackMenuOpt = ATTACK_MOVE_OPT.MOVE_1;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.DOWN:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }

        if(this.#selectAttackMenuOpt === ATTACK_MOVE_OPT.MOVE_4) {
            switch(direction) {
                case DIRECTION.LEFT:
                    this.#selectAttackMenuOpt = ATTACK_MOVE_OPT.MOVE_3;
                    return;
                case DIRECTION.UP:
                    this.#selectAttackMenuOpt = ATTACK_MOVE_OPT.MOVE_2;
                    return;
                case DIRECTION.RIGHT:
                case DIRECTION.DOWN:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }

        exhaustiveGuard(this.#selectAttackMenuOpt);

    }

    #moveMoveSelectBattleMenuCursor() {
        if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
            return;
        }

        switch(this.#selectAttackMenuOpt) {
            case ATTACK_MOVE_OPT.MOVE_1:
                this.#attackBattleMenuCursorPhaserImgGameObj.setPosition(ATTACK_MENUE_CURSOR_POS.x, ATTACK_MENUE_CURSOR_POS.y);
                return;
            case ATTACK_MOVE_OPT.MOVE_2:
                this.#attackBattleMenuCursorPhaserImgGameObj.setPosition(228, ATTACK_MENUE_CURSOR_POS.y);
                return;
            case ATTACK_MOVE_OPT.MOVE_3:
                this.#attackBattleMenuCursorPhaserImgGameObj.setPosition(ATTACK_MENUE_CURSOR_POS.x, 86);
                return;
            case ATTACK_MOVE_OPT.MOVE_4:
                this.#attackBattleMenuCursorPhaserImgGameObj.setPosition(228, 86);
                return;
            default:
                exhaustiveGuard(this.#selectAttackMenuOpt);
        }

    }

    #swtichToMainBattleMenu () {
        this.hideMsAttackSubMenu();
        this.showMainBattleMenu();
    }

    #handlePlayerChooseMainBattleOpt() {
        this.hideMainBattleMenu();

        if (this.#selectBattleMenuOpt === BATTLE_MENU_OPTION.FIGHT) {
            this.showMsAttackSubMenu();
            return;
        }

        if (this.#selectBattleMenuOpt === BATTLE_MENU_OPTION.ITEM) {
            /* 
                for the time being, we will display text about the player having no items
                and allow the player to navigate back to the main menu
            */
            this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_ITEM;
            this.updateInfoPaneMessageAndWaitForInput(['Your bag is empty...'], () =>{
                this.#swtichToMainBattleMenu();
            })
            return;
        }

        if (this.#selectBattleMenuOpt === BATTLE_MENU_OPTION.RUN) {
            /* 
                for the time being, we will display text about the player fail to run
                and allow the player to navigate back to the main menu
            */
                this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_RUN;
            this.updateInfoPaneMessageAndWaitForInput(['You fail to run away...'], () =>{
                this.#swtichToMainBattleMenu();
            })
            return;
        }

        exhaustiveGuard(this.#selectBattleMenuOpt)
    }

    #handlePlayerChooseAttack() {
        let selectedMoveIndex = 0;
        switch (this.#selectAttackMenuOpt) {
            case ATTACK_MOVE_OPT.MOVE_1:
                selectedMoveIndex = 0;
                break;
            case ATTACK_MOVE_OPT.MOVE_2:
                selectedMoveIndex = 1;
                break;
            case ATTACK_MOVE_OPT.MOVE_3:
                selectedMoveIndex = 2;
                break;
            case ATTACK_MOVE_OPT.MOVE_4:
                selectedMoveIndex = 3;
                break;
            default:
                exhaustiveGuard(this.#selectAttackMenuOpt);
        }

        this.#selectedAttackIndex = selectedMoveIndex;
    }
}