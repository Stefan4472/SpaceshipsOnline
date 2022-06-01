class Player {
    constructor(id, ship_id, socket) {
        this.id = id;
        this.ship_id = ship_id;
        this.socket = socket;
    }
}

module.exports.Player = Player;