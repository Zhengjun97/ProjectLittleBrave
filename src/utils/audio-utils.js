import { SOUND_OPTIONS } from "../common/options.js";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "./data-manager.js";

/**
 * @param {Phaser.Scene} scene
 * @param {string} audioKey  
 * @returns {void}
 */
export function playBackgroundMusic(scene,audioKey){
    if(dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND) !== SOUND_OPTIONS.ON){
        return;
    }
    

    const existingSound = scene.sound.getAllPlaying();
    
    let musicAlreadyPlaying = false;

    existingSound.forEach((sound) => {
        if(sound.key === audioKey){
            musicAlreadyPlaying = true;
            return;
        }
        sound.stop();
    });

    if(!musicAlreadyPlaying){
        scene.sound.play(audioKey,{
        loop: true,
      });
    }

}