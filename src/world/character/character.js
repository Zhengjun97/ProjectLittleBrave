import { DIRECTION } from '../../common/direction.js';
import Phaser from '../../lib/phaser.js';
import { getTargetPositionFromGameObjectPositionAndDirection } from '../../utils/grid-utils.js';
import { exhaustiveGuard } from '../../utils/guard.js';

/**
 * @typedef CharacterIdleFrameConfig
 * @type {Object}
 * @property {number} LEFT
 * @property {number} RIGHT
 * @property {number} UP
 * @property {number} DOWN
 * @property {number} NONE
 */

/**
 * @typedef CharacterConfig
 * @type {Object}
 * @property {Phaser.Scene} scene the Phaser 3 Scene the battle menu will be added to
 * @property {string} assetKey the name of the asset key that should be used for this character
 * @property {import('../../types/typedef.js').Coordinate} [origin={x:0, y:0}]
 * @property {import('../../types/typedef.js').Coordinate} position the starting position of the character
 * @property {import('../../common/direction.js').Direction} direction
 * @property {() => void} [spriteGridMovementFinishedCallback]
 * @property {CharacterIdleFrameConfig} idleFrameConfig
 * @property {Phaser.Tilemaps.TilemapLayer} [collisionLayer]
 * @property {Character []} [otherCharactersToCheckForCollisionsWith=[]]
 * @property {() => void} [spriteChangedDirectionCallback]
 * @property {{position: import('../../types/typedef.js').Coordinate} []} [objectsToCheckForCollisionsWith]
 */

export class Character {
    /** @type {Phaser.Scene} */
    _scene;
    /** @type {Phaser.GameObjects.Sprite} */
    _phaserGameObject;
    /** @protected @type {import('../../common/direction.js').Direction} */
    _direction;
    /** @protected @type {boolean} */
    _isMoving;
    /** @protected @type {import('../../types/typedef.js').Coordinate}*/
    _targetPosition;
    /** @protected @type {import('../../types/typedef.js').Coordinate}*/
    _previousTargetPosition;
    /** @protected @type {() => void | undefined}*/
    _spriteGridMovementFinishedCallback;
    /** @protected @type {CharacterIdleFrameConfig} */
    _idleFrameConfig;
    /** @protected @type {import('../../types/typedef.js').Coordinate}*/
    _origin;
    /** @protected @type {Phaser.Tilemaps.TilemapLayer | undefined} */
    _collisionLayer;
    /** @protected @type {Character []} */
    _otherCharactersToCheckForCollisionsWith;
    /** @protected @type {() => void | undefined}*/
    _spriteChangedDirectionCallback;
    /**@protected @type  {{position: import('../../types/typedef.js').Coordinate} []} */
    _objectsToCheckForCollisionsWith;

    /**
     * @param {CharacterConfig} config
     */
    constructor(config) {
        this._scene = config.scene;
        this._direction = config.direction;
        this._isMoving = false;
        this._targetPosition = { ...config.position };
        this._previousTargetPosition = { ...config.position };
        this._idleFrameConfig = config.idleFrameConfig;
        this._origin = config.origin ? { ...config.origin } : { x: 0, y: 0 };
        this._collisionLayer = config.collisionLayer;
        this._otherCharactersToCheckForCollisionsWith = config.otherCharactersToCheckForCollisionsWith || [];
        this._phaserGameObject = this._scene.add
            .sprite(config.position.x, config.position.y, config.assetKey, this._getIdleFrame())
            .setOrigin(this._origin.x, this._origin.y);
        this._spriteGridMovementFinishedCallback = config.spriteGridMovementFinishedCallback;
        this._spriteChangedDirectionCallback = config.spriteChangedDirectionCallback;
        this._objectsToCheckForCollisionsWith = config.objectsToCheckForCollisionsWith || [];
    }

    /** @type {Phaser.GameObjects.Sprite} */
    get sprite() {
        return this._phaserGameObject;
    }

    /** @type {boolean} */
    get isMoving() {
        return this._isMoving;
    }
    /** @type {import('../../common/direction.js').Direction} */
    get direction() {
        return this._direction;
    }

    /**
     * @param {import("../../common/direction.js").Direction} direction
     * @returns {void}
     */
    moveCharacter(direction) {
        if (this._isMoving) {
            return;
        }
        this._moveSprite(direction);
    }

    /**
     * @param {Character} character
     * @returns {void} 
     */
    addCharacterToCheckForCollisionsWith(character){
        this._otherCharactersToCheckForCollisionsWith.push(character);
    }

