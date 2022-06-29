import { Assets } from './assets';
import { ImageLoader } from './image_loader';

/* Load needed assets. */
export class AssetLoader {
    assets: Assets;

    constructor() {
        this.assets = new Assets();
    }

    load_assets(callback: (assets: Assets) => void) {
        new ImageLoader('/assets/spaceship.png', (image) => {
            this.assets.spaceship_img = image;
            this.check_ready(callback);
        });

        new ImageLoader('/assets/space_background.png', (image) => {
            this.assets.background_img = image;
            this.check_ready(callback);
        });
    }

    check_ready(callback: (assets: Assets) => void) {
        if (this.assets.spaceship_img !== null && this.assets.background_img !== null) {
            callback(this.assets);
        }
    }
}
