class Transform {
  constructor(x, y, r_heading) {
    this.x = x;
    this.y = y;
    this.r_heading = r_heading;
  }
}

// Node exports
if (typeof window === 'undefined') {
  module.exports.Transform = Transform;
}
