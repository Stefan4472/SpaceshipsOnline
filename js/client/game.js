/* Client-side game driver */
class Game {
  /* Create the game and start it. */
  constructor(game_context, player_ship) {
    this.game_context = game_context;
    this.draw_context = this.game_context.canvas.getContext("2d");
    this.background = new Background(this.game_context);

    // Current state of input
    this.curr_input = new PlayerInput()
    this.input_changed = false;

    // Timestamp of last game update
    this.last_update_time = null;

    // Map playerID to SpriteID
    this.players = new Map();
    this.players.set(this.game_context.my_id, player_ship.sprite_id);
    // TODO: one single map of SpriteID -> sprite
    // spaceship objects, mapped by player_id
    this.spaceships = new Map();
    this.spaceships.set(player_ship.sprite_id, new Spaceship(
        this.game_context,
        player_ship.sprite_id,
        this.game_context.my_id,
        player_ship.x,
        player_ship.y,
        player_ship.heading,
    ));
  }

  start() {
    console.log("Starting game");
    this.last_update_time = Date.now();

    // Add key listeners
    var game = this;
    document.addEventListener("keydown", function(e) { game.keyDownHandler(e); }, false);
    document.addEventListener("keyup", function(e) { game.keyUpHandler(e); }, false);

    // Start the game loop
    window.requestAnimationFrame(function() { game.updateAndDraw(); });
  }

  // Handle receiving an authoritative game state.
  onGameUpdate(game_state) {
    console.log("Received game update", game_state);
    for (var server_ship of game_state.spaceships) {
      if (this.spaceships.has(server_ship.sprite_id)) {
        var client_ship = this.spaceships.get(server_ship.sprite_id);
        client_ship.x = server_ship.x;
        client_ship.y = server_ship.y;
        client_ship.heading = server_ship.heading;
      }
    }
  }

  updateAndDraw() {
    var curr_time = Date.now();
    var ms_since_update = curr_time - this.last_update_time;
    var player_ship = this.spaceships.get(this.players.get(this.game_context.my_id));
    // Handle player input TODO: DO THIS DIRECTLY IN THE KEY LISTENER?
    if (this.input_changed) {
      // Send controls to server
      this.game_context.client.sendInput(this.curr_input);
      // Send controls to player's ship
      player_ship.setInput(this.curr_input)
      this.input_changed = false;
    }

    for (const [sprite_id, spaceship] of this.spaceships.entries()) {
      spaceship.update(ms_since_update);
      // spaceship.move(ms_since_update);
    }

    // console.log("Player ship is at " + player_ship.x + ", " + player_ship.y);
    this.background.center_to(
      player_ship.x, /*+ player_ship.img_width / 2,*/
      player_ship.y /*+ player_ship.img_height / 2*/
    );

    // this.hud_view.update(ms_since_update);

    this.drawGame()

    this.last_update_time = curr_time;

    // schedule next frame
    if (!this.game_over) {
      var game = this;
      window.requestAnimationFrame(function() { game.updateAndDraw(); });
    }
  }

  drawGame() {
    this.background.draw(this.draw_context);
    for (const [sprite_id, spaceship] of this.spaceships.entries()) {
      spaceship.draw(this.draw_context, this.background.view_x, this.background.view_y);
    }

    // this.hud_view.draw(this.ctx, this.texture_atlas);
  }

  onPlayerJoined(info) {
    console.log(`Game adding player with id ${info.player_id}`);
    // Create Spaceship from serialized state
    this.spaceships.set(info.spaceship.sprite_id, new Spaceship(
        this.game_context,
        info.spaceship.sprite_id,
        info.player_id,
        info.spaceship.x,
        info.spaceship.y,
        info.spaceship.heading
    ));
    this.players.set(info.player_id, info.spaceship.sprite_id);
  }

  onPlayerLeft(info) {
    console.log(`Player with id ${info.player_id} disconnected`);
    // this.hud_view.addMessage(this.players.get(info.id).username +
    //   " left the game");
    var sprite_id = this.players.get(info.player_id);
    this.spaceships.delete(sprite_id);
    this.players.delete(info.player_id);
    if (info.player_id === this.game_context.my_id) {
      this.stop();
    }
  }

  stop() {
    this.game_over = true;
  }

  keyDownHandler(e) {
    if (e.keyCode === 87)  // "e"
    {
      this.curr_input.up = true;
    }
    else if (e.keyCode === 83) // "d"
    {
      this.curr_input.down = true;
    }
    else if (e.keyCode === 68) { // "d"
      this.curr_input.right = true;
    }
    else if (e.keyCode === 65) { // "a"
      this.curr_input.left = true;
    }
    else if (e.keyCode === 32) { // "space"
      this.curr_input.shoot = true;
    }
    this.input_changed = true;
  }

  keyUpHandler(e) {
    if (e.keyCode === 87)  // "e"
    {
      this.curr_input.up = false;
    }
    else if (e.keyCode === 83) // "d"
    {
      this.curr_input.down = false;
    }
    else if(e.keyCode === 68) {
      this.curr_input.right = false;
    }
    else if(e.keyCode === 65) {
      this.curr_input.left = false;
    }
    else if (e.keyCode === 32) { // "space"
      this.curr_input.shoot = false;
    }
    this.input_changed = true;
  }
}
