/* Load an image from a given URL. */
class ImageLoader {
    // Provide URL to load and callback function
    constructor(url, callback) {
        this.callback = callback;

        // Image object to load into
        this.img = new Image();
        var _this = this;
        this.img.onload = function() {
            _this.callback(_this.img);
        }
        this.img.src = url;
    }
}