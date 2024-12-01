import { AUDIO_ASSET_KEYS, WORLD_ASSET_KEYS } from "../assets/asset-keys.js";
import { DIRECTION } from "../common/direction.js";
import { TILE_SIZE, TILED_COLLISION_LAYER_ALPHA } from "../config.js";
import Phaser from "../lib/phaser.js";
import { playBackgroundMusic, playSoundFx } from "../utils/audio-utils.js";
import { Controls } from "../utils/controls.js";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../utils/data-manager.js";
import { DataUtils } from "../utils/data-utils.js";
import { getTargetPositionFromGameObjectPositionAndDirection } from "../utils/grid-utils.js";
import { weightedRandom } from "../utils/random.js";
import { CANNOT_READ_SIGN_TEXT, SAMPLE_TEXT } from "../utils/text-utils.js";
import { NPC } from "../world/character/npc.js";
import { Player } from "../world/character/player.js";
import { DialogUi } from "../world/dialog-ui.js";
import { Item } from "../world/item.js";
import { Menu } from "../world/menu/menu.js";
import { BaseScene } from "./base-scene.js";
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
    MESSAGES: 'messages',
    FRAME: 'frame',
});

const TILED_ENCOUNTER_PROPERTY = Object.freeze({
    AREA: 'area',
});

const TILED_ITEM_PROPERTY = Object.freeze({
    ITEM_ID: 'item_id',
    ID: 'id',
});

/**
 * @typedef WorldSceneData
 * @type {object}
 * @property {boolean} isPlayerKnockOut
 */

export class WorldScene extends BaseScene {
    /**@type {Player} */
    #player;
    /**@type {Phaser.Tilemaps.TilemapLayer} */
    #encounterLayer;
    /**@type {boolean} */
    #monsterEncountered;
    /**@type {Phaser.Tilemaps.ObjectLayer} */
    #signLayer;
    /**@type {DialogUi} */
    #dialogUi;
    /**@type {NPC []} */
    #npcs;
    /**@type {NPC | undefined} */
    #npcPlayerIsInteractingWith;
    /**@type {Menu} */
    #menu;
    /**@type {WorldSceneData} */
    #sceneData;
     /**@type {Item[]} */
    #items;

    constructor() {
        super({
            key: SCENE_KEYS.WORLD_SCENE,
        });
    }

    /**
     * @param {WorldSceneData} data 
     * @returns {void}
     */
    init(data) {
        super.init();
        this.#sceneData = data;

        if(Object.keys(data).length === 0){
            this.#sceneData = {
                isPlayerKnockOut: false,
            };
        }

