import { Controls } from './Controls';
import * as CONFIG from './constants';
import { SheetNoteComponent } from './SheetNoteComponent';
import { MyIterator } from './commons';

export class PiecePlayer {
    fromTime = 0;

    time = 0;

    isPaused = false;

    watch: any;

    updateInterval: number;

    byKey: any;

    isRunning = false;

    controls: Controls;

    toWait: SheetNoteComponent[] = [];

    toInit: SheetNoteComponent[] = [];

    toEnd: SheetNoteComponent[] = [];

    _autoResume = false;

    constructor(updateInterval: number, controls: Controls) {
      this.updateInterval = updateInterval || 100;
      this.isRunning = false;
      this.controls = controls;
    }

    addNotes(notes: SheetNoteComponent[]) {
      const self = this;
      this.toWait = notes;
      this.byKey = {};

      CONFIG.PIANO_KEYS.forEach((noteName) => {
        const filtered = notes.filter((k) => k.n.name === noteName);
        self.byKey[noteName] = {
          current: null,
          iterator: null,
        };
        if (filtered.length) {
          self.byKey[noteName].iterator = new MyIterator<SheetNoteComponent>(filtered);
          self.byKey[noteName].current = self.byKey[noteName].iterator.next();
          self.byKey[noteName].last = null;
        }
      });
      // console.log(this.byKey);
    }

    start() {
      this.isRunning = true;
      this.fromTime = new Date().getTime();
      this.watch = setInterval(() => this.update(), this.updateInterval);
    }

    pause() {
      this.isPaused = true;
      this.update();
      clearInterval(this.watch);
    }

    resume() {
      this.isPaused = false;
      this.fromTime = new Date().getTime();
      this.watch = setInterval(() => this.update(), this.updateInterval);
    }

    update() {
      if (!this.isPaused) {
        const now = new Date().getTime();
        this.time += (now - this.fromTime);
        this.fromTime = now;
      }
    }

    reset() {
      this.time = 0;
      this.isPaused = false;
      this.start();
    }

    playMidiTick() {
      const progress = this.time;
      const self = this;
      this.toWait.forEach((note, index, arr) => {
        if (progress > (note.n.time * 1000)) {
          note.draw();
          note.animate();
          self.toInit.push(note);
          arr.splice(index, 1);
        }
      });
      this.toInit.forEach((note, index, arr) => {
        const init = (note.n.time * 1000) + 5000;
        if (progress > init) {
          self.controls.noteOn(note.n.midi, note.n.velocity, false);
          self.toEnd.push(note);
          arr.splice(index, 1);
        }
      });
      this.toEnd.forEach((note, index, arr) => {
        const end = ((note.n.time * 1000) + 5000) + (note.n.duration * 1000);
        if (progress > end) {
          self.controls.noteOff(note.n.midi);
          arr.splice(index, 1);
        }
      });
      for (const key in this.byKey) {
        if (this.byKey.hasOwnProperty(key)) {
          const element = self.byKey[key];
          if (element.current && !element.current.done) {
            if (self.time > element.current.value.n.time * 1000 + 5000 + 301) {
              // console.log('nota perdida', key, self.time, element.current.value.n.time * 1000 + 5000);
              element.current.value.markAsMiss();
              element.last = element.current;
              element.current = element.iterator.next();
            }
          }
        }
      }
    }

    keyPress(name: string) {
      if (this.byKey.hasOwnProperty(name)) {
        if (!this.byKey[name].current || this.byKey[name].current.done) return;
        const val = this.byKey[name].current.value.n;
        const valTime = val.time * 1000 + 5000;
        if (valTime > this.time) {
          if (valTime < this.time + 150) {
            // console.log('nota correcta', name);
            this.byKey[name].current.value.markAsSuccess();
            this.byKey[name].current.value.sustainIn();
            this.byKey[name].last = this.byKey[name].current;
            this.byKey[name].current = this.byKey[name].iterator.next();
          } else if (valTime < this.time + 300) {
            // console.log('nota early', name);
            this.byKey[name].current.value.markAsEarly();
            this.byKey[name].current.value.sustainIn();
            this.byKey[name].last = this.byKey[name].current;
            this.byKey[name].current = this.byKey[name].iterator.next();
          }
          // console.log(valTime, this.time, 'a');
        } else if (valTime < this.time) {
          if (valTime > this.time - 150) {
            // console.log('nota correcta', name);
            this.byKey[name].current.value.markAsSuccess();
            this.byKey[name].current.value.sustainIn();
            this.byKey[name].last = this.byKey[name].current;
            this.byKey[name].current = this.byKey[name].iterator.next();
          } else if (valTime > this.time - 300) {
            // console.log('nota pasada', name);
            this.byKey[name].current.value.markAsLate();
            this.byKey[name].current.value.sustainIn();
            this.byKey[name].last = this.byKey[name].current;
            this.byKey[name].current = this.byKey[name].iterator.next();
          }
          // console.log(valTime, this.time, 'b');
        }
      }
    }

    keyOff(name: string) {
      if (this.byKey.hasOwnProperty(name)) {
        if (!this.byKey[name].last) return;
        this.byKey[name].last.value.sustainOut();
      }
    }

    get() {
      return this.time;
    }
}
