import {io, Socket} from "socket.io-client";
import {
    InitMessage,
    InputMessage,
    MessageId,
    PlayerJoinedMessage,
    PlayerLeftMessage,
    UpdateMessage
} from "../shared/messages";
import {PlayerInput} from "../shared/player_input";

export class ClientComm {
    socket: Socket;
    on_connect: () => void;
    on_disconnect: () => void;
    on_init: (message: InitMessage) => void;
    on_update: (message: UpdateMessage) => void;
    on_player_joined: (message: PlayerJoinedMessage) => void;
    on_player_left: (message: PlayerLeftMessage) => void;

    constructor() {
        this.socket = io();
        this.on_connect = () => {};
        this.on_disconnect = () => {};
        this.on_init = () => {};
        this.on_update = () => {};
        this.on_player_joined = () => {};
        this.on_player_left = () => {};

        this.socket.on('connect', () => {
            this.on_connect();
        })
        this.socket.on('disconnect', () => {
            this.on_disconnect();
        })
        this.socket.on(MessageId.INIT_STATE, (message: InitMessage) => {
            this.on_init(message);
        })
        this.socket.on(MessageId.GAME_UPDATE, (message: UpdateMessage) => {
            this.on_update(message);
        })
        this.socket.on(MessageId.PLAYER_JOINED, (message: PlayerJoinedMessage) => {
            this.on_player_joined(message);
        })
        this.socket.on(MessageId.PLAYER_LEFT, (message: PlayerLeftMessage) => {
            this.on_player_left(message);
        })
    }

    sendInput(input: PlayerInput) {
        this.socket.emit(MessageId.SEND_INPUT, new InputMessage(input));
    }
}
