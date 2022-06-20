/*
Draws the game's space background.
*/
import {GameContext} from "./game_context";
import {Rect} from "../shared/rect";
import {AssetId} from "./assets";
import {Drawer} from "./drawer";

export class Background {
    game_context: GameContext;
    constructor(game_context: GameContext) {
        this.game_context = game_context;
    }

    // Draw the background to the given canvas context
    draw(drawer: Drawer) {
        let w = this.game_context.screen_width;
        let h = this.game_context.screen_height;
        // console.log(`Drawing background ${w}, ${h}, ${drawer.offsetX}, ${drawer.offsetY}`);
        let src = new Rect(drawer.offsetX, drawer.offsetY, w, h);
        let dst = new Rect(drawer.offsetX, drawer.offsetY, w, h);
        drawer.drawSubImg(AssetId.BACKGROUND_IMG, src, dst);
    }
}
