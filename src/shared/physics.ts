/*Simple representation and simulation of spaceship physics*/
export class Physics {
    private _x: number;
    private _y: number;
    private _rotation: number;
    private _rotationSpeed: number;
    private _speed: number = 0;
    private _acceleration: number = 0;
    public readonly max_speed: number = 0.3;

    constructor(x: number, y: number, rotation: number) {
        this._x = x;
        this._y = y;
        this._rotation = rotation;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    get rotation(): number {
        return this._rotation;
    }

    set rotation(value: number) {
        this._rotation = value;
    }

    get rotationSpeed(): number {
        return this._rotationSpeed;
    }

    set rotationSpeed(value: number) {
        this._rotationSpeed = value;
    }

    get speed(): number {
        return this._speed;
    }

    set speed(value: number) {
        // Normalize speed to [0, max_speed]
        if (value > this.max_speed) {
            this._speed = this.max_speed;
        } else if (value < 0) {
            this._speed = 0;
        } else {
            this._speed = value;
        }
    }

    get acceleration(): number {
        return this._acceleration;
    }

    set acceleration(value: number) {
        this._acceleration = value;
    }

    /* Simulate `ms` milliseconds forward in time */
    simulate(ms: number) {
        // Semi-implicit Euler: see https://gafferongames.com/post/integration_basics/
        this.speed += this.acceleration * ms;
        this.rotation += this.rotationSpeed * ms;
        this.x += this.speed * ms * Math.cos(this.rotation);
        this.y += this.speed * ms * Math.sin(this.rotation);
    }

    easeTo(other: Physics) {

    }

    snapTo(other: Physics) {

    }
}