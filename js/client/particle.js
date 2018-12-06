/*
A particle is basically a light-weight sprite that can move for a limited
amount of time in a straight line. They are meant to be more-or-less
randomly generated to give a certain effect.
*/
class Particle {
  constructor(x, y, rad_heading, speed, max_dist_sqr) {
    this.x = x;
    this.y = y;
    this.start_x = x;
    this.start_y = y;
    console.log("Creating particle with speed " + speed);
    this.dx = speed * Math.cos(rad_heading);
    this.dy = speed * Math.sin(rad_heading);
    this.max_dist_sqr = max_dist_sqr;
    this.time_alive = 0;
    this.destroy = false;
  }

  update(ms) {  // TODO: SPEED RELATIVE TO MS
    this.x += this.dx * ms;
    this.y += this.dy * ms;

    this.time_alive += ms;

    this.destroy = this.time_alive > 200 ||
      (this.x - this.start_x) * (this.x - this.start_x) +
      (this.y - this.start_y) * (this.y - this.start_y) >=
      this.max_dist_sqr;
  }

  // draw at (x, y) - (view_x, view_y)
  draw(context, texture_atlas, view_x, view_y) {
    if (!this.destroy) {
      texture_atlas.drawImg(context, this.x - view_x, this.y - view_y,
        TextureId.EXHAUST_PARTICLE);
    }
  }
}
