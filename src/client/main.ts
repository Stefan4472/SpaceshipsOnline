import { AssetLoader } from './asset_loader';
import { ClientComm } from './client_comm';
import { GameContext } from './game_context';
import { Game } from './game';

/*
Main Client code, which creates and starts the main Game instance.
*/
const SCREEN_WIDTH = 600;
const SCREEN_HEIGHT = 400;

const canvas = <HTMLCanvasElement>document.getElementById('gameCanvas');
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

// Load assets, then init socket connection and start game
new AssetLoader().load_assets((assets) => {
    console.log('Finished loading assets');
    const client = new ClientComm();
    let context: GameContext = null;
    let game: Game = null;

    client.on_init = (message) => {
        console.log(`Joined a lobby! Data received ${JSON.stringify(message, null, 2)}`);
        context = new GameContext(
            client,
            canvas,
            assets,
            message.your_id,
            message.game_width,
            message.game_height,
            SCREEN_WIDTH,
            SCREEN_HEIGHT,
        );
        game = new Game(context);
        game.start(message.state, message.players);
    };
});
