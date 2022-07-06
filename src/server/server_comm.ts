import http from 'http';
import socketio from 'socket.io';
import {
    InitMessage,
    InputMessage,
    MessageId,
    PlayerJoinedMessage,
    PlayerLeftMessage,
    SerializedSpaceship,
    UpdateMessage,
} from '../shared/messages';
import { ControlState, PlayerInput } from '../shared/player_input';

/*
 * Server communications interface.
 * Essentially an abstraction layer/wrapper to the socket stuff.
 * Note: for `playerId`, we simply use the socketId.
 */
export class ServerComm {
    private io: socketio.Server;
    // Map socketID to socket instance
    private socket_by_id: Map<string, socketio.Socket>;
    private player_counter: number = 0;
    // `connect` callback
    public on_connect: (player_id: string, username: string) => void;
    // `disconnect` callback
    public on_disconnect: (player_id: string) => void;
    // `SEND_INPUT` callback
    public on_input: (player_id: string, input: PlayerInput) => void;

    constructor(server: http.Server) {
        this.io = new socketio.Server(server);
        this.socket_by_id = new Map();
        this.on_connect = () => {
            /*Init empty*/
        };
        this.on_disconnect = () => {
            /*Init empty*/
        };
        this.on_input = () => {
            /*Init empty*/
        };

        this.io.on('connect', (socket: socketio.Socket) => {
            this.player_counter = (this.player_counter+1) % 100;
            const username = 'player-' + this.player_counter.toString();
            this.socket_by_id.set(socket.id, socket);
            socket.on(MessageId.SEND_INPUT, (message: InputMessage) => {
                this.on_input(socket.id, message.input);
            });
            socket.on('disconnect', () => {
                this.socket_by_id.delete(socket.id);
                this.on_disconnect(socket.id);
            });
            this.on_connect(socket.id, username);
        });
    }

    broadcastUpdate(spaceships: Array<SerializedSpaceship>) {
        this.io.emit(MessageId.GAME_UPDATE, new UpdateMessage(spaceships));
    }

    broadcastPlayerJoined(player_id: string, username: string, spaceship: SerializedSpaceship) {
        this.io.emit(MessageId.PLAYER_JOINED, new PlayerJoinedMessage(player_id, username, spaceship));
    }

    broadcastPlayerLeft(player_id: string) {
        this.io.emit(MessageId.PLAYER_LEFT, new PlayerLeftMessage(player_id));
    }

    sendInitState(player_id: string, message: InitMessage) {
        this.socket_by_id.get(message.your_id).emit(MessageId.INIT_STATE, message);
    }
}
