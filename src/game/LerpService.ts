/* eslint-disable */

export class LerpService {
    from: number;

    to: number;

    time: number;

    step: number;

    fn: Function;

    complete: boolean;

    finished: boolean;

    constructor(from: number, to: number, step: number, time: number) {
      this.from = from * 1;
      this.to = to * 1;
      this.time = time;
      this.complete = false;
      this.finished = false;
      this.step = step;
      this.fn = Math.min;
    }

    onComplete(val: number) {}

    onUpdate(val: number) {}

    check(val: number) {
      if (this.to > this.from) {
        this.fn = Math.min;
        this.check = function (val) {
          if (val >= this.to) {
            this.complete = true;
            if (this.onComplete) this.onComplete(val);
          }
        };
      } else {
        this.fn = Math.max;
        this.check = function (val) {
          if (val <= this.to) {
            this.complete = true;
            if (this.onComplete) this.onComplete(val);
          }
        };
      }
    }

    update(time: number) {
      if (this.complete) return;
      if (this.finished) return;
      const input = time - this.time;
      const _v = input * this.step;
      const val = this.fn(this.to, this.from + _v);
      this.onUpdate(val);
      this.check(val);
    }

    stop() {
      this.finished = true;
    }
}
