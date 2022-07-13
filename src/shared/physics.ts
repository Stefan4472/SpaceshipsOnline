/*Simple representation and simulation of spaceship physics*/
import {SerializedPhysics} from "./messages";

export class Physics {
    private _x: number;
    private _y: number;
    private _rotation: number;
    private _rotationSpeed: number = 0;
    private _speed: number = 0;
    private _acceleration: number = 0;
    public readonly max_speed;

    constructor(x: number, y: number, rotation: number, max_speed: number) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.max_speed = max_speed;
    }

    fromSerialized(ser: SerializedPhysics) {
        this._x = ser.x;
        this._y = ser.y;
        this._rotation = ser.rotation;
        this._rotationSpeed = ser.rotationSpeed;
        this._speed = ser.speed;
        this._acceleration = ser.acceleration;
        // this.max_speed = ser.max_speed;
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

    /* Calculate squared Euclidean distance */
    squaredDist(other: Physics) {
        return (this.x - other.x)**2 + (this.y - other.y)**2;
    }

    easeTo(other: Physics, percent: number = 0.1) {
        /* Eases immediate quantities and snaps derivative quantities */
        this.x = this.x + (other.x - this.x) * percent;
        this.y = this.y + (other.y - this.y) * percent;
        this.rotation = this.rotation + (other.rotation - this.rotation) * percent;
        this.rotationSpeed = other.rotationSpeed;
        this.speed = other.speed;
        this.acceleration = other.acceleration;
    }

    snapTo(other: Physics) {
        this.x = other.x;
        this.y = other.y;
        this.rotation = other.rotation;
        this.rotationSpeed = other.rotationSpeed;
        this.speed = other.speed;
        this.acceleration = other.acceleration;
    }

    toString() : string {
        return `Physics(${this.x}, ${this.y}, ${this.rotation}, ${this.rotationSpeed}, ${this.speed}, ${this.acceleration})`;
    }
}

export function marshallPhysics(serialized: SerializedPhysics) : Physics {
    const marshalled = new Physics(serialized.x, serialized.y, serialized.rotation, serialized.max_speed);
    marshalled.rotationSpeed = serialized.rotationSpeed;
    marshalled.speed = serialized.speed;
    marshalled.acceleration = serialized.acceleration;
    return marshalled;
}