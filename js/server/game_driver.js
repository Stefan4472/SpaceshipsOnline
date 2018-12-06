// module imports
var TextureAtlas = require('./../shared/texture_atlas.js').TextureAtlas;
var Sprite = require('./../shared/sprite.js').Sprite;
var SpriteType = require('./../shared/sprite.js').SpriteType;
var Rect = require('./../shared/rect.js').Rect;
var Spaceship = require('./../shared/spaceship.js').Spaceship;
var AmmoDrop = require('./../shared/ammo_drop.js').AmmoDrop;

/*
Runs the game server-side. Meant to be sub-classed to implement a specific
game mode.
*/
class Game {
  constructor() {
    this.texture_atlas = new TextureAtlas();
    this.sprite = new Sprite(0, 2, 100, 100, this.texture_atlas);
    this.spaceship = new Spaceship(1, 100, 100, this.texture_atlas);
    this.drop = new AmmoDrop(2, 100, 100, this.texture_atlas);
  }
}

module.exports = Game;
