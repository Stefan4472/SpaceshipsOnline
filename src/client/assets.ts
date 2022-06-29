export enum AssetId {
    BACKGROUND_IMG,
    SPACESHIP_IMG,
}

/* Struct for storing assets that the game needs. */
export class Assets {
    background_img: HTMLImageElement = null;
    spaceship_img: HTMLImageElement = null;

    getById(asset_id: AssetId) {
        if (asset_id === AssetId.BACKGROUND_IMG) {
            return this.background_img;
        } else if (asset_id === AssetId.SPACESHIP_IMG) {
            return this.spaceship_img;
        } else {
            throw new RangeError(`Invalid AssetId`);
        }
    }
}
