import { WORLD_ASSET_KEYS } from "../assets/asset-keys.js";
import { DIRECTION } from "../common/direction.js";
import { TILE_SIZE, TILED_COLLISION_LAYER_ALPHA } from "../config.js";
import Phaser from "../lib/phaser.js";
import { Controls } from "../utils/controls.js";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../utils/data-manager.js";
import { Player } from "../world/character/player.js";
import { SCENE_KEYS } from "./scene-keys.js";




export class WorldScene extends Phaser.Scene {
    /**@type {Player} */
    #player;
     /**@type {Controls} */
    #controls;
    /**@type {Phaser.Tilemaps.TilemapLayer} */
    #encounterLayer;
     /**@type {boolean} */
    #monsterEncountered;

    constructor() {
        super({
            key: SCENE_KEYS.WORLD_SCENE, 
        });
    }

    init() {
        this.#monsterEncountered = false;
    }

    create() {
        console.log(`[${WorldScene.name}:preload] invoked`);

        const x = 6 * TILE_SIZE;
        const y = 22 * TILE_SIZE;
        this.cameras.main.setBounds(0, 0, 1280, 2176);
        this.cameras.main.setZoom(0.8);
        this.cameras.main.centerOn(x, y);

        const map = this.make.tilemap({key: WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL});
        const collisionTiles = map.addTilesetImage('collision', WORLD_ASSET_KEYS.WORLD_COLLISION);
        if (!collisionTiles) {
            console.log(`[${WorldScene.name}:create] encountered erro while creating collision tiles using data from tiled`);
            return;
        }
        const collisionLayer = map.createLayer('Collision', collisionTiles, 0, 0);
        if (!collisionLayer) {
            console.log(`[${WorldScene.name}:create] encountered erro while creating collision layer using data from tiled`);
            return;
        }
        collisionLayer.setAlpha(TILED_COLLISION_LAYER_ALPHA).setDepth(2);

        const encounterTiles = map.addTilesetImage('encounter', WORLD_ASSET_KEYS.WORLD_ENCOUNTER_ZONE);
        if (!encounterTiles) {
            console.log(`[${WorldScene.name}:create] encountered erro while creating encounter tiles using data from tiled`);
            return;
        }
        this.#encounterLayer = map.createLayer('Encounter', encounterTiles, 0, 0);
        if (!this.#encounterLayer) {
            console.log(`[${WorldScene.name}:create] encountered erro while creating encounter layer using data from tiled`);
            return;
        }
        this.#encounterLayer.setAlpha(TILED_COLLISION_LAYER_ALPHA).setDepth(2);


        this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0);

        this.#player = new Player({
            scene: this,
            position: dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION),
            direction: dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION),
            collisionLayer: collisionLayer,
            spriteGridMovementFinishedCallback: () => {
                this.#handlePlayerMovementUpdate();
            },
        });

        this.cameras.main.startFollow(this.#player.sprite);

        this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_FOREGROUND, 0).setOrigin(0);

        this.#controls = new Controls(this);

        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    update(time){
        if (this.#monsterEncountered) {
            this.#player.update(time);
            return;
        }
        
        const selectedDirection = this.#controls.getDirectionPressedDown();
        if(selectedDirection !== DIRECTION.NONE){
            this.#player.moveCharacter(selectedDirection);
        }

        this.#player.update(time);
    }

    #handlePlayerMovementUpdate() {
        dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION, {
            x: this.#player.sprite.x,
            y: this.#player.sprite.y,
        });

        dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION, this.#player.direction);
        if (!this.#encounterLayer) {
            return;
        }

        const isInEncounterZone = this.#encounterLayer.getTileAtWorldXY(this.#player.sprite.x, this.#player.sprite.y, true).index !== -1;
        if (!isInEncounterZone) {
            return;
        }

        console.log(`[${WorldScene.name}:handlePlayerMovementUpdate]  player is in an encounter zone`);
        this.#monsterEncountered = Math.random() < 0.2;
        if (this.#monsterEncountered) {
            console.log(`[${WorldScene.name}:handlePlayerMovementUpdate]  player encountered a monster`);
            this.cameras.main.fadeOut(2000);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start(SCENE_KEYS.BATTLE_SCENE);
            });
        }
    }
}