/* Client-side game driver */
class Game {
  /* Create the game and start it. */
  constructor(game_context) {
    this.game_context = game_context;
    this.client = game_context.client;
    this.canvas = game_context.canvas;
    this.assets = game_context.assets;
    this.player_id = game_context.my_id;

    this.ctx = this.canvas.getContext("2d");
    this.screen_width = this.canvas.width;
    this.screen_height = this.canvas.height;

    this.background = new Background(
      1000, 
      1000, 
      this.canvas.width, 
      this.canvas.height, 
      this.game_context.assets.background_img
    );
    this.texture_atlas = new TextureAtlas(
      this.game_context.assets.texture_atlas_img
    );

    // Current state of input
    this.input_changed = false;
    this.up_pressed = false;
    this.down_pressed = false;
    this.left_pressed = false;
    this.right_pressed = false;
    this.space_pressed = false;

    // Timestamp of last game update
    this.last_update_time = null;

    // Map playerID to player object
    this.players = new Map();

    // TODO: one single map of SpriteID -> sprite
    // spaceship objects, mapped by player_id
    this.spaceships = new Map();
    // bullets fired by players and being tracked, mapped by id
    this.bullets = new Map();
    // power-ups floating around the map, mapped by id
    this.power_ups = new Map();
    // all currently-active sprites, mapped by id
    // this is meant to be redundant over the other, type-specific mappings
    this.sprites = new Map();

    // Head's up display
    // this.hud_view = new HeadsUpDisplay(
    //   this.player_ship,
    //   this.screen_width, 
    //   this.screen_height
    // );

    this.start();
  }

  start() {
    console.log("Starting game");
    this.last_update_time = Date.now();

    // Add key listeners
    var game = this;
    document.addEventListener("keydown", function(e) { game.keyDownHandler(e); }, false);
    document.addEventListener("keyup", function(e) { game.keyUpHandler(e); }, false);

    // set updateAndDraw(), starting the game loop
    window.requestAnimationFrame(function() { game.updateAndDraw(); });
  }

  // receive an updated game state
  // ease client-side sprites to server-side ones, and add any new sprites
  // handle score updates, and other things
  onGameUpdate(game_state) {
    console.log("Received game update");

    // add any new objects
    for (var ship_data of game_state.new_spaceships) {
      var new_ship = new Spaceship(ship_data.id, ship_data.player_id,
        ship_data.x, ship_data.y, null, this.texture_atlas);
      this.spaceships.set(new_ship.id, new_ship);
      // add mapping from player -> ship_id
      this.players.get(new_ship.player_id).ship_id = new_ship.id;
      console.log('Player ' + new_ship.player_id + ' has ship id ' + new_ship.id);
    }

    for (var bullet_data of game_state.new_bullets) {
      var new_bullet = new Bullet(bullet_data.id, bullet_data.shooter_id,
        0, bullet_data.bullet_num, bullet_data.x, bullet_data.y,
        bullet_data.heading, 0, this.texture_atlas);
      this.bullets.set(new_bullet.id, new_bullet);
    }

    for (var powerup_data of game_state.new_powerups) {
      var new_powerup = new Powerup(powerup_data.id, powerup_data.x,
        powerup_data.y, this.texture_atlas);
      this.power_ups.set(new_powerup.id, new_powerup);
    }

    // for each sprite:
    // if already in the mapping, ease the client state to the server state
    // otherwise, add a new sprite
    for (var server_ship of game_state.spaceships) {
      console.log("Received server update " + server_ship.x + ", " + server_ship.y);
      var client_ship = this.spaceships.get(server_ship.id);
      client_ship.easeTo(server_ship);
      console.log("Client ship set to " + client_ship.x + ", " + client_ship.y);
      console.log("Reference has x " + this.spaceships.get(server_ship.id).x);
      // apply controls for all ships not controlled by the player
      // if (server_ship.id !== this.player_id) {
      //   console.log("Setting controls for id " + server_ship.id);
      //   this.spaceships.get(server_ship.id).setInput(server_ship.up_pressed,
      //     server_ship.down_pressed, server_ship.left_pressed,
      //     server_ship.right_pressed, server_ship.space_pressed);
      // }
    }

    for (var server_bullet of game_state.bullets) {
      var client_bullet = this.bullets.get(server_bullet.id);
      client_bullet.easeTo(server_bullet);
    }

    for (var server_powerup of game_state.power_ups) {
      var client_powerup = this.power_ups.get(server_powerup.id);
      client_powerup.easeTo(server_powerup);
    }

    for (var collision of game_state.collisions) {
      this.hud_view.addMessage(
        "Collision of " + collision.id1 + " and " + collision.id2, '#0000FF');
    }
  }

