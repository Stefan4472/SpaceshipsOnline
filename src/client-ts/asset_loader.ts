import {Assets} from "./assets";
import {ImageLoader} from "./image_loader";

/* Load needed assets. */
export class AssetLoader {
    callback: (assets: Assets) => void;
    assets: Assets;

    // Provide callback function that will pass the loaded Assets
    constructor(callback: (assets: Assets) => void) {
        this.callback = callback;
        this.assets = new Assets();
    }

    load_assets() {
        console.log('Loading assets');
        var _this = this;
        new ImageLoader('/assets/spaceship.png', (image) => {
            console.log('Loaded spaceship');
            _this.assets.spaceship_img = image;
            _this.check_ready();
        });

        new ImageLoader('/assets/space_background.png', (image) => {
            console.log('Loaded space background');
            _this.assets.background_img = image;
            _this.check_ready();
        });
    }

    check_ready() {
        if (this.assets.spaceship_img !== null && this.assets.background_img !== null) {
            this.callback(this.assets);
        }
    }
}