/* Client-side game driver */
import {GameContext} from "./game_context";
import {Background} from "./background";
import {PlayerInput} from "./player_input";
import {Player} from "./player";
import {Spaceship} from "./spaceship";

export class Game {
    game_context: GameContext;
    view_x: number;
    view_y: number;
    background: Background;
    last_update_time: number;
    game_over: boolean;
    curr_input: PlayerInput;
    input_changed: boolean;
    players: Map<number, Player>;
    spaceships: Map<number, Spaceship>;

  /* Create the game and start it. */
  constructor(game_context: GameContext) {
    this.game_context = game_context;
    // Coordinates of the "view" of the player on the game
    this.view_x = 0;
    this.view_y = 0;
    this.background = new Background(this.game_context);

    // Current state of input
    this.curr_input = new PlayerInput()
    this.input_changed = false;

    // Timestamp of last game update
    this.last_update_time = null;

    // Map playerID to Player instance
    this.players = new Map();
    // TODO: one single map of SpriteID -> sprite
    // Spaceship instances, mapped by spriteId
    this.spaceships = new Map();
  }

  start(init_state, players) {
    console.log("Starting game");
    for (let player_obj of players) {
      let spaceship = init_state.spaceships.find(ship => ship.sprite_id === player_obj.sprite_id);
      this.onPlayerJoined(player_obj.id, spaceship);
    }

    // Add key listeners
    let game = this;
    document.addEventListener("keydown", function(e) { game.keyDownHandler(e); }, false);
    document.addEventListener("keyup", function(e) { game.keyUpHandler(e); }, false);

    // Start the game loop
    this.last_update_time = Date.now();
    window.requestAnimationFrame(function() { game.updateAndDraw(); });
  }

  // Handle receiving an authoritative game state.
  onGameUpdate(game_state) {
    // console.log("Received game update", game_state);
    for (const server_ship of game_state.spaceships) {
      if (this.spaceships.has(server_ship.sprite_id)) {
        let client_ship = this.spaceships.get(server_ship.sprite_id);
        client_ship.x = server_ship.x;
        client_ship.y = server_ship.y;
        client_ship.heading = server_ship.heading;
      }
    }
  }

  updateAndDraw() {
    let curr_time = Date.now();
    let ms_since_update = curr_time - this.last_update_time;
    let player = this.players.get(this.game_context.my_id);
    let player_ship = this.spaceships.get(player.sprite_id);
    // Handle player input TODO: DO THIS DIRECTLY IN THE KEY LISTENER?
    if (this.input_changed) {
      // Send controls to server
      this.game_context.client.sendInput(this.curr_input);
      // Send controls to player's ship
      player_ship.setInput(this.curr_input)
      this.input_changed = false;
    }

    for (const spaceship of this.spaceships.values()) {
      spaceship.update(ms_since_update);
      // spaceship.move(ms_since_update);
    }

    this.centerView();
    this.drawGame()

    this.last_update_time = curr_time;

    // Schedule next frame
    if (!this.game_over) {
      let game = this;
      window.requestAnimationFrame(function() { game.updateAndDraw(); });
    }
  }

  centerView() {
    var player = this.players.get(this.game_context.my_id);
    var player_ship = this.spaceships.get(player.sprite_id);
    // console.log(`Centering view onto player ship at ${player_ship.x}, ${player_ship.y}`)
    // TODO: account for player's width and height
    this.view_x = player_ship.x - this.game_context.screen_width / 2;
    this.view_y = player_ship.y - this.game_context.screen_height / 2;

    // Ensure view doesn't go off the map
    if (this.view_x < 0) {
      this.view_x = 0;
    } else if (this.view_x + this.game_context.screen_width > this.game_context.game_width) {
      this.view_x = this.game_context.game_width - this.game_context.screen_width;
    }
    if (this.view_y < 0) {
      this.view_y = 0;
    } else if (this.view_y + this.game_context.screen_height > this.game_context.game_height) {
      this.view_y = this.game_context.game_height - this.game_context.screen_height;
    }
  }

  drawGame() {
    this.game_context.drawer.setOffset(this.view_x, this.view_y);
    this.background.draw(this.game_context.drawer);
    for (const spaceship of this.spaceships.values()) {
      spaceship.draw(this.game_context.drawer);
    }
  }

  onPlayerJoined(player_id, spaceship) {
    console.log(`Game adding player with id ${player_id}, spaceship ${JSON.stringify(spaceship)}`);
    // Create Spaceship from serialized state
    this.spaceships.set(spaceship.sprite_id, new Spaceship(
        this.game_context,
        spaceship.sprite_id,
        player_id,
        spaceship.x,
        spaceship.y,
        spaceship.heading
    ));
    this.players.set(player_id, new Player(player_id, spaceship.sprite_id));
  }

  onPlayerLeft(info) {
    console.log(`Player with id ${info.player_id} disconnected`);
    // this.hud_view.addMessage(this.players.get(info.id).username +
    //   " left the game");
    let sprite_id = this.players.get(info.player_id).sprite_id;
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
