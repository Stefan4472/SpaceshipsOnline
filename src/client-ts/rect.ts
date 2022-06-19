/*
Simple rectangle class. Defined by (x, y, width, height) with optional
rotation (radians clockwise).
*/
export class Rect {
    x: number;
    y: number;
    w: number;
    h: number;

    // TODO: rotation?
    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        // this.rad_rotation = rad_rotation;
    }

    // // return whether this Rect intersects the given Rect
    // intersects(rect: Rect) : boolean {  // TODO: THIS TESTS IF THE OTHER RECT IS INSIDE THIS ONE!
    //     return (rect.x >= this.x && rect.x < this.x + this.w) &&
    //         (rect.y >= this.y && rect.y < this.y + this.h);
    //     // return (this.x < rect.x + rect.w && this.x + this.w > rect.x &&
    //        // this.y > rect.y + rect.h && this.y + this.h < rect.y);
    // }
}