  updateAndDraw() {
    var curr_time = Date.now();
    var ms_since_update = curr_time - this.last_update_time;

    var player_ship = this.spaceships.get(this.player_id);
    // handle changed input TODO: DO THIS DIRECTLY IN THE KEY LISTENER?
    if (this.input_changed) {  // WEIRD... THIS ISN'T SENDING INPUT!!
      // send controls to server
      client.sendControls(this.up_pressed, this.down_pressed,
        this.left_pressed, this.right_pressed, this.space_pressed);

      // handle controls pressed by player
      player_ship.setInput(
        this.up_pressed,
        this.down_pressed, 
        this.left_pressed, 
        this.right_pressed,
        this.space_pressed
      );

      this.input_changed = false;
    }

    // TODO: COLLISION-DETECTION DONE SERVER-SIDE ONLY?

    // update sprites client-side
    for (var ship of this.spaceships.values()) {
       // TODO: HANDLING OF DEAD SHIPS AND RESPAWN
      ship.update(ms_since_update);
      ship.move(ms_since_update);
    }

    for (var bullet of this.bullets.values()) {
      bullet.update(ms_since_update);
      bullet.move(ms_since_update);
    }

    for (var powerup of this.power_ups.values()) {  // TODO: SPLIT UPDATE AND MOVE
      powerup.update(ms_since_update);
      powerup.move(ms_since_update);
    }

    console.log("Player ship is at " + player_ship.x + ", " + player_ship.y);
    this.background.center_to(
      player_ship.x + player_ship.img_width / 2,
      player_ship.y + player_ship.img_height / 2
    );

    this.hud_view.update(ms_since_update);

    this.drawGame()

    this.last_update_time = curr_time;

    // schedule next frame
    if (!this.game_over) {
      var game = this;
      window.requestAnimationFrame(function() { game.updateAndDraw(); });
    }
  }

  drawGame() {
    this.background.draw(this.ctx, this.texture_atlas);

     // TODO: ONLY DRAW THINGS THAT ARE VISIBLE ON SCREEN

    for (var bullet of this.bullets.values()) {
      bullet.draw(this.ctx, this.texture_atlas,
        this.background.view_x, this.background.view_y);
    }

    for (var powerup of this.power_ups.values()) {
      powerup.draw(this.ctx, this.texture_atlas,
        this.background.view_x, this.background.view_y);
    }

    for (var ship of this.spaceships.values()) {
      ship.draw(this.ctx, this.texture_atlas,
        this.background.view_x, this.background.view_y);
    }

    this.hud_view.draw(this.ctx, this.texture_atlas);
  }

// TODO: ONPLAYERCONNECT... BUT SHOULD WE ALLOW JOINING MID-MATCH?
  // addPlayer(id, x, y) {
  //   console.log("Game adding player with id " + id + " at " + x + ", " + y);
  //   // TODO: FIX THIS
  //   this.players.push(
  //     new Spaceship(id, x, y, this.texture_atlas));
  // }

  // called by lobby when a player has been disconnected
  // print message to console and remove player from the game
  onPlayerDisconnected(player_id) {
    console.log("Player with id " + player_id + " disconnected");
    this.hud_view.addMessage(this.players.get(player_id).username +
      " left the game");
    this.spaceships.delete(player_id);
    this.players.delete(player_id);
  }

  // called by the lobby to terminate the game (e.g., player was kicked)
  stop() {
    this.game_over = true;
  }

  keyDownHandler(e) {
    this.input_changed = true;
    if (e.keyCode == 87)  // "e"
    {
      this.up_pressed = true;
    }
    else if (e.keyCode == 83) // "d"
    {
      this.down_pressed = true;
    }
    else if (e.keyCode == 68) { // "d"
      this.right_pressed = true;
    }
    else if (e.keyCode == 65) { // "a"
      this.left_pressed = true;
    }
    else if (e.keyCode == 32) { // "space"
      this.space_pressed = true;
    }
  }

  keyUpHandler(e) {
    this.input_changed = true;
    if (e.keyCode == 87)  // "e"
    {
      this.up_pressed = false;
    }
    else if (e.keyCode == 83) // "d"
    {
      this.down_pressed = false;
    }
    else if(e.keyCode == 68) {
      this.right_pressed = false;
    }
    else if(e.keyCode == 65) {
      this.left_pressed = false;
    }
    else if (e.keyCode == 32) { // "space"
      this.space_pressed = false;
    }
  }
}
