/*
Client socket code for sending on the socket. Only includes emit functions.
Create listeners on your own.
*/
class Client {
  constructor() {
    console.log('Starting Socket.IO client');
    this.socket = io.connect();
  }

  sendInput(input) {
    this.socket.emit(Messages.SEND_INPUT, input);
  }

  /* Listeners */

}
