export function unlockAudioContext(audioCtx: AudioContext) {
  if (audioCtx.state === 'suspended') {
    const events = ['touchstart', 'touchend', 'mousedown', 'keydown'];
    const unlock = function unlock() {
      events.forEach((event) => {
        document.body.removeEventListener(event, unlock);
      });
      audioCtx.resume();
    };

    events.forEach((event) => {
      document.body.addEventListener(event, unlock, false);
    });
  }
}

export class MyIterator<T> {
  arr: T[];

  subIndex = 0;

  constructor(arr: T[]) {
    this.arr = arr;
  }

  next() {
    return this.subIndex < this.arr.length
      ? { value: this.arr[this.subIndex++], done: false }
      : { done: true };
  }
}


export function arrayRemove(arr: any[], value: any) {
  return arr.filter((ele) => ele != value);
}


export interface PixiGraphicsIndexed extends PIXI.Graphics {
  _index?: number;
}

export interface PixiTextIndexed extends PIXI.Text {
  _index?: number;
}

export interface PixiContainerIndexed extends PIXI.Container {
  _index?: number;
}

export interface PixiSpriteIndexed extends PIXI.Sprite {
  _index?: number;
}

export interface PixiDisplayIndexed extends PIXI.DisplayObject {
  _index?: number;
}

export interface ConfigI {
  [index: string]: number;
}
