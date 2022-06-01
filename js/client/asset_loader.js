/* Load needed assets. */
class AssetLoader {
    // Provide game dimensions and callback function
    constructor(game_width, game_height, callback) {
        this.game_width = game_width;
        this.game_height = game_height;
        this.callback = callback;
        this.assets = new Assets();
    }

    load_assets() {
        console.log('Loading assets');
        var _this = this;
        new ImageLoader('/assets/texture_atlas.png', (image) => {
            console.log('Loaded texture atlas');
            _this.assets.texture_atlas_img = image;
            _this.check_ready();
        });
        
        new ImageLoader('/assets/space_background.png', (image) => {
            console.log('Loaded space background');
            _this.assets.background_img = image;
            _this.check_ready();    
        });
    }

    check_ready() {
        if (this.assets._texture_atlas_img !== null && this.assets.background_img !== null) {
            this.callback(this.assets);
        }
    }
}