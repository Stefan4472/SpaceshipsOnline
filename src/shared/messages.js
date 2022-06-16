/*
"Enum" for message names used in socket communication.
*/
var Messages = {};
Messages.INIT_STATE = 'init_state';
Messages.GAME_UPDATE = 'game_update';
Messages.SEND_INPUT = 'send_input';
Messages.PLAYER_LEFT = 'player_left';
Messages.PLAYER_JOINED = 'player_joined';

// Node exports
if (typeof window === 'undefined') {
  module.exports.Messages = Messages;
}