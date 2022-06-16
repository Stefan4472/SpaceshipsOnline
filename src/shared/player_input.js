/* Simple struct to track state of input (pressed or not) */
class PlayerInput {
    constructor() {
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.shoot = false;
    }
}
// Node exports
if (typeof window === 'undefined') {
    module.exports.PlayerInput = PlayerInput;
}