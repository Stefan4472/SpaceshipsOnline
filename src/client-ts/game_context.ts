import {Client} from "./client";
import {Assets} from "./assets";
import {Drawer} from "./drawer";

/* Context for all things the Game needs. */
export class GameContext {
    client: Client;
    canvas: HTMLCanvasElement;
    assets: Assets;
    drawer: Drawer;
    my_id: number;
    game_width: number;
    game_height: number;
    screen_width: number;
    screen_height: number;

    constructor(client: Client, canvas: HTMLCanvasElement, assets: Assets, my_id: number, game_width: number, game_height: number, screen_width: number, screen_height: number) {
        this.client = client;
        this.canvas = canvas;  // TODO: not sure if this belongs here
        this.assets = assets;
        this.drawer = new Drawer(canvas, assets);
        this.my_id = my_id;
        this.game_width = game_width;
        this.game_height = game_height;
        this.screen_width = screen_width;
        this.screen_height = screen_height;
    }
}