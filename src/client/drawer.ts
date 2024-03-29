/* Draw images to the canvas */
import { AssetId, Assets } from './assets';
import { Rect } from '../shared/rect';

export class Drawer {
    canvas: HTMLCanvasElement;
    assets: Assets;
    context2d: CanvasRenderingContext2D;
    offsetX: number;
    offsetY: number;

    constructor(canvas: HTMLCanvasElement, assets: Assets) {
        this.canvas = canvas;
        this.context2d = this.canvas.getContext('2d');
        this.assets = assets;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    setOffset(x: number, y: number) {
        this.offsetX = x;
        this.offsetY = y;
    }

    drawImg(asset_id: AssetId, x: number, y: number, rotation_rad = 0) {
        const image = this.assets.getById(asset_id);
        // Translate game coordinates to on-canvas coordinates
        const canvas_x = x - this.offsetX;
        const canvas_y = y - this.offsetY;

        if (rotation_rad) {
            // See: https://gamedev.stackexchange.com/a/67276
            // Except rather than saving context, we simply undo our changes
            this.context2d.translate(canvas_x, canvas_y);
            this.context2d.rotate(rotation_rad);
            this.context2d.drawImage(image, -(image.width / 2), -(image.height / 2));
            this.context2d.rotate(-rotation_rad);
            this.context2d.translate(-canvas_x, -canvas_y);
        } else {
            this.context2d.drawImage(image, canvas_x, canvas_y);
        }
    }

    drawSubImg(asset_id: number, src_rect: Rect, dst_rect: Rect) {
        this.context2d.drawImage(
            this.assets.getById(asset_id),
            src_rect.x,
            src_rect.y,
            src_rect.w,
            src_rect.h,
            dst_rect.x - this.offsetX,
            dst_rect.y - this.offsetY,
            dst_rect.w,
            dst_rect.h,
        );
    }

    drawText(text: string, x: number, y: number, font: string, fillstyle: string) {
        const canvas_x = x - this.offsetX;
        const canvas_y = y - this.offsetY;
        this.context2d.font = font;
        this.context2d.fillStyle = fillstyle;
        this.context2d.fillText(text, canvas_x, canvas_y);
    }
}
