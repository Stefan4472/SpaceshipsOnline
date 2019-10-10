// Stores messages for client<->server communication

/*
"Enum" for messages.
*/
var Messages = {};
Messages.INIT_STATE = 'init_state';
Messages.GAME_UPDATE = 'game_update';
Messages.JOIN_GAME = 'join_game';
Messages.SEND_INPUT = 'send_input';
Messages.ECHO = 'echo';
Messages.PLAYER_DISCONNECTED = 'player_disconnected';

// Node exports
if (typeof window === 'undefined') {
  module.exports.Messages = Messages;
}
