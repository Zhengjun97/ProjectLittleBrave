
import { ATTACK_ASSET_KEYS, BATTLE_ASSET_KEYS, BATTLE_BACKGROUND_ASSET_KEYS, CHARACTER_ASSET_KEYS, DATA_ASSET_KEYS, HEALTH_BAR_ASSET_KEYS, MONSTER_ASSET_KEYS, MONSTER_PARTY_ASSET_KEYS, TITLE_ASSET_KEYS, UI_ASSET_KEYS, WORLD_ASSET_KEYS } from "../assets/asset-keys.js";
import Phaser from "../lib/phaser.js";
import { SCENE_KEYS } from "./scene-keys.js";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../assets/font-keys.js";
import { WebFontFileLoader } from "../assets/web-font-file-loader.js";
import { DataUtils } from "../utils/data-utils.js";
import { dataManager } from "../utils/data-manager.js";
import { BaseScene } from "./base-scene.js";

export class PreloadScene extends BaseScene{
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE, //unique key for pharse scene
        });
        console.log(SCENE_KEYS.PRELOAD_SCENE);  
    }

    //phaser life cycle events



    preload() {
        super.preload();

        
        const mosterTamerAssetPath = 'assets/images/monster-tamer';
        const kenneysAssetPath = 'assets/images/kenneys-assets';
        const pimenAssetPath = 'assets/images/pimen';
        const axulArtPath = 'assets/images/axulart';
        const pbGamesArtPath = 'assets/images/parabellum-games';
        
        //battle backgrounds
        this.load.image(BATTLE_BACKGROUND_ASSET_KEYS.FOREST, `${mosterTamerAssetPath}/battle-backgrounds/forest-background.png`);
        //battle assets
        this.load.image(BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND, `${kenneysAssetPath}/ui-space-expansion/custom-ui.png`);
        //health bar assets
        this.load.image(HEALTH_BAR_ASSET_KEYS.RIGHT_CAP, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_right.png`);
        this.load.image(HEALTH_BAR_ASSET_KEYS.MIDDLE, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_mid.png`);
        this.load.image(HEALTH_BAR_ASSET_KEYS.LEFT_CAP, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_left.png`);

        this.load.image(HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_left.png`);
        this.load.image(HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_mid.png`);
        this.load.image(HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_right.png`);

        //monster assets
        this.load.image(MONSTER_ASSET_KEYS.CARNODUSK, `${mosterTamerAssetPath}/monsters/carnodusk.png`);
        this.load.image(MONSTER_ASSET_KEYS.IGUANIGNITE, `${mosterTamerAssetPath}/monsters/iguanignite.png`);
        
        //ui assets
        this.load.image(UI_ASSET_KEYS.CURSOR, `${mosterTamerAssetPath}/ui/cursor_white.png`);
        //this.load.image(UI_ASSET_KEYS.CURSOR_WHITE, `${mosterTamerAssetPath}/ui/cursor_white.png`);
        this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND, `${kenneysAssetPath}/ui-space-expansion/glassPanel.png`);
        this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND_PURPLE, `${kenneysAssetPath}/ui-space-expansion/glassPanel_purple.png`);
        this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND_GREEN, `${kenneysAssetPath}/ui-space-expansion/glassPanel_green.png`);


        this.load.image(UI_ASSET_KEYS.BULE_BUTTON, `${kenneysAssetPath}/ui-pack/blue_button01.png`);
        this.load.image(UI_ASSET_KEYS.BULE_BUTTON_SELECTED, `${kenneysAssetPath}/ui-pack/blue_button00.png`);
        
        //load json data
        this.load.json(DATA_ASSET_KEYS.ATTACKS, 'assets/data/attacks.json');
        this.load.json(DATA_ASSET_KEYS.ANIMATIONS, 'assets/data/animations.json');

        //load custom font
        this.load.addFile(new WebFontFileLoader(this.load, [KENNEY_FUTURE_NARROW_FONT_NAME]));

        //load attack assets
        this.load.spritesheet(ATTACK_ASSET_KEYS.ICE_SHARD, `${pimenAssetPath}/ice-attack/active.png`, {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet(ATTACK_ASSET_KEYS.ICE_SHARD_START, `${pimenAssetPath}/ice-attack/start.png`, {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet(ATTACK_ASSET_KEYS.SLASH, `${pimenAssetPath}/slash.png`, {
            frameWidth: 48,
            frameHeight: 48,
        });

        //load world assets
        this.load.image(WORLD_ASSET_KEYS.WORLD_BACKGROUND, `${mosterTamerAssetPath}/map/level_background.png`);
        this.load.tilemapTiledJSON(WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL, `assets/data/level.json`);
        this.load.image(WORLD_ASSET_KEYS.WORLD_COLLISION, `${mosterTamerAssetPath}/map/collision.png`);
        this.load.image(WORLD_ASSET_KEYS.WORLD_FOREGROUND, `${mosterTamerAssetPath}/map/level_foreground.png`);
        this.load.image(WORLD_ASSET_KEYS.WORLD_ENCOUNTER_ZONE, `${mosterTamerAssetPath}/map/encounter.png`);

        //load character images
        this.load.spritesheet(CHARACTER_ASSET_KEYS.PLAYER, `${axulArtPath}/character/custom.png`, {
            frameWidth: 64,
            frameHeight: 88,
        });
        this.load.spritesheet(CHARACTER_ASSET_KEYS.NPC, `${pbGamesArtPath}/characters.png`, {
            frameWidth: 16,
            frameHeight: 16,
        });

        //UI comp for title
        this.load.image(TITLE_ASSET_KEYS.BACKGROUND, `${mosterTamerAssetPath}/ui/title/background.png`);
        this.load.image(TITLE_ASSET_KEYS.PANEL, `${mosterTamerAssetPath}/ui/title/title_background.png`);
        this.load.image(TITLE_ASSET_KEYS.TITLE, `${mosterTamerAssetPath}/ui/title/title_text.png`);

        //ui components for party
        this.load.image(MONSTER_PARTY_ASSET_KEYS.PARTY_BACKGROUND, `${mosterTamerAssetPath}/ui/monster-party/background.png`);
        this.load.image(MONSTER_PARTY_ASSET_KEYS.MONSTER_DETAILES_BACKGROUND, `${mosterTamerAssetPath}/ui/monster-party/monster-details-background.png`);

    }

    create() {
       
        super.create();
        this.#createAnimation();
        dataManager.loadData();
        this.scene.start(SCENE_KEYS.TITLE_SCENE);
    }

    #createAnimation() {
        const animations = DataUtils.getAnimations(this);
        console.log(animations);
        animations.forEach((animation) => {
          const frames = animation.frames
            ? this.anims.generateFrameNumbers(animation.assetKey, { frames: animation.frames })
            : this.anims.generateFrameNumbers(animation.assetKey);
          this.anims.create({
            key: animation.key,
            frames: frames,
            frameRate: animation.frameRate,
            repeat: animation.repeat,
            delay: animation.delay,
            yoyo: animation.yoyo,
          });
        });
      }

}