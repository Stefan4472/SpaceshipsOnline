/* Draw images to the canvas */
class Drawer {
    constructor(canvas, assets) {
        this.canvas = canvas;
        this.context2d = this.canvas.getContext('2d');
        this.assets = assets;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    setOffset(x, y) {
        this.offsetX = x;
        this.offsetY = y;
    }

    drawImg(asset_id, x, y, rotation_rad=0) {
        var image = this.assets.getById(asset_id);
        // Translate game coordinates to on-canvas coordinates
        x -= this.offsetX;
        y -= this.offsetY;

        if (rotation_rad) {
            // See: https://gamedev.stackexchange.com/a/67276
            // Except rather than saving context, we simply undo our changes
            this.context2d.translate(x, y);
            this.context2d.rotate(rotation_rad);
            this.context2d.drawImage(image, -(image.width/2), -(image.height/2));
            this.context2d.rotate(-rotation_rad)
            this.context2d.translate(-x, -y);
        }
        else {
            this.context2d.drawImage(image, x, y);
        }
    }

    drawSubImg(asset_id, src_rect, dst_rect) {
        this.context2d.drawImage(
            this.assets.getById(asset_id),
            src_rect.x, src_rect.y, src_rect.w, src_rect.h,
            dst_rect.x-this.offsetX, dst_rect.y-this.offsetY, dst_rect.w, dst_rect.h
        );
    }
}