    /**
     * @param {DOMHighResTimeStamp} time 
     * @returns {void}
     */
    update(time) {
        if (this._isMoving) {
            return;
        }

        const idleFrame = this._phaserGameObject.anims.currentAnim?.frames[1].frame.name;
        this._phaserGameObject.anims.stop();
        if (!idleFrame) {
            return;
        }

        switch (this._direction) {
            case DIRECTION.DOWN:
            case DIRECTION.LEFT:
            case DIRECTION.RIGHT:
            case DIRECTION.UP:
                this._phaserGameObject.setFrame(idleFrame);
                break;
            case DIRECTION.NONE:
                break;
            default:
                exhaustiveGuard(this._direction);
        }
    }

    _getIdleFrame() {
        return this._idleFrameConfig[this._direction];
    }

    /**
     * @protected
     * @param {import("../../common/direction.js").Direction} direction
     * @returns {void}
     */
    _moveSprite(direction) {
        const changedDirection = this._direction !== direction;
        this._direction = direction;

        if(changedDirection){
            if(this._spriteChangedDirectionCallback !== undefined){
                this._spriteChangedDirectionCallback();
            }
        }

        if (this._isBlockingTile()) {
            return;
        }

        this._isMoving = true;
        this.#handleSpriteMovement();
    }

    _isBlockingTile() {
        if (this._direction === DIRECTION.NONE) {
            return;
        }
        
        const targetPosition = {...this._targetPosition};
        const updatedPostion = getTargetPositionFromGameObjectPositionAndDirection(targetPosition, this._direction);

        return (this.#doesPositionCollideWithCollisionLayer(updatedPostion) || 
        this.#doesPositionCollideWithOtherCharacter(updatedPostion) ||
        this.#doesPositionCollideWithObject(updatedPostion)
        );
    }

    #handleSpriteMovement() {
        if (this._direction === DIRECTION.NONE) {
            return;
        }

        const updatedPostion = getTargetPositionFromGameObjectPositionAndDirection(this._targetPosition, this._direction);
        this._previousTargetPosition = { ...this._targetPosition };
        this._targetPosition.x = updatedPostion.x;
        this._targetPosition.y = updatedPostion.y;

        this._scene.add.tween({
            delay: 0,
            duration: 600,
            y: {
                from: this._phaserGameObject.y,
                start: this._phaserGameObject.y,
                to: this._targetPosition.y,
            },
            x: {
                from: this._phaserGameObject.x,
                start: this._phaserGameObject.x,
                to: this._targetPosition.x,
            },
            targets: this._phaserGameObject,
            onComplete: () => {
                this._isMoving = false;
                this._previousTargetPosition = { ...this._targetPosition };
                if (this._spriteGridMovementFinishedCallback) {
                    this._spriteGridMovementFinishedCallback();
                }
            }
        });
    }

    /**
     * 
     * @param {import('../../types/typedef.js').Coordinate} position 
     * @returns {boolean}
     */
    #doesPositionCollideWithCollisionLayer(position) {
        if (!this._collisionLayer) {
            return false;
        }

        const {x, y} = position;
        const tile = this._collisionLayer.getTileAtWorldXY(x, y, true);
        //console.log(tile);
        return tile.index !== -1;
    }

    /**
     * @param {import('../../types/typedef.js').Coordinate} position 
     * @returns {boolean}
     */
    #doesPositionCollideWithOtherCharacter(position) {
        const { x, y } = position;
        if (this._otherCharactersToCheckForCollisionsWith.length === 0) {
          return false;
        }
    
        // checks if the new position that this character wants to move to is the same position that another
        // character is currently at, or was previously at and is moving towards currently
        const collidesWithACharacter = this._otherCharactersToCheckForCollisionsWith.some((character) => {
          return (
            (character._targetPosition.x === x && character._targetPosition.y === y) ||
            (character._previousTargetPosition.x === x && character._previousTargetPosition.y === y)
          );
        });
        return collidesWithACharacter;
    }

    /**
   * @param {import('../../types/typedef.js').Coordinate} position
   * @returns {boolean}
   */
  #doesPositionCollideWithObject(position) {
    const { x, y } = position;
    if (this._objectsToCheckForCollisionsWith.length === 0) {
      return false;
    }

    const collidesWithObject = this._objectsToCheckForCollisionsWith.some((object) => {
      return object.position.x === x && object.position.y === y;
    });
    return collidesWithObject;
  }
}
