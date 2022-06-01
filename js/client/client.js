/*
Client socket code for sending on the socket. Only includes emit functions.
Create listeners on your own.
*/
class Client {
  constructor() {
    this.socket = io.connect();
  }

  sendControls(up, down, left, right, space) {
    this.socket.emit('control_input', { up_pressed: up, down_pressed: down,
      left_pressed: left, right_pressed: right, space_pressed: space });
  }
}
