import { MONSTER_ASSET_KEYS } from "../../../../assets/asset-keys.js";

const BATTLE_MENU_OPTION = Object.freeze({
    FIGHT: 'FIGHT',
    SWITCH: 'SWITCH',
    ITEM: 'ITEM',
    RUN: 'RUN',
}) 

const battleTextUiStyle = {
    color: 'black', fontSize: '30px',
}

export class BattleMenu {
    #scene;
    #mainBattleMenuPhaserContainerGameObj;
    #moveSelectionSubBattleMenuPhaserContainerGameObj;
    #battleTextGameObjLine1;
    #battleTextGameObjLine2;
    /** @type {Phaser.GameObjects.Text} */

    constructor(scene) {
        this.#scene = scene;
        this.#mainInfoPane();
        this.#createMainBattleMenu();
        this.#createMsAttackSubMenu();
    }

    showMainBattleMenu() {
        this.#battleTextGameObjLine1.setText('what should');
        this.#mainBattleMenuPhaserContainerGameObj.setAlpha(1);
        this.#battleTextGameObjLine1.setAlpha(1);
        this.#battleTextGameObjLine2.setAlpha(1);
    }

    hideMainBattleMenu() {
        this.#mainBattleMenuPhaserContainerGameObj.setAlpha(0);
        this.#battleTextGameObjLine1.setAlpha(0);
        this.#battleTextGameObjLine2.setAlpha(0);
    }

    showMsAttackSubMenu() {
        this.#moveSelectionSubBattleMenuPhaserContainerGameObj.setAlpha(1);
    }

    hideMsAttackSubMenu() {
        this.#moveSelectionSubBattleMenuPhaserContainerGameObj.setAlpha(0);
    }

    //render out the main info and sub info panes
    #createMainBattleMenu() {
        this.#battleTextGameObjLine1 = this.#scene.add.text(20, 468, 'what should', battleTextUiStyle);
        //update to use monstrer data that is passed into this class instance
        this.#battleTextGameObjLine2 = this.#scene.add.text(20, 512, `${MONSTER_ASSET_KEYS.IGUANIGNITE} do next`, battleTextUiStyle);
        this.#mainBattleMenuPhaserContainerGameObj = this.#scene.add.container(520, 448,[this.#mainInfoSubPane(), 
            this.#scene.add.text(55, 22, BATTLE_MENU_OPTION.FIGHT, battleTextUiStyle),
            this.#scene.add.text(240, 22, BATTLE_MENU_OPTION.SWITCH, battleTextUiStyle),
            this.#scene.add.text(55, 70, BATTLE_MENU_OPTION.ITEM, battleTextUiStyle),
            this.#scene.add.text(240, 70, BATTLE_MENU_OPTION.RUN, battleTextUiStyle),
        ]);

        this.hideMainBattleMenu();
    }

    #createMsAttackSubMenu() {
        this.#moveSelectionSubBattleMenuPhaserContainerGameObj = this.#scene.add.container(0, 448, [
            this.#scene.add.text(55, 22, '-', battleTextUiStyle),
            this.#scene.add.text(240, 22, '-', battleTextUiStyle),
            this.#scene.add.text(55, 70, '-', battleTextUiStyle),
            this.#scene.add.text(240, 70, '-', battleTextUiStyle),
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
}