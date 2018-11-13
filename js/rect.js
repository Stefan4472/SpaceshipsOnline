/*
Simple rectangle class. Defined by (x, y, width, height) with optional
rotation (radians clockwise).
*/
class Rect {
  constructor(x, y, w, h, rad_rotation=0.0) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.rad_rotation = rad_rotation;
  }
}
