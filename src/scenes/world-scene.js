import { WORLD_ASSET_KEYS } from "../assets/asset-keys.js";
import { DIRECTION } from "../common/direction.js";
import { TILE_SIZE, TILED_COLLISION_LAYER_ALPHA } from "../config.js";
import Phaser from "../lib/phaser.js";
import { Controls } from "../utils/controls.js";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../utils/data-manager.js";
import { getTargetPositionFromGameObjectPositionAndDirection } from "../utils/grid-utils.js";
import { CANNOT_READ_SIGN_TEXT, SAMPLE_TEXT } from "../utils/text-utils.js";
import { NPC } from "../world/character/npc.js";
import { Player } from "../world/character/player.js";
import { DialogUi } from "../world/dialog-ui.js";
import { SCENE_KEYS } from "./scene-keys.js";


/**
 * @typedef TiledObjectProperty
 * @type {object}
 * @property {string} name
 * @property {string} type
 * @property {any} value
 */


const TILED_SIGN_PROPERTY = Object.freeze({
    MESSAGE: 'message',
  });

  const CUSTOM_TILED_TYPES = Object.freeze({
    NPC: 'npc',
    NPC_PATH: 'npc_path',
  });

  const TILED_NPC_PROPERTY = Object.freeze({
    IS_SPAWN_POINT: 'is_spawn_point',
    MOVEMENT_PATTERN: 'movement_pattern',
    MESSAGE: 'message',
    FRAME: 'frame',
  });

export class WorldScene extends Phaser.Scene {
    /**@type {Player} */
    #player;
    /**@type {Controls} */
    #controls;
    /**@type {Phaser.Tilemaps.TilemapLayer} */
    #encounterLayer;
    /**@type {boolean} */
    #monsterEncountered;
    /**@type {Phaser.Tilemaps.ObjectLayer} */
    #signLayer;
    /**@type {DialogUi} */
    #dialogUi;
    // /**@type {NPC []} */
    #npcs;

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
        
        // create map and collision layer
        const map = this.make.tilemap({key: WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL});
        // the first parameter is the name of the tileset in tiled and the seconde parameter is the key
        // of the tileset image used when loading the file in preload
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

        // create interactive layer
        this.#signLayer = map.getObjectLayer('Sign');
        if (!this.#signLayer) {
            console.log(`[${WorldScene.name}:create] encountered erro while creating sign layer using data from tiled`);
            return;
        }
        //console.log(this.#signLayer);

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

        //create NPCs
       this.#createNPCs(map);





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

        //create dialog ui
        this.#dialogUi = new DialogUi(this,1280);

        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    /**
     * 
     * @param {DOMHighResTimeStamp} time 
     * @returns {void}
     */
    update(time){
        if (this.#monsterEncountered) {
            this.#player.update(time);
            return;
        }
        
        const selectedDirection = this.#controls.getDirectionPressedDown();
        if(selectedDirection !== DIRECTION.NONE && !this.#isPlayerInputLocked()){
            this.#player.moveCharacter(selectedDirection);
        }

        if (this.#controls.wasSpaceKeyPressed() && !this.#player.isMoving) {
            this.#handlePlayerInteraction();
        } 

        this.#player.update(time);


        this.#npcs.forEach((npc) => {
            npc.update(time);
        }); 
    }

    #handlePlayerInteraction() {
        if(this.#dialogUi.isAnimationPlaying){
            return;
        }

        if(this.#dialogUi.isVisible && !this.#dialogUi.moreMessagesToShow){
            this.#dialogUi.hideDialogModal();
            return;
        }

        if(this.#dialogUi.isVisible && this.#dialogUi.moreMessagesToShow){
            this.#dialogUi.showNextMessage();
            return;
        }

        console.log('start of interaction check');

        const {x, y} = this.#player.sprite;
        const targetPosition = getTargetPositionFromGameObjectPositionAndDirection({x,y}, this.#player.direction);
        const nearbySign = this.#signLayer.objects.find((object) => {
            if (!object.x || !object.y) {
                return;
            }

            return object.x === targetPosition.x && object.y - TILE_SIZE === targetPosition.y;

        });

        if (nearbySign) {
            /** @type {TiledObjectProperty []} */
            const props = nearbySign.properties;
            /** @type {string} */
            const msg = props.find((props) => props.name === 'message')?.value;
            
            const usePlaceholderText = this.#player.direction !== DIRECTION.UP;
            let textToShow = CANNOT_READ_SIGN_TEXT;
            if (!usePlaceholderText) {
                textToShow = msg || SAMPLE_TEXT;
            }
            
            this.#dialogUi.showDialogModal([textToShow]);
            return;
        }
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

    #isPlayerInputLocked(){
        return this.#dialogUi.isVisible;
    }

    /**
     * @param {Phaser.Tilemaps.Tilemap} map
     * @returns {void} 
     */
    #createNPCs(map){
        this.#npcs = [];

        const npcLayers = map.getObjectLayerNames().filter((layerName)=>layerName.includes('NPC'));

        npcLayers.forEach((layerName) =>{
            const layer = map.getObjectLayer(layerName);
            
            const npcObject = layer.objects.find((obj) => {
                return obj.type === CUSTOM_TILED_TYPES.NPC;
            });
            if(!npcObject || npcObject.x === undefined || npcObject.y === undefined){
                return;
            }
            
            const npcFrame = npcObject.properties.find((property) => property.name === TILED_NPC_PROPERTY.FRAME)?.value || '0';

            const npc = new NPC({
                scene: this,
                position: {x: npcObject.x, y: npcObject.y - TILE_SIZE},
                direction: DIRECTION.DOWN,
                frame: parseInt(npcFrame,10)
            })
            this.#npcs.push(npc);
        });
    }
}