/*
A particle is basically a light-weight sprite that can move for a limited
amount of time in a straight line. They are meant to be more-or-less
randomly generated to give a certain effect.
*/
class Particle {
  constructor(x, y, rad_heading, speed, radius, color, max_dist_sqr) {
    this.x = x;
    this.y = y;
    this.start_x = x;
    this.start_y = y;
    this.dx = speed * Math.cos(rad_heading);
    this.dy = speed * Math.sin(rad_heading);
    this.radius = radius;
    this.color = color;
    this.max_dist_sqr = max_dist_sqr;
    this.destroy = false;
  }

  update(ms) {  // TODO: SPEED RELATIVE TO MS
    this.x += this.dx;
    this.y += this.dy;

    this.destroy = (this.x - this.start_x) * (this.x - this.start_x) +
      (this.y - this.start_y) * (this.y - this.start_y) >= this.max_dist_sqr;
  }

  // draw circle at (x, y) - (view_x, view_y) with specified size and color
  draw(context, view_x, view_y) {
    if (!this.destroy) {
      context.beginPath();
      context.arc(this.x - view_x, this.y - view_y, this.radius, 0, 2 * Math.PI, false);
      context.fillStyle = this.color;
      context.fill();
    }
  }
}
