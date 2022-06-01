class Physics {
  constructor(transform, max_speed) {
    this.transform = transform;
    this.max_speed = max_speed;
    this.speed = 0;
    this.accel = 0;
  }

  update(ms) {
    this.speed += this.accel;

    // normalize speed to [0, max_speed]
    if (this.speed > this.max_speed) {
      this.speed = this.max_speed;
    }
    else if (this.speed < 0) {
      this.speed = 0;
    }

    var dx = this.speed * ms * Math.cos(this.transform.r_heading);
    var dy = this.speed * ms * Math.sin(this.transform.r_heading);

    // move by speed pixels in direction specified by r_heading
    this.transform.x += dx;
    this.transform.y += dy;
  }
}

// Node exports
if (typeof window === 'undefined') {
  module.exports.Physics = Physics;
}
