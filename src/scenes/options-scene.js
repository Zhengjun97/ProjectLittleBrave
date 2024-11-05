import { UI_ASSET_KEYS } from "../assets/asset-keys.js";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../assets/font-keys.js";
import { DIRECTION } from "../common/direction.js";
import { BATTLE_SCENE_OPTIONS, BATTLE_STYLE_OPTIONS, OPTION_MENU_OPTIONS, SOUND_OPTIONS, TEXT_SPEED_OPTIONS } from "../common/options.js";
import Phaser from "../lib/phaser.js";
import { Controls } from "../utils/controls.js";
import { exhaustiveGuard } from "../utils/guard.js";
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

const TEXT_FONT_COLORS = Object.freeze({
    NOT_SELECTED: '#FFFFFF',
    SELECTED: '#FF2222',
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
    /** @type {Controls} */
    #contorls;
    /** @type {import("../common/options.js").OptionMenuOptions} */
    #selectedOptionMenu;
    /** @type {import("../common/options.js").TextSpeedMenuOptions} */
    #selectedTextSpeedOption;
    /** @type {import("../common/options.js").BattleSceneMenuOptions} */
    #selectedBattleSceneOption;
    /** @type {import("../common/options.js").BattleStyleMenuOptions} */
    #selectedBattleStyleOption;
    /** @type {import("../common/options.js").SoundMenuOptions} */
    #selectedSoundOption;
    /** @type {import("../common/options.js").VolumeMenuOptions} */
    #selectedVolumeOption;
    /** @type {import("../common/options.js").MenuColorOptions} */
    #selectedMenuColorOption;

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
            assetKeys: [UI_ASSET_KEYS.MENU_BACKGROUND,UI_ASSET_KEYS.MENU_BACKGROUND_GREEN,UI_ASSET_KEYS.MENU_BACKGROUND_PURPLE]
        });
        this.#selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED;
        this.#selectedTextSpeedOption = TEXT_SPEED_OPTIONS.MID;
        this.#selectedBattleSceneOption = BATTLE_SCENE_OPTIONS.ON;
        this.#selectedBattleStyleOption = BATTLE_STYLE_OPTIONS.SHIFT;
        this.#selectedSoundOption = SOUND_OPTIONS.ON;
        this.#selectedVolumeOption = 4;
        this.#selectedMenuColorOption = 0;
    }

    create() {
        console.log(`[${OptionsScene.name}:create] invoked`);

        const { width, height } = this.scale;
        const optionMenuWidth = width - 200;

        //main options container
        this.#mainContainer = this.#nineSliceMainContainer.createNineSliceContainer(this, optionMenuWidth, 432, UI_ASSET_KEYS.MENU_BACKGROUND);
        this.#mainContainer.setX(100).setY(20);

        //create main option sections
        this.add.text(width / 2, 40, 'Options', OPTIONS_TEXT_STYLE).setOrigin(0.5);
        const menuOptionsPositon = {
            x: 25,
            yStart: 55,
            yIncrement: 55
        };
        const menuOptions = ['Text Speed', 'Battle Scene', 'Battle Style', 'Sound', 'Volume', 'Menu Color', 'Close'];
        menuOptions.forEach((option, index) => {
            const x = menuOptionsPositon.x;
            const y = menuOptionsPositon.yStart + menuOptionsPositon.yIncrement * index;
            const textGameObject = this.add.text(x, y, option, OPTIONS_TEXT_STYLE);
            this.#mainContainer.add(textGameObject);
        });

        //create text speed options
        this.#textSpeedOptionTextGameObjects = this.add.group([
            this.add.text(420, 75, 'Slow', OPTIONS_TEXT_STYLE),
            this.add.text(590, 75, 'Mid', OPTIONS_TEXT_STYLE),
            this.add.text(760, 75, 'Fast', OPTIONS_TEXT_STYLE)
        ]);

        //create battle scene options
        this.#battleSceneOptionTextGameObjects = this.add.group([
            this.add.text(420, 130, 'On', OPTIONS_TEXT_STYLE),
            this.add.text(590, 130, 'Off', OPTIONS_TEXT_STYLE),
        ]);

        //create battle style options
        this.#battleStyleOptionTextGameObjects = this.add.group([
            this.add.text(420, 185, 'Set', OPTIONS_TEXT_STYLE),
            this.add.text(590, 185, 'Shift', OPTIONS_TEXT_STYLE),
        ]);

        //create sounds options
        this.#soundOptionTextGameObjects = this.add.group([
            this.add.text(420, 240, 'On', OPTIONS_TEXT_STYLE),
            this.add.text(590, 240, 'Off', OPTIONS_TEXT_STYLE),
        ]);

        //create volume options
        this.add.rectangle(420, 312, 300, 4, 0xffffff, 1).setOrigin(0, 0.5);
        this.#volumeOptionsMenuCursor = this.add.rectangle(710, 312, 10, 25, 0xff2222, 1).setOrigin(0, 0.5);
        this.#volumeOptionsVauleText = this.add.text(760, 295, '100%', OPTIONS_TEXT_STYLE);

        //frame options
        this.#selectedMenuColorTextGameObject = this.add.text(590, 350, '', OPTIONS_TEXT_STYLE);
        this.add.image(530, 352, UI_ASSET_KEYS.CURSOR).setOrigin(1, 0).setScale(2.5).setFlipX(true);
        this.add.image(660, 352, UI_ASSET_KEYS.CURSOR).setOrigin(0, 0).setScale(2.5);

        //option details container
        this.#infoContainer = this.#nineSliceMainContainer.createNineSliceContainer(this, optionMenuWidth, 100,UI_ASSET_KEYS.MENU_BACKGROUND);
        this.#infoContainer.setX(100).setY(height - 110);
        this.#selectedOptionInfoMsgTextGameObject = this.add.text(125, 480, OPTION_MENU_OPTION_INFO_MSG.TEXT_SPEED, {
            ...OPTIONS_TEXT_STYLE,
            ...{
                wordWrap: { width: width - 250 },
            }
        });

        this.#optionsMenuCursor = this.add.rectangle(110, 70, optionMenuWidth - 20, 40, 0xffffff, 0).setOrigin(0).setStrokeStyle(4, 0xe4434a, 1);

        this.#updateTextSpeedGameObject();
        this.#updateBattleSceneOptionGameObject();
        this.#updateBattleStyleOptionGameObject();
        this.#updateSoundOptionGameObject();
        this.#updateVolumeSlider();
        this.#updateMenuColorDisplayText();

        this.#contorls = new Controls(this);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(SCENE_KEYS.TITLE_SCENE);
        });
    }

    update() {
        if (this.#contorls.isInputLocked) {
            return;
        }
        if (this.#contorls.wasBackKeyPressed()) {
            this.#contorls.lockInput = true;
            this.cameras.main.fadeOut(500, 0, 0, 0);
            return;
        }

        if (this.#contorls.wasSpaceKeyPressed() && this.#selectedOptionMenu === OPTION_MENU_OPTIONS.CONFIRM) {
            this.#contorls.lockInput = true;
            this.cameras.main.fadeOut(500, 0, 0, 0);
            return;
        }

        const selectedDirection = this.#contorls.getDirectionKeyJustPressed();
        if (selectedDirection !== DIRECTION.NONE) {
            this.#moveOptionMenuCursor(selectedDirection);
        }
    }

    /**
     * 
     * @param {import("../common/direction.js").Direction} direction 
     */
    #moveOptionMenuCursor(direction) {
        if (direction === DIRECTION.NONE) {
            return;
        }
        this.#updateSelectedOptionMenuFromInput(direction);

        switch (this.#selectedOptionMenu) {
            case OPTION_MENU_OPTIONS.TEXT_SPEED:
                this.#optionsMenuCursor.setY(70);
                break;
            case OPTION_MENU_OPTIONS.BATTLE_SCENE:
                this.#optionsMenuCursor.setY(123);
                break;
            case OPTION_MENU_OPTIONS.BATTLE_STYLE:
                this.#optionsMenuCursor.setY(180);
                break;
            case OPTION_MENU_OPTIONS.SOUND:
                this.#optionsMenuCursor.setY(235);
                break;
            case OPTION_MENU_OPTIONS.VOLUME:
                this.#optionsMenuCursor.setY(290);
                break;
            case OPTION_MENU_OPTIONS.MENU_COLOR:
                this.#optionsMenuCursor.setY(345);
                break;
            case OPTION_MENU_OPTIONS.CONFIRM:
                this.#optionsMenuCursor.setY(400);
                break;
            default:
                exhaustiveGuard(this.#selectedOptionMenu);
        }

        this.#selectedOptionInfoMsgTextGameObject.setText(OPTION_MENU_OPTION_INFO_MSG[this.#selectedOptionMenu]);
    }

    /**
     * 
     * @param {import("../common/direction.js").Direction} direction 
     */
    #updateSelectedOptionMenuFromInput(direction) {
        if (direction === DIRECTION.NONE) {
            return;
        }

        if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.TEXT_SPEED) {
            switch (direction) {
                case DIRECTION.DOWN:
                    this.#selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_SCENE;
                    return;
                case DIRECTION.UP:
                    this.#selectedOptionMenu = OPTION_MENU_OPTIONS.CONFIRM;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.RIGHT:
                    this.#updateTextSpeedOption(direction);
                    this.#updateTextSpeedGameObject();
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }
        if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.BATTLE_SCENE) {
            switch (direction) {
                case DIRECTION.DOWN:
                    this.#selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_STYLE;
                    return;
                case DIRECTION.UP:
                    this.#selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.RIGHT:
                    this.#updateBattleSceneOption(direction)
                    this.#updateBattleSceneOptionGameObject();
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }
        if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.BATTLE_STYLE) {
            switch (direction) {
                case DIRECTION.DOWN:
                    this.#selectedOptionMenu = OPTION_MENU_OPTIONS.SOUND;
                    return;
                case DIRECTION.UP:
                    this.#selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_SCENE;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.RIGHT:
                    this.#updateBattleStyleOption(direction);
                    this.#updateBattleStyleOptionGameObject();
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }
        if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.SOUND) {
            switch (direction) {
                case DIRECTION.DOWN:
                    this.#selectedOptionMenu = OPTION_MENU_OPTIONS.VOLUME;
                    return;
                case DIRECTION.UP:
                    this.#selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_STYLE;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.RIGHT:
                    this.#updateSoundOption(direction);
                    this.#updateSoundOptionGameObject();
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }
        if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.VOLUME) {
            switch (direction) {
                case DIRECTION.DOWN:
                    this.#selectedOptionMenu = OPTION_MENU_OPTIONS.MENU_COLOR;
                    return;
                case DIRECTION.UP:
                    this.#selectedOptionMenu = OPTION_MENU_OPTIONS.SOUND;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.RIGHT:
                    this.#updateVolumeOption(direction);
                    this.#updateVolumeSlider();
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }
        if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.MENU_COLOR) {
            switch (direction) {
                case DIRECTION.DOWN:
                    this.#selectedOptionMenu = OPTION_MENU_OPTIONS.CONFIRM;
                    return;
                case DIRECTION.UP:
                    this.#selectedOptionMenu = OPTION_MENU_OPTIONS.VOLUME;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.RIGHT:
                    this.#updateMenuColorOption(direction);
                    this.#updateMenuColorDisplayText();
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }
        if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.CONFIRM) {
            switch (direction) {
                case DIRECTION.DOWN:
                    this.#selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED;
                    return;
                case DIRECTION.UP:
                    this.#selectedOptionMenu = OPTION_MENU_OPTIONS.MENU_COLOR;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.RIGHT:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }

        exhaustiveGuard(this.#selectedOptionMenu);
    }

    /**
     * 
     * @param {'LEFT' | 'RIGHT'} direction 
     */
    #updateTextSpeedOption(direction) {
        if (direction === DIRECTION.LEFT) {
            if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.SLOW) {
                return;
            }
            if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.MID) {
                this.#selectedTextSpeedOption = TEXT_SPEED_OPTIONS.SLOW;
                return;
            }
            if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.FAST) {
                this.#selectedTextSpeedOption = TEXT_SPEED_OPTIONS.MID;
                return;
            }
            exhaustiveGuard(this.#selectedTextSpeedOption);
            return;
        }
        if (direction === DIRECTION.RIGHT) {
            if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.FAST) {
                return;
            }
            if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.MID) {
                this.#selectedTextSpeedOption = TEXT_SPEED_OPTIONS.FAST;
                return;
            }
            if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.SLOW) {
                this.#selectedTextSpeedOption = TEXT_SPEED_OPTIONS.MID;
                return;
            }
            exhaustiveGuard(this.#selectedTextSpeedOption);
            return;
        }
        exhaustiveGuard(direction);
    }

    #updateTextSpeedGameObject() {
        const textGameObject = /** @type {Phaser.GameObjects.Text[]} */(this.#textSpeedOptionTextGameObjects.getChildren());
        textGameObject.forEach((obj) => {
            obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED);
        });

        if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.SLOW) {
            textGameObject[0].setColor(TEXT_FONT_COLORS.SELECTED);
            return;
        }
        if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.MID) {
            textGameObject[1].setColor(TEXT_FONT_COLORS.SELECTED);
            return;
        }
        if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.FAST) {
            textGameObject[2].setColor(TEXT_FONT_COLORS.SELECTED);
            return;
        }

        exhaustiveGuard(this.#selectedTextSpeedOption);
    }

    /**
     * 
     * @param {'LEFT' | 'RIGHT'} direction 
     */
    #updateBattleSceneOption(direction) {
        if (direction === DIRECTION.LEFT && this.#selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.ON) {
            return;
        }
        if (direction === DIRECTION.LEFT) {
            this.#selectedBattleSceneOption = BATTLE_SCENE_OPTIONS.ON;
            return;
        }

        if (direction === DIRECTION.RIGHT && this.#selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.OFF) {
            return;
        }
        if (direction === DIRECTION.RIGHT) {
            this.#selectedBattleSceneOption = BATTLE_SCENE_OPTIONS.OFF;
            return;
        }
        exhaustiveGuard(direction);
    }

    #updateBattleSceneOptionGameObject() {
        const textGameObject = /** @type {Phaser.GameObjects.Text[]} */(this.#battleSceneOptionTextGameObjects.getChildren());
        textGameObject.forEach((obj) => {
            obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED);
        });

        if (this.#selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.OFF) {
            textGameObject[1].setColor(TEXT_FONT_COLORS.SELECTED);
            return;
        }
        if (this.#selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.ON) {
            textGameObject[0].setColor(TEXT_FONT_COLORS.SELECTED);
            return;
        }
        exhaustiveGuard(this.#selectedBattleSceneOption);
    }

    /**
     * 
     * @param {'LEFT' | 'RIGHT'} direction 
     */
    #updateBattleStyleOption(direction) {
        if (direction === DIRECTION.LEFT && this.#selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SET) {
            return;
        }
        if (direction === DIRECTION.LEFT) {
            this.#selectedBattleStyleOption = BATTLE_STYLE_OPTIONS.SET;
            return;
        }

        if (direction === DIRECTION.RIGHT && this.#selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SHIFT) {
            return;
        }
        if (direction === DIRECTION.RIGHT) {
            this.#selectedBattleStyleOption = BATTLE_STYLE_OPTIONS.SHIFT;
            return;
        }
        exhaustiveGuard(direction);
    }

    #updateBattleStyleOptionGameObject() {
        const textGameObject = /** @type {Phaser.GameObjects.Text[]} */(this.#battleStyleOptionTextGameObjects.getChildren());
        textGameObject.forEach((obj) => {
            obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED);
        });

        if (this.#selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SHIFT) {
            textGameObject[1].setColor(TEXT_FONT_COLORS.SELECTED);
            return;
        }
        if (this.#selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SET) {
            textGameObject[0].setColor(TEXT_FONT_COLORS.SELECTED);
            return;
        }
        exhaustiveGuard(this.#selectedBattleStyleOption);
    }

    /**
     * 
     * @param {'LEFT' | 'RIGHT'} direction 
     */
    #updateSoundOption(direction) {
        if (direction === DIRECTION.LEFT && this.#selectedSoundOption === SOUND_OPTIONS.ON) {
            return;
        }
        if (direction === DIRECTION.LEFT) {
            this.#selectedSoundOption = SOUND_OPTIONS.ON;
            return;
        }

        if (direction === DIRECTION.RIGHT && this.#selectedSoundOption === SOUND_OPTIONS.OFF) {
            return;
        }
        if (direction === DIRECTION.RIGHT) {
            this.#selectedSoundOption = SOUND_OPTIONS.OFF;
            return;
        }
        exhaustiveGuard(direction);
    }

    #updateSoundOptionGameObject() {
        const textGameObject = /** @type {Phaser.GameObjects.Text[]} */(this.#soundOptionTextGameObjects.getChildren());
        textGameObject.forEach((obj) => {
            obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED);
        });

        if (this.#selectedSoundOption === SOUND_OPTIONS.OFF) {
            textGameObject[1].setColor(TEXT_FONT_COLORS.SELECTED);
            return;
        }
        if (this.#selectedSoundOption === SOUND_OPTIONS.ON) {
            textGameObject[0].setColor(TEXT_FONT_COLORS.SELECTED);
            return;
        }
        exhaustiveGuard(this.#selectedSoundOption);
    }

    /**
     * 
     * @param {'LEFT' | 'RIGHT'} direction 
     */
    #updateVolumeOption(direction) {
        if (direction === DIRECTION.LEFT && this.#selectedVolumeOption === 0) {
            return;
        }
        if (direction === DIRECTION.LEFT) {
            this.#selectedVolumeOption = /** @type {import("../common/options.js").VolumeMenuOptions} */(this.#selectedVolumeOption - 1);
            return;
        }
        if (direction === DIRECTION.RIGHT && this.#selectedVolumeOption === 4) {
            return;
        }
        if (direction === DIRECTION.RIGHT) {
            this.#selectedVolumeOption = /** @type {import("../common/options.js").VolumeMenuOptions} */(this.#selectedVolumeOption + 1);
            return;
        }
    }

    #updateVolumeSlider() {
        switch (this.#selectedVolumeOption) {
            case 0:
                this.#volumeOptionsMenuCursor.setX(420);
                this.#volumeOptionsVauleText.setText('0%');
                break;
            case 1:
                this.#volumeOptionsMenuCursor.setX(490);
                this.#volumeOptionsVauleText.setText('25%');
                break;
            case 2:
                this.#volumeOptionsMenuCursor.setX(560);
                this.#volumeOptionsVauleText.setText('50%');
                break;
            case 3:
                this.#volumeOptionsMenuCursor.setX(630);
                this.#volumeOptionsVauleText.setText('75%');
                break;
            case 4:
                this.#volumeOptionsMenuCursor.setX(710);
                this.#volumeOptionsVauleText.setText('100%');
                break;
            default:
                exhaustiveGuard(this.#selectedVolumeOption);
        }

    }

    /**
     * 
     * @param {'LEFT' | 'RIGHT'} direction 
     */
    #updateMenuColorOption(direction) {
        if (direction === DIRECTION.LEFT && this.#selectedMenuColorOption === 0) {
            this.#selectedMenuColorOption = 2;
            return;
        }
        if (direction === DIRECTION.RIGHT && this.#selectedMenuColorOption === 2) {
            this.#selectedMenuColorOption = 0;
            return;
        }
        if (direction === DIRECTION.LEFT) {
            this.#selectedMenuColorOption -= 1;
            return;
        }
        if (direction === DIRECTION.RIGHT) {
            this.#selectedMenuColorOption += 1;
            return;
        }
        exhaustiveGuard(direction);
    }

    /**
     * @returns {void}
     */
    #updateMenuColorDisplayText() {
        switch (this.#selectedMenuColorOption) {
            case 0:
                this.#selectedMenuColorTextGameObject.setText('1');
                this.#nineSliceMainContainer.updateNineSliceContainerTexture(this.sys.textures, this.#mainContainer, UI_ASSET_KEYS.MENU_BACKGROUND);
                this.#nineSliceMainContainer.updateNineSliceContainerTexture(this.sys.textures, this.#infoContainer, UI_ASSET_KEYS.MENU_BACKGROUND);

                break;
            case 1:
                this.#selectedMenuColorTextGameObject.setText('2');
                this.#nineSliceMainContainer.updateNineSliceContainerTexture(this.sys.textures, this.#mainContainer, UI_ASSET_KEYS.MENU_BACKGROUND_GREEN);
                this.#nineSliceMainContainer.updateNineSliceContainerTexture(this.sys.textures, this.#infoContainer, UI_ASSET_KEYS.MENU_BACKGROUND_GREEN);

                break;
            case 2:
                this.#selectedMenuColorTextGameObject.setText('3');
                this.#nineSliceMainContainer.updateNineSliceContainerTexture(this.sys.textures, this.#mainContainer, UI_ASSET_KEYS.MENU_BACKGROUND_PURPLE);
                this.#nineSliceMainContainer.updateNineSliceContainerTexture(this.sys.textures, this.#infoContainer, UI_ASSET_KEYS.MENU_BACKGROUND_PURPLE);

                break;
            default:
                exhaustiveGuard(this.#selectedMenuColorOption);

        }
    }

}

