import { io, Socket } from 'socket.io-client';
import {
    InitMessage,
    InputMessage,
    MessageId,
    PlayerJoinedMessage,
    PlayerLeftMessage,
    UpdateMessage,
} from '../shared/messages';
import {ControlState, PlayerInput} from '../shared/player_input';

export class ClientComm {
    socket: Socket;
    on_connect: () => void;
    on_disconnect: () => void;
    on_init: (message: InitMessage) => void;
    on_update: (message: UpdateMessage) => void;
    on_player_joined: (message: PlayerJoinedMessage) => void;
    on_player_left: (message: PlayerLeftMessage) => void;
    my_id: string;

    constructor() {
        this.socket = io();
        // TODO: do we need to init at all? Not sure what the best style would be
        this.on_connect = () => {
            /*Init empty*/
        };
        this.on_disconnect = () => {
            /*Init empty*/
        };
        this.on_init = () => {
            /*Init empty*/
        };
        this.on_update = () => {
            /*Init empty*/
        };
        this.on_player_joined = () => {
            /*Init empty*/
        };
        this.on_player_left = () => {
            /*Init empty*/
        };

        this.socket.on('connect', () => {
            this.on_connect();
        });
        this.socket.on('disconnect', () => {
            this.on_disconnect();
        });
        this.socket.on(MessageId.INIT_STATE, (message: InitMessage) => {
            this.my_id = message.your_id;
            this.on_init(message);
        });
        this.socket.on(MessageId.GAME_UPDATE, (message: UpdateMessage) => {
            this.on_update(message);
        });
        this.socket.on(MessageId.PLAYER_JOINED, (message: PlayerJoinedMessage) => {
            this.on_player_joined(message);
        });
        this.socket.on(MessageId.PLAYER_LEFT, (message: PlayerLeftMessage) => {
            this.on_player_left(message);
        });
    }

    sendInput(controls: ControlState, seqNum: number) {
        this.socket.emit(MessageId.SEND_INPUT, new InputMessage(new PlayerInput(controls, seqNum, this.my_id)));
    }
}
