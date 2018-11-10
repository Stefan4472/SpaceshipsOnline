/*
Spaceship class. Can be controlled via the handleControls() method.
*/
class Spaceship extends Sprite {

  constructor(id, img, x, y) {
    super(id, img, x, y, 100);
    this.show_healthbar = false;
  }

  handleControls(up_pressed, down_pressed, left_pressed, right_pressed, space_pressed) {
    if (up_pressed)
    {
      this.accel = 2;
    }
    else if (!up_pressed)
    {
      // decellerate if up is not pressed
      this.accel = -1.0;
    }
    if (down_pressed)
    {
      this.accel = -2;
    }
    if (right_pressed)
    {
      this.radRotation += 0.09;
    }
    if (left_pressed)
    {
      this.radRotation -= 0.09;
    }
  }
}
