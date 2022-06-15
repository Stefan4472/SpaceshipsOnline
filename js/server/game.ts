import socketio from 'socket.io'
import {Player, PlayerInfo} from './player'
import {Spaceship} from './spaceship'
import {Messages} from './messages'
import {QueuedInput} from "./player_input";

export class Game {
    private io: socketio.Server;
    private readonly game_width: number;
    private readonly game_height: number;
    private players: Map<number, Player>;
    private last_player_id: number;
    private spaceships: Map<number, Spaceship>;
    private last_sprite_id: number;
    private last_update_time: number;
    private input_buffer: Array<QueuedInput>;
    private interval_id: NodeJS.Timer;

    constructor(io: socketio.Server) {
        console.log('Creating game instance');
        this.io = io;
        this.game_width = 1000;
        this.game_height = 1000;

        // Map PlayerID to Player instance
        this.players = new Map();
        this.last_player_id = 0;
        // Map SpriteID to Spaceship
        // TODO: generalize to mapping SpriteID to Sprite
        this.spaceships = new Map();
        // SpriteID given to the last sprite created
        this.last_sprite_id = 0;
        // Timestamp game was last updated at
        this.last_update_time = 0;
        // Buffer inputs from players
        // TODO: make into thread-safe queue
        this.input_buffer = [];
    }

    startGame() {
        console.log("Starting game");
        // Trigger first update
        let game = this;
        this.last_update_time = Date.now();
        this.interval_id = setInterval(function() { game.update(); }, 30);
    }

    update() {
        let curr_time = Date.now();
        let ms_since_update = curr_time - this.last_update_time;

        this.handleInput();
        // this.detectAndHandleCollisions();
        this.updateSprites(ms_since_update);

        // Broadcast game state
        this.io.emit(Messages.GAME_UPDATE, this.serializeState());

        this.last_update_time = curr_time;
    }

    /* Handle input in the input_queue since the last update() */
    handleInput() {
        for (const input of this.input_buffer) {
            if (this.players.has(input.player_id)) {
                let ship_id = this.players.get(input.player_id).ship_id;
                this.spaceships.get(ship_id).setInput(input.state);
            }
        }
        // Clear the buffer
        this.input_buffer.length = 0;
    }

      /* Update state of all sprites by the given number of milliseconds */
    updateSprites(ms: number) {
        for (const spaceship of this.spaceships.values()) {
            spaceship.update(ms);
        }
    }

    createSpaceship(x: number, y: number, heading: number, player_id: number) : Spaceship {
        // TODO: make thread safe?
        this.last_sprite_id++;
        let sprite_id = this.last_sprite_id;
        return new Spaceship(sprite_id, player_id, x, y, heading);
    }

    /* Create and return new player */
    addPlayer(socket: socketio.Socket) {
        let player_id = this.last_player_id++;

        // Create ship with random position and heading
        let x = this.randomInt(100, this.game_width - 100);
        let y = this.randomInt(100, this.game_height - 100);
        let heading = Math.random() * 2 * Math.PI;
        let ship = this.createSpaceship(x, y, heading, player_id);
        this.spaceships.set(ship.sprite_id, ship);
        this.players.set(player_id, new Player(player_id, ship.sprite_id, socket));

        // Register control_input callback: add to control buffer
        let game = this;
        socket.on(Messages.SEND_INPUT, function(input) {
            // console.log(`Got player input ${JSON.stringify(input, null, 2)}`);
            game.input_buffer.push({
                player_id: player_id,
                state: input,
            });
        });

        // Register disconnect callback
        socket.on('disconnect', function() {
            game.removePlayer(player_id);
            game.io.emit(Messages.PLAYER_LEFT, {
                player_id: player_id,
            });
        });

        // Send initial state.
        // TODO: figure out a leaner way to do this
        socket.emit(Messages.INIT_STATE, {
            your_id: player_id,
            players: this.serializePlayers(),
            state: this.serializeState(),
            game_width: this.game_width,
            game_height: this.game_height,
        });

        this.io.emit(Messages.PLAYER_JOINED, {
            player_id: player_id,
            spaceship: ship.serialize(),
        });
    }

    removePlayer(player_id: number) {
        console.log(`Game removing player ${player_id}`);
        var player = this.players.get(player_id);
        this.spaceships.delete(player.ship_id);
        this.players.delete(player_id);
        // Broadcast player_disconnect signal to all sockets
        // this.io.emit('player_disconnect', player_id);
    }

    /* Serialize and return game state as an object */
    // TODO: a class in `shared` that defines the format
    serializeState() : any {
        let game_state = {spaceships: []};
        for (let spaceship of this.spaceships.values()) {
            game_state.spaceships.push(spaceship.serialize());
        }
        return game_state;
    }

    serializePlayers() : Array<PlayerInfo> {
        let players = [];
        for (let player of this.players.values()) {
            players.push(new PlayerInfo(player.id, player.ship_id));
        }
        return players;
    }

    randomInt(low, high) {
        return Math.floor(Math.random() * (high - low) + low);
    }
}
