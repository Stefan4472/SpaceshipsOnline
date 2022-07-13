/* Client-side game driver */
import { GameContext } from './game_context';
import { Background } from './background';
import {ControlState, PlayerInput} from '../shared/player_input';
import { Player } from './player';
import { Spaceship } from './spaceship';
import {SerializedGameState, SerializedPlayer, SerializedSpaceship, UpdateMessage} from '../shared/messages';
import {RingBuffer} from "../shared/ring_buffer";

class PrevState {
    seqNum: number;
    controls: ControlState;
    my_spaceship: SerializedSpaceship;
    constructor(seqNum: number, controls: ControlState, spaceship: Spaceship) {
        this.seqNum = seqNum;
        this.controls = controls;
        this.my_spaceship = spaceship.serialize();
    }
}

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
    // Number of game updates that have occurred.
    // Used as a monotonically-increasing sequence number.
    update_counter: number = 0;
    game_over: boolean;
    // Current state of input
    controls = new ControlState();
    // Whether input was changed since previous game update
    controls_changed = false;
    // Previous states that have not yet been acked by the server.
    // Used for client-side prediction.
    prevStates = new RingBuffer<PrevState>(20);
    // Map playerID to Player instance
    players = new Map<string, Player>;
    // TODO: one single map of SpriteID -> sprite
    // Spaceship instances, mapped by spriteId
    spaceships = new Map<number, Spaceship>;
    // UpdateMessages received from server that haven't been processed yet
    queuedUpdates = new Array<UpdateMessage>;

    constructor(game_context: GameContext) {
        this.game_context = game_context;
        this.background = new Background(this.game_context);

        // Set socket listeners
        this.game_context.client.on_update = (message) => {
            // console.log(`Received a game update: ${JSON.stringify(message, null, 0)}`);
            this.queuedUpdates.push(message);
        };
        this.game_context.client.on_player_joined = (message) => {
            this.onPlayerJoined(message.player_id, message.username, message.spaceship);
        };
        this.game_context.client.on_player_left = (message) => {
            this.onPlayerLeft(message.player_id);
        };
    }

    start(state: SerializedGameState, players: Array<SerializedPlayer>) {
        console.log('Starting game');
        for (const player_obj of players) {
            const spaceship = state.spaceships.find((ship) => ship.sprite_id === player_obj.sprite_id);
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

    updateAndDraw() {
        const curr_time = Date.now();
        const ms_since_update = curr_time - this.last_update_time;
        const me = this.players.get(this.game_context.my_id);
        const my_ship = this.spaceships.get(me.sprite_id);

        // Apply authoritative state received from server
        if (this.queuedUpdates.length > 0) {
            const last_update = this.queuedUpdates[this.queuedUpdates.length-1];
            this.applyAuthState(last_update.state, last_update.changedInputs);
            this.queuedUpdates.length = 0;
        }

        // Handle player input
        if (this.controls_changed) {
            console.log('Controls changed!');
            // Send controls to server
            this.game_context.client.sendInput(this.controls, this.update_counter);
            // Send controls to player's ship
            my_ship.setInput(this.controls);
        }

        for (const spaceship of this.spaceships.values()) {
            spaceship.update(ms_since_update);
            // spaceship.move(ms_since_update);
        }

        this.centerView();
        this.drawGame();

        if (this.controls_changed) {
            if (this.prevStates.full()) {
                this.prevStates.pop();
            }
            this.prevStates.push(new PrevState(this.update_counter, this.controls, my_ship));
            console.log(`len(this.prevStates) = ${this.prevStates.len()}`);
        }

        this.last_update_time = curr_time;
        this.update_counter += 1;
        this.controls_changed = false;

        // Schedule next frame
        if (!this.game_over) {
            window.requestAnimationFrame(() => {
                this.updateAndDraw();
            });
        }
    }

    // Handle receiving an authoritative game state.
    applyAuthState(state: SerializedGameState, changed_inputs: Array<PlayerInput>) {
        // console.log("Received game update", game_state);
        const me = this.players.get(this.game_context.my_id);
        let my_auth_state: SerializedSpaceship = null;
        let my_auth_input: PlayerInput = null;

        // Set auth state for all other spaceships
        for (const auth_ship of state.spaceships) {
            if (auth_ship.sprite_id === me.sprite_id) {
                my_auth_state = auth_ship;
            } else if (this.spaceships.has(auth_ship.sprite_id)) {
                const client_ship = this.spaceships.get(auth_ship.sprite_id);
                client_ship.x = auth_ship.x;
                client_ship.y = auth_ship.y;
                client_ship.rotation = auth_ship.rotation;
                client_ship.speed = auth_ship.speed;
                client_ship.rotation = auth_ship.rotation;
            } else {
                console.log(`WARN: don't have a client spaceship with id ${auth_ship.sprite_id}`);
            }
        }

        // Apply auth input
        for (const input of changed_inputs) {
            if (input.player_id === this.game_context.my_id) {
                my_auth_input = input;
            } else {
                const sprite_id = this.players.get(input.player_id).sprite_id;
                const spaceship = this.spaceships.get(sprite_id);
                spaceship.setInput(input.state);
            }
        }

        if (my_auth_input !== null) {
            // For now, simply snap to auth state
            const my_sprite_id = this.players.get(this.game_context.my_id).sprite_id;
            const my_ship = this.spaceships.get(my_sprite_id);
            my_ship.x = my_auth_state.x;
            my_ship.y = my_auth_state.y;
            my_ship.rotation = my_auth_state.rotation;
            my_ship.speed = my_auth_state.speed;
            my_ship.rotation = my_auth_state.rotation;

            // My own input is being acked: perform client-side prediction
            // Discard prevStates older than the one acked by the server
            while (!this.prevStates.empty() && this.prevStates.first().seqNum <= my_auth_input.seqNum) {
                console.log(`Removing prevState with seqNum=${this.prevStates.first().seqNum}`);
                this.prevStates.pop();
            }

            // TODO: get oldest state, snap to curr auth state, then forward simulate inputs in the buffer
            // TODO: will need timestamps and a function for simulating physics

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
        if (e.repeat) {
            return;
        }
        // const prev_state = structuredClone(this.controls);
        switch (e.key) {
            case "w":
                this.controls.up = true;
                this.controls_changed = true;
                break;
            case "a":
                this.controls.left = true;
                this.controls_changed = true;
                break;
            case "s":
                this.controls.down = true;
                this.controls_changed = true;
                break;
            case "d":
                this.controls.right = true;
                this.controls_changed = true;
                break;
            default:
                // Irrelevant
                break;
        }
        e.preventDefault();
        // this.controls_changed = (prev_state.equals(this.controls));
    }

    keyUpHandler(e: KeyboardEvent) {
        if (e.repeat) {
            return;
        }
        switch (e.key) {
            case "w":
                this.controls.up = false;
                this.controls_changed = true;
                break;
            case "a":
                this.controls.left = false;
                this.controls_changed = true;
                break;
            case "s":
                this.controls.down = false;
                this.controls_changed = true;
                break;
            case "d":
                this.controls.right = false;
                this.controls_changed = true;
                break;
            default:
                // Irrelevant
                break;
        }
        e.preventDefault();
    }
}
