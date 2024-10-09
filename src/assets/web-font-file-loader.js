import Phaser from '../lib/phaser.js';
import * as WebFontLoader from '../lib/webfontloader.js';

export class WebFontFileLoader extends Phaser.Loader.File {
    /** @type {string[]} */
    #fontName;

    /**
    * @param {Phaser.Loader.LoaderPlugin} loader
    * @param {string[]} fontNames
    */
    constructor(loader, fontNames) {
        super(loader, {
            type: 'webfont',
            key: fontNames.toString(),
        });

        this.#fontName = fontNames;
    }

    load() {
        WebFontLoader.default.load({
            custom: {
                families: this.#fontName,
            },
            active: ()=> {
                this.loader.nextFile(this, true);
            },
            inactive: () => {
                console.error(`Failed to load custom font ${JSON.stringify(this.#fontName)}`);
                this.loader.nextFile(this, false);
            }
        });
    }
}