        console.log(this.#sceneData);

        this.#monsterEncountered = false;
        this.#npcPlayerIsInteractingWith = undefined;

        //UPDATE plauyer location, and map data if the player was knocked out in a battle
        if(this.#sceneData.isPlayerKnockOut){
            dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION, {
                x: 6 * TILE_SIZE,
                y: 21 * TILE_SIZE,
            });

            dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION,DIRECTION.DOWN);

        }

        this.#items = [];
    }

    create() {
        super.create();


        const x = 6 * TILE_SIZE;
        const y = 22 * TILE_SIZE;
        this.cameras.main.setBounds(0, 0, 1280, 2176);
        this.cameras.main.setZoom(0.8);
        this.cameras.main.centerOn(x, y);

        // create map and collision layer
        const map = this.make.tilemap({ key: WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL });
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

        //create items and collison
        this.#createItems(map);
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
            spriteChangedDirectionCallback: ()=> {
                this.#handlePlayerDirectionUpdate();
            },
            otherCharactersToCheckForCollisionsWith: this.#npcs,
        });

        this.cameras.main.startFollow(this.#player.sprite);

        // update our collisions with npcs
        this.#npcs.forEach((npc) => {
            npc.addCharacterToCheckForCollisionsWith(this.#player);
        });

        this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_FOREGROUND, 0).setOrigin(0);

 
        //create dialog ui
        this.#dialogUi = new DialogUi(this, 1280);

        //create Menu
        this.#menu = new Menu(this);


        this.cameras.main.fadeIn(1000, 0, 0, 0,(camera,progress) =>{
            if(progress === 1){
                //if the player was knocked out, we want to lock nput, heal player, and then have npc show message
                if(this.#sceneData.isPlayerKnockOut){
                    this.#healPlayerParty();
                    this.#dialogUi.showDialogModal([
                        'It looks like you are exhausted...',
                        'I went ahead and healed you.'
                    ]);
                }
            }
        });

        dataManager.store.set(DATA_MANAGER_STORE_KEYS.GAME_STARTED, true);

        //add audio
        playBackgroundMusic(this,AUDIO_ASSET_KEYS.MAIN);

    }

    /**
   * @param {DOMHighResTimeStamp} time
   * @returns {void}
   */
  update(time) {
    super.update();
    if (this.#monsterEncountered) {
      this.#player.update(time);
      return;
    }

    const wasSpaceKeyPressed = this._contorls.wasSpaceKeyPressed();
    const selectedDirectionHelDown = this._contorls.getDirectionPressedDown();
    const selectedDirectionPressedOnce = this._contorls.getDirectionKeyJustPressed();
    if (selectedDirectionHelDown !== DIRECTION.NONE && !this.#isPlayerInputLocked()) {
      this.#player.moveCharacter(selectedDirectionHelDown);
    }

    if (wasSpaceKeyPressed && !this.#player.isMoving && !this.#menu.isVisible) {
      this.#handlePlayerInteraction();
    }

    if (this._contorls.wasEnterKeyPressed() && !this.#player.isMoving) {
      if (this.#dialogUi.isVisible) {
        return;
      }

      if (this.#menu.isVisible) {
        this.#menu.hide();
        return;
      }

      this.#menu.show();
    }

    if (this.#menu.isVisible) {
      if (selectedDirectionPressedOnce !== DIRECTION.NONE) {
        this.#menu.handlePlayerInput(selectedDirectionPressedOnce);
      }

      if (wasSpaceKeyPressed) {
        this.#menu.handlePlayerInput('OK');

        if (this.#menu.selectedMenuOption === 'SAVE') {
          this.#menu.hide();
          dataManager.saveData();
          this.#dialogUi.showDialogModal(['Game progress has been saved']);
        } 
        
        if (this.#menu.selectedMenuOption === 'Character') {
            const sceneDataToPass = {
                previousSceneName:SCENE_KEYS.WORLD_SCENE
            };
            this.scene.launch(SCENE_KEYS.MONSTER_PARTY_SCENE, sceneDataToPass);
            this.scene.pause(SCENE_KEYS.WORLD_SCENE);
        }

        if (this.#menu.selectedMenuOption === 'BAG') {
            const sceneDataToPass = {
                previousSceneName:SCENE_KEYS.WORLD_SCENE
            };
            this.scene.launch(SCENE_KEYS.INVENTORY_SCENE, sceneDataToPass);
            this.scene.pause(SCENE_KEYS.WORLD_SCENE);
        }

        if (this.#menu.selectedMenuOption === 'EXIT') {
          this.#menu.hide();
        }

        // TODO: handle other selected menu options
      }

      if (this._contorls.wasBackKeyPressed()) {
        this.#menu.hide();
      }
    }

    this.#player.update(time);

    this.#npcs.forEach((npc) => {
      npc.update(time);
    });
  }

  #handlePlayerInteraction() {
    if (this.#dialogUi.isAnimationPlaying) {
      return;
    }

    if (this.#dialogUi.isVisible && !this.#dialogUi.moreMessagesToShow) {
      this.#dialogUi.hideDialogModal();
      if (this.#npcPlayerIsInteractingWith) {
        this.#npcPlayerIsInteractingWith.isTalkingToPlayer = false;
        this.#npcPlayerIsInteractingWith = undefined;
      }
      return;
    }

    if (this.#dialogUi.isVisible && this.#dialogUi.moreMessagesToShow) {
      this.#dialogUi.showNextMessage();
      return;
    }

        console.log('start of interaction check');

        const { x, y } = this.#player.sprite;
        const targetPosition = getTargetPositionFromGameObjectPositionAndDirection({ x, y }, this.#player.direction);
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

        const nearbyNpc = this.#npcs.find((npc) => {
            return npc.sprite.x === targetPosition.x && npc.sprite.y === targetPosition.y;
        });
        if (nearbyNpc) {
            nearbyNpc.facePlayer(this.#player.direction);
            nearbyNpc.isTalkingToPlayer = true;
            this.#npcPlayerIsInteractingWith = nearbyNpc;
            this.#dialogUi.showDialogModal(nearbyNpc.messages);
            //console.log('talking to npc')
        }

        let nearbyItemIndex;
        const nearbyItem = this.#items.find((item,index) => {
            if(item.position.x === targetPosition.x && item.position.y === targetPosition.y){
                nearbyItemIndex = index;
                return true;
            }
            return false;
        });

        if(nearbyItem){
            const item = DataUtils.getItem(this, nearbyItem.itemId);
            nearbyItem.gameObject.destroy();
            this.#items.splice(nearbyItemIndex,1);
            this.#dialogUi.showDialogModal([`You found a ${item.name}`]);
        }
    }

    #handlePlayerMovementUpdate() {
        dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION, {
            x: this.#player.sprite.x,
            y: this.#player.sprite.y,
        });

        
        if (!this.#encounterLayer) {
            return;
        }

        const isInEncounterZone = this.#encounterLayer.getTileAtWorldXY(this.#player.sprite.x, this.#player.sprite.y, true).index !== -1;
        if (!isInEncounterZone) {
            return;
        }

        console.log(`[${WorldScene.name}:handlePlayerMovementUpdate]  player is in an encounter zone`);
        playSoundFx(this,AUDIO_ASSET_KEYS.GRASS);
        this.#monsterEncountered = Math.random() < 0.2;
        if (this.#monsterEncountered) {
            const encounterAreaId = /** @type {TiledObjectProperty[]} */ (this.#encounterLayer.layer.properties).find(
                (property) => property.name === TILED_ENCOUNTER_PROPERTY.AREA
              ).value;
              const possibleMonsters = DataUtils.getEncounterAreaDetails(this, encounterAreaId);
              const randomMonsterId = weightedRandom(possibleMonsters);
              

            console.log(`[${WorldScene.name}:handlePlayerMovementUpdate]  player encountered a monster in area ${encounterAreaId} and monster id has been picked randomly ${randomMonsterId}`);
            this.cameras.main.fadeOut(2000);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                /**@type {(import("./battle-scene.js").BattleSceneData)}*/
                const dataToPass = {
                    enemyMonsters: [DataUtils.getMonsterById(this,randomMonsterId)],
                    playerMonsters: dataManager.store.get(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY),
                }
                this.scene.start(SCENE_KEYS.BATTLE_SCENE,dataToPass);
            });
        }
    }

    #isPlayerInputLocked() {
        return this._contorls.isInputLocked || this.#dialogUi.isVisible || this.#menu.isVisible;
      }

    /**
     * @param {Phaser.Tilemaps.Tilemap} map
     * @returns {void} 
     */
    #createNPCs(map) {
        this.#npcs = [];

        const npcLayers = map.getObjectLayerNames().filter((layerName) => layerName.includes('NPC'));

        npcLayers.forEach((layerName) => {
            const layer = map.getObjectLayer(layerName);

            const npcObject = layer.objects.find((obj) => {
                return obj.type === CUSTOM_TILED_TYPES.NPC;
            });
            if (!npcObject || npcObject.x === undefined || npcObject.y === undefined) {
                return;
            }

            //get the path objects for this npc
            const pathObjects = layer.objects.filter((obj) => {
                return obj.type === CUSTOM_TILED_TYPES.NPC_PATH;
            });
            const npcPath = {
                0: { x: npcObject.x, y: npcObject.y - TILE_SIZE }
            };
            pathObjects.forEach((obj) => {
                if (obj.x === undefined || obj.y === undefined) {
                    return;
                }
                npcPath[parseInt(obj.name, 10)] = { x: obj.x, y: obj.y - TILE_SIZE };
            });
            console.log(npcPath);

            /** @type {string} */
            const npcFrame = 
            /** @type {TiledObjectProperty[]}*/(npcObject.properties).find((property) => property.name === TILED_NPC_PROPERTY.FRAME)?.value || '0';

            /** @type {string} */
            const npcMessagesString = 
            /** @type {TiledObjectProperty[]}*/(npcObject.properties).find((property) => property.name === TILED_NPC_PROPERTY.MESSAGES)?.value || '0';
            const npcMessages = npcMessagesString.split('::');

            const npcMovement = 
            /** @type {TiledObjectProperty[]}*/(npcObject.properties).find((property) => property.name === TILED_NPC_PROPERTY.MOVEMENT_PATTERN)?.value || 'IDLE';

            //in tiled, the x vaule is how far the object starts from the left, and the y is the bottom of tiled
            const npc = new NPC({
                scene: this,
                position: { x: npcObject.x, y: npcObject.y - TILE_SIZE },
                direction: DIRECTION.DOWN,
                frame: parseInt(npcFrame, 10),
                messages: npcMessages,
                npcPath,
                movementPattern: npcMovement,
            })
            this.#npcs.push(npc);
        });
    }


    #handlePlayerDirectionUpdate(){
        dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION, this.#player.direction);
    }

    #healPlayerParty(){
        /**@type {import("../types/typedef.js").Monster[]} */
        const monsters = dataManager.store.get(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY);
        monsters.forEach((monster) => {
            monster.currentHp = monster.maxHp;
        })
        dataManager.store.set(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY,monsters);
    }

    /**
     * @param {Phaser.Tilemaps.Tilemap} map
     * @returns {void} 
     */
    #createItems(map) {
        const itemObjectLayer = map.getObjectLayer('Item');
        if(!itemObjectLayer){
                return;
        }
        
        const items = itemObjectLayer.objects;
        const validItems = items.filter((item) => {
            return item.x !== undefined && item.y !== undefined;
        });
        
        for(const tiledItem of validItems){
             /** @type {number} */
             const itemId = 
             /** @type {TiledObjectProperty[]}*/(tiledItem.properties).find((property) => property.name === TILED_ITEM_PROPERTY.ITEM_ID)?.value;
            
             /** @type {number} */
             const id = 
             /** @type {TiledObjectProperty[]}*/(tiledItem.properties).find((property) => property.name === TILED_ITEM_PROPERTY.ID)?.value;
            

             const item = new Item({
                scene: this,
                position:{
                    x: tiledItem.x,
                    y: tiledItem.y - TILE_SIZE,
                },
                itemId,
                id,
             });
             this.#items.push(item);
        }
    }
}