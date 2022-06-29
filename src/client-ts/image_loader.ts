/* Load an image from a given URL. */
export class ImageLoader {
    callback: (image: HTMLImageElement) => void;
    image: HTMLImageElement = null;

    // Provide URL to load and callback function
    constructor(url: string, callback: (image: HTMLImageElement) => void) {
        this.callback = callback;
        // Image object to load into
        this.image = new Image();
        this.image.onload = () => {
            this.callback(this.image);
        };
        this.image.src = url;
    }
}
