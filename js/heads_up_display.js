/*
Displays the player's Heads-Up-Display, which includes a large healthbar,
a display of ammunition left, and game messages. The HUD is given a
reference to the player's Spaceship sprite, allowing if to listen for
changes to the player's hp.
*/
class HeadsUpDisplay {
  constructor(sprite, screen_width, screen_height) {
    console.log("Creating HUD. Screen w/h " + screen_width + ", " + screen_height);
    this.sprite = sprite;
    this.last_hp = sprite.hp;
    this.last_full_hp = sprite.full_hp;
    this.last_update_ms = 0;
    this.x = screen_width * 0.01;
    this.y = screen_height - 10;
    this.width = screen_width * 0.98;
    this.height = 8;
    this.fill_width = this.width * (sprite.hp * 1.0 / sprite.full_hp);
    this.color = "#00FF00";
    // message log has entries of { string, color, ms_displayed }
    // limited to ten entries
    this.message_log = [];
    // index of most recent message added
    this.top_message_index = -1;
  }

  update(ms) {
    this.last_update_ms = ms;

    // hp or full hp changed: recalculate healthbar params
    if (this.sprite.hp != this.last_hp ||
        this.sprite.last_full_hp != this.last_full_hp) {
      this.last_hp = this.sprite.hp;
      this.sprite.last_full_hp = this.sprite.full_hp;

      this.fill_width = this.width * (this.sprite.hp * 1.0 / this.sprite.full_hp);

      // TODO: COLOR CHANGE?
    }
  }

  // adds message to the current message_log
  // each entry in message_list must have 'text', 'color' (hex)
  addMessage(text, color) {
    console.log("Adding Message " + text);
    this.message_log.push({text: text, color: color, ms_to_display: 3000});
    this.top_message_index++;

  }

  // draw healthbar to canvas
  draw(context, texture_atlas) {
    // draw healthbar rectangle
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.fill_width, this.height);

    // draw number of bullets left
    context.fillStyle = '#FFFFFF';
    context.font = "30px Arial";
    context.fillText(this.sprite.ammo_left.toString(), this.x, this.y);

    context.font = "12px Arial";
    var draw_x = 10, draw_y = 200;

    // draw message log
    for (var i = 0; i < 10 && this.top_message_index > i; i++) {
      var message = this.message_log[this.top_message_index - i];

      if (message.ms_to_display > 0) {
        context.fillStyle = message.color;
        context.fillText(message.text, draw_x, draw_y + i * 14);
        message.ms_to_display -= this.last_update_ms;
      }
    }
  }
}
