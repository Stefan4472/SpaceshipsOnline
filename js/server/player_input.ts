/* Simple struct to track state of input (pressed or not) */
export class PlayerInput {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    shoot: boolean;
}

export class QueuedInput {
    player_id: number;
    state: PlayerInput;
}