/* Load needed assets. */
class AssetLoader {
    // Provide game dimensions and callback function
    constructor(callback) {
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