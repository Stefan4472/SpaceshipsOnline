/*
Client socket code for sending on the socket. Only includes emit functions.
Create listeners on your own.
*/
class Client {
  constructor() {
    console.log('Starting Socket.IO client');
    this.socket = io.connect();
  }

  sendControls(up, down, left, right, space) {
    this.socket.emit(Messages.SEND_INPUT, { up_pressed: up, down_pressed: down,
      left_pressed: left, right_pressed: right, space_pressed: space });
  }

  /* Listeners */

}
