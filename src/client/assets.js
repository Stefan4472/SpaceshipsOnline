var AssetId = {};
AssetId.BACKGROUND_IMG = 1;
AssetId.SPACESHIP_IMG = 2;

/* Struct for storing assets that the game needs. */
class Assets {
    constructor() {
        this.background_img = null;
        this.spaceship_img = null;
    }

    getById(asset_id) {
        if (asset_id === AssetId.BACKGROUND_IMG) {
            return this.background_img;
        } else if (asset_id === AssetId.SPACESHIP_IMG) {
            return this.spaceship_img;
        } else {
            // TODO: throw exception
        }
    }
}