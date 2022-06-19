/*Message names used in socket communication.*/
// TODO: share with server
export enum Messages {
    INIT_STATE = 'init_state',
    GAME_UPDATE = 'game_update',
    SEND_INPUT = 'send_input',
    PLAYER_LEFT = 'player_left',
    PLAYER_JOINED = 'player_joined',
}