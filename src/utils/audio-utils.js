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

/**
 * @param {Phaser.Scene} scene
 * @param {string} audioKey  
 * @returns {void}
 */
export function playSoundFx(scene, audioKey){
    if(dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND) !== SOUND_OPTIONS.ON){
        return;
    }

    const baseVolume = dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME) * 0.25;

    scene.sound.play(audioKey,{
        volume: 20 * baseVolume,
    });

}

/**
 * @param {Phaser.Scene} scene
 * @returns {void}
 */
export function setGlobalSoundSettings(scene){
    scene.sound.setVolume(dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME) * 0.25);
    scene.sound.setMute(dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND) === SOUND_OPTIONS.OFF);
}