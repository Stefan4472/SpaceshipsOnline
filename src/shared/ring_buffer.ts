/* Simple iterable ring buffer with fixed capacity */
export class RingBuffer<T> {
    private readonly capacity: number;
    private readonly array: Array<any>;
    private length: number = 0;
    private startIndex: number = 0;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.array = new Array<any>(this.capacity);
    }

    len() : number {
        return this.length;
    }

    empty() : boolean {
        return this.length === 0;
    }

    full() : boolean {
        return this.length === this.capacity;
    }

    at(index: number) : T {
        if (index >= this.length) {
            throw new Error();
        }
        return this.array[(this.startIndex+index) % this.capacity];
    }

    first() : T {
        if (this.length === 0) {
            throw new Error();
        }
        return this.at(0);
    }

    last() : T {
        if (this.length === 0) {
            throw new Error();
        }
        return this.at(this.length-1);
    }

    pop() : T {
        if (this.length === 0) {
            throw new Error();
        }
        const res = this.array[this.startIndex];
        this.startIndex = (this.startIndex+1) % this.capacity;
        this.length -= 1;
        return res;
    }

    push(val: T) {
        if (this.length === this.capacity) {
            throw new Error();
        }
        this.array[(this.startIndex+this.length) % this.capacity] = val;
        this.length += 1;
    }
}