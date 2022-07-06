import { Player } from './player';
import { Spaceship } from './spaceship';
import {InitMessage, SerializedGameState, SerializedPlayer, SerializedSpaceship} from '../shared/messages';
import {ControlState, PlayerInput} from '../shared/player_input';
import { ServerComm } from './server_comm';

export class Game {
    private comm: ServerComm;
    private readonly game_width: number;
    private readonly game_height: number;
    private players: Map<string, Player>;
    private spaceships: Map<number, Spaceship>;
    private last_sprite_id: number;
    private last_update_time: number;
    private input_buffer: Array<PlayerInput>;
    private interval_id: NodeJS.Timer;

    constructor(comm: ServerComm) {
        console.log('Creating game instance');
        this.comm = comm;
        this.game_width = 1000;
        this.game_height = 1000;

        // Map PlayerID to Player instance
        this.players = new Map();
        // Map SpriteID to Spaceship
        // TODO: generalize to mapping SpriteID to Sprite
        this.spaceships = new Map();
        // SpriteID given to the last sprite created
        this.last_sprite_id = 0;
        // Timestamp game was last updated at
        this.last_update_time = 0;
        // Buffer inputs from players
        // TODO: process in update(). Possibly make thread-safe(?)
        this.input_buffer = new Array<PlayerInput>;

        // Set comm listeners
        this.comm.on_connect = (player_id, username) => {
            this.addPlayer(player_id, username);
        };
        this.comm.on_disconnect = (player_id) => {
            this.removePlayer(player_id);
        };
        this.comm.on_input = (input) => {
            // console.log(`Got player input ${JSON.stringify(input, null, 2)}`);
            this.input_buffer.push(input);
        };
    }

    startGame() {
        console.log('Starting game');
        // Trigger first update
        this.last_update_time = Date.now();
        this.interval_id = setInterval(() => {
            this.update();
        }, 30);
    }

    update() {
        const curr_time = Date.now();
        const ms_since_update = curr_time - this.last_update_time;

        // Apply input in queue
        for (const queued_input of this.input_buffer) {
            if (this.players.has(queued_input.player_id)) {
                const ship_id = this.players.get(queued_input.player_id).ship_id;
                this.spaceships.get(ship_id).setInput(queued_input.state);
            }
        }

        this.updateSprites(ms_since_update);

        // Broadcast game state
        this.comm.broadcastUpdate(this.serializeState(), this.input_buffer);

        // Clear input buffer
        this.input_buffer.length = 0;

        this.last_update_time = curr_time;
    }

    /* Update state of all sprites by the given number of milliseconds */
    updateSprites(ms: number) {
        for (const spaceship of this.spaceships.values()) {
            spaceship.update(ms);
        }
    }

    createSpaceship(x: number, y: number, heading: number, player_id: string): Spaceship {
        // TODO: make thread safe?
        this.last_sprite_id++;
        const sprite_id = this.last_sprite_id;
        return new Spaceship(sprite_id, player_id, x, y, heading);
    }

    /* Add a new player to the game with given id.*/
    addPlayer(player_id: string, username: string) {
        // Create ship with random position and heading
        const x = this.randomInt(100, this.game_width - 100);
        const y = this.randomInt(100, this.game_height - 100);
        const heading = Math.random() * 2 * Math.PI;
        const ship = this.createSpaceship(x, y, heading, player_id);
        this.spaceships.set(ship.sprite_id, ship);
        this.players.set(player_id, new Player(player_id, ship.sprite_id, username));

        // Send initial state.
        this.comm.sendInitState(
            player_id,
            new InitMessage(
                player_id,
                this.serializePlayers(),
                this.serializeState(),
                this.game_width,
                this.game_height,
            ),
        );

        this.comm.broadcastPlayerJoined(player_id, username, ship.serialize());
    }

    removePlayer(player_id: string) {
        console.log(`Game removing player ${player_id}`);
        const player = this.players.get(player_id);
        this.spaceships.delete(player.ship_id);
        this.players.delete(player_id);
        // Broadcast player_disconnect signal to all sockets
        this.comm.broadcastPlayerLeft(player_id);
    }

    /* Serialize and return game state as an object */
    serializeState(): SerializedGameState {
        return new SerializedGameState(
            Array.from(this.spaceships, ([,spaceship]) => spaceship.serialize())
        );
    }

    serializePlayers(): Array<SerializedPlayer> {
        return Array.from(this.players, ([, player]) => player.serialize());
    }

    randomInt(low: number, high: number) {
        return Math.floor(Math.random() * (high - low) + low);
    }
}