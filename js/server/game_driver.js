var TextureAtlas = require('./texture_atlas.js').TextureAtlas;
var Sprite = require('./sprite.js').Sprite;
var SpriteType = require('./sprite.js').SpriteType;
var Rect = require('./rect.js').Rect;

/*
Runs the game server-side. Meant to be sub-classed to implement a specific
game mode.
*/
class Game {
  constructor() {
    this.sprite = new Sprite(0, 2, 100, 100);
  }
}

module.exports = Game;
