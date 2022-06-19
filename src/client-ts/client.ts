import {Socket} from "socket.io-client";
import {Messages} from "./messages";
import {PlayerInput} from "./player_input";

// TODO: improve/add functionality. Should abstract away all the socket messages
export class Client {
    socket: Socket;
    constructor(socket: Socket) {
        this.socket = socket;
    }

    sendInput(input: PlayerInput) {
        this.socket.emit(Messages.SEND_INPUT, input);
    }

  /* Listeners TODO */

}
