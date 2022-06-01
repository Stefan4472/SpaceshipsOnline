/*
Client socket code for sending on the socket. Only includes emit functions.
Create listeners on your own.
*/
class Client {
  constructor() {
    console.log('Starting Socket.IO client');
    this.socket = io.connect();
    // this.onJoinedGame = (data) => {console.log('yo');};

    // _this = this;
    // this.socket.on('joined_game', function(data) { 
    //     console.log('Joined game');
    //     // _this.onJoinedGame(data); 
    // });
  }

  sendControls(up, down, left, right, space) {
    this.socket.emit('control_input', { up_pressed: up, down_pressed: down,
      left_pressed: left, right_pressed: right, space_pressed: space });
  }

  /* Listeners */

}
