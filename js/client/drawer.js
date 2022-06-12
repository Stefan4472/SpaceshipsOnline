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

    drawImg(asset_id, game_x, game_y, rotation_rad=0) {
        var image = this.assets.getById(asset_id);
        this.context2d.drawImage(image, game_x-this.offsetX, game_y-this.offsetY);
        // if (rad_rotation) {
        //     var center_x = x + img_params.w / 2;
        //     var center_y = y + img_params.h / 2;
        //
        //     context.translate(center_x, center_y);
        //     context.rotate(rad_rotation);
        //     context.drawImage(this.atlas_img, img_params.x, img_params.y,
        //         img_params.w, img_params.h, -img_params.w / 2, -img_params.h / 2,
        //         img_params.w, img_params.h);
        //     context.rotate(-rad_rotation);
        //     context.translate(-center_x, -center_y);
        // }
    }

    drawSubImg(asset_id, src_rect, dst_rect) {
        this.context2d.drawImage(
            this.assets.getById(asset_id),
            src_rect.x, src_rect.y, src_rect.w, src_rect.h,
            dst_rect.x-this.offsetX, dst_rect.y-this.offsetY, dst_rect.w, dst_rect.h
        );
    }
}