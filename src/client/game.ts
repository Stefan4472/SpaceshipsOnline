/* Client-side game driver */
import { GameContext } from './game_context';
import { Background } from './background';
import { PlayerInput } from '../shared/player_input';
import { Player } from './player';
import { Spaceship } from './spaceship';
import { SerializedPlayer, SerializedSpaceship } from '../shared/messages';

export class Game {
    game_context: GameContext;
    // Coordinates of the "view" of the player on the game.
    // Will be recalculated each update to keep the view centered on the player.
    view_x: number;
    view_y: number;
    // Draws game background
    background: Background;
    // Timestamp at which the game was last updated
    last_update_time: number;
    game_over: boolean;
    // Current state of input
    // TODO: add timestamp and sequence number
    input: PlayerInput = new PlayerInput();
    // Whether the input has changed since the previous game update
    input_changed: boolean;
    // Map playerID to Player instance
    players: Map<string, Player> = new Map();
    // TODO: one single map of SpriteID -> sprite
    // Spaceship instances, mapped by spriteId
    spaceships: Map<number, Spaceship> = new Map();

    constructor(game_context: GameContext) {
        this.game_context = game_context;
        this.background = new Background(this.game_context);

        // Set socket listeners
        this.game_context.client.on_update = (message) => {
            console.log(`Received a game update: ${JSON.stringify(message, null, 0)}`);
            this.onGameUpdate(message.spaceships);
        };
        this.game_context.client.on_player_joined = (message) => {
            this.onPlayerJoined(message.player_id, message.username, message.spaceship);
        };
        this.game_context.client.on_player_left = (message) => {
            this.onPlayerLeft(message.player_id);
        };
    }

    start(spaceships: Array<SerializedSpaceship>, players: Array<SerializedPlayer>) {
        console.log('Starting game');
        for (const player_obj of players) {
            const spaceship = spaceships.find((ship) => ship.sprite_id === player_obj.sprite_id);
            this.onPlayerJoined(player_obj.player_id, player_obj.username, spaceship);
        }

        // Add key listeners
        document.addEventListener(
            'keydown',
            (e) => {
                this.keyDownHandler(e);
            },
            false,
        );
        document.addEventListener(
            'keyup',
            (e) => {
                this.keyUpHandler(e);
            },
            false,
        );

        // Start the game loop
        this.last_update_time = Date.now();
        window.requestAnimationFrame(() => {
            this.updateAndDraw();
        });
    }

    // Handle receiving an authoritative game state.
    onGameUpdate(spaceships: Array<SerializedSpaceship>) {
        // console.log("Received game update", game_state);
        const me = this.players.get(this.game_context.my_id);
        for (const server_ship of spaceships) {
            if (this.spaceships.has(server_ship.sprite_id)) {
                const client_ship = this.spaceships.get(server_ship.sprite_id);
                client_ship.x = server_ship.x;
                client_ship.y = server_ship.y;
                client_ship.rotation = server_ship.rotation;
                client_ship.speed = server_ship.speed;
                client_ship.rotation = server_ship.rotation;
                // Update input for other spaceships
                if (server_ship.sprite_id !== me.sprite_id) {
                    client_ship.setInput(server_ship.input);
                }
            }
        }
    }

    updateAndDraw() {
        const curr_time = Date.now();
        const ms_since_update = curr_time - this.last_update_time;
        const player = this.players.get(this.game_context.my_id);
        const player_ship = this.spaceships.get(player.sprite_id);
        // Handle player input TODO: DO THIS DIRECTLY IN THE KEY LISTENER?
        if (this.input_changed) {
            // Send controls to server
            this.game_context.client.sendInput(this.input);
            // Send controls to player's ship
            player_ship.setInput(this.input);
            this.input_changed = false;
        }

        for (const spaceship of this.spaceships.values()) {
            spaceship.update(ms_since_update);
            // spaceship.move(ms_since_update);
        }

        this.centerView();
        this.drawGame();

        this.last_update_time = curr_time;

        // Schedule next frame
        if (!this.game_over) {
            window.requestAnimationFrame(() => {
                this.updateAndDraw();
            });
        }
    }

    centerView() {
        const player = this.players.get(this.game_context.my_id);
        const player_ship = this.spaceships.get(player.sprite_id);
        // console.log(`Centering view onto player ship at ${player_ship.x}, ${player_ship.y}`)
        // TODO: account for player's width and height
        this.view_x = player_ship.x - this.game_context.screen_width / 2;
        this.view_y = player_ship.y - this.game_context.screen_height / 2;

        // Ensure view doesn't go off the map
        if (this.view_x < 0) {
            this.view_x = 0;
        } else if (this.view_x + this.game_context.screen_width > this.game_context.game_width) {
            this.view_x = this.game_context.game_width - this.game_context.screen_width;
        }
        if (this.view_y < 0) {
            this.view_y = 0;
        } else if (this.view_y + this.game_context.screen_height > this.game_context.game_height) {
            this.view_y = this.game_context.game_height - this.game_context.screen_height;
        }
    }

    drawGame() {
        this.game_context.drawer.setOffset(this.view_x, this.view_y);
        this.background.draw(this.game_context.drawer);
        for (const spaceship of this.spaceships.values()) {
            spaceship.draw(this.game_context.drawer);
        }
    }

    onPlayerJoined(player_id: string, username: string, spaceship: SerializedSpaceship) {
        console.log(`Game adding player with id ${player_id}, username ${username}, spaceship ${JSON.stringify(spaceship)}`);
        // Create Spaceship from serialized state
        this.spaceships.set(
            spaceship.sprite_id,
            new Spaceship(
                this.game_context,
                spaceship.sprite_id,
                player_id,
                username,
                spaceship.x,
                spaceship.y,
                spaceship.rotation,
            ),
        );
        this.players.set(player_id, new Player(player_id, spaceship.sprite_id, username));
    }

    onPlayerLeft(player_id: string) {
        console.log(`Player with id ${player_id} disconnected`);
        // this.hud_view.addMessage(this.players.get(info.id).username +
        //   " left the game");
        const sprite_id = this.players.get(player_id).sprite_id;
        this.spaceships.delete(sprite_id);
        this.players.delete(player_id);
        if (player_id === this.game_context.my_id) {
            this.stop();
        }
    }

    stop() {
        this.game_over = true;
    }

    keyDownHandler(e: KeyboardEvent) {
        switch (e.key) {
            case "w":
                this.input.up = true;
                break;
            case "a":
                this.input.left = true;
                break;
            case "s":
                this.input.down = true;
                break;
            case "d":
                this.input.right = true;
                break;
            default:
                // Irrelevant
                break;
        }
        e.preventDefault();
        this.input_changed = true;
    }

    keyUpHandler(e: KeyboardEvent) {
        switch (e.key) {
            case "w":
                this.input.up = false;
                break;
            case "a":
                this.input.left = false;
                break;
            case "s":
                this.input.down = false;
                break;
            case "d":
                this.input.right = false;
                break;
            default:
                // Irrelevant
                break;
        }
        e.preventDefault();
        this.input_changed = true;
    }
}
