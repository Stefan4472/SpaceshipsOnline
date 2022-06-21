import {Assets} from "./assets";
import {ImageLoader} from "./image_loader";

/* Load needed assets. */
export class AssetLoader {
    assets: Assets;

    constructor() {
        this.assets = new Assets();
    }

    load_assets(callback: (assets: Assets) => void) {
        let _this = this;
        new ImageLoader('/assets/spaceship.png', (image) => {
            _this.assets.spaceship_img = image;
            _this.check_ready(callback);
        });

        new ImageLoader('/assets/space_background.png', (image) => {
            _this.assets.background_img = image;
            _this.check_ready(callback);
        });
    }

    check_ready(callback: (assets: Assets) => void) {
        if (this.assets.spaceship_img !== null && this.assets.background_img !== null) {
            callback(this.assets);
        }
    }
}