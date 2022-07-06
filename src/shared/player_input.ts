/* Simple struct to track state of input (pressed or not) */
export class ControlState {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    shoot: boolean;

    constructor(
        up: boolean = false,
        down: boolean = false,
        left: boolean = false,
        right: boolean = false,
        shoot: boolean = false,
    ) {
        this.up = up;
        this.down = down;
        this.left = left;
        this.right = right;
        this.shoot = shoot;
    }
}

/* ControlState plus sequence number */
export class PlayerInput {
    state: ControlState;
    seqNum: number;

    constructor(state: ControlState, seqNum: number) {
        this.state = state;
        this.seqNum = seqNum;
    }
}