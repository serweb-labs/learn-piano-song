
import * as Tone from 'tone';

export class Controls {
    shared: any;

    constructor(shared: any) {
      this.shared = shared;
    }

    noteOn(note: string, velocity: number, act = true) {
      const nameNote = Tone.Frequency(note, 'midi').toNote();
      console.log('on', nameNote, velocity);
      this.shared.instruments.piano.triggerAttack(nameNote, undefined, velocity);
      if (act) this.shared.notesSpritePool[nameNote.replace('#', 's')].visible = true;
    }

    noteOff(note: string) {
      const nameNote = Tone.Frequency(note, 'midi').toNote();
      // console.log('off', nameNote);
      this.shared.instruments.piano.triggerRelease(nameNote);
      this.shared.notesSpritePool[nameNote.replace('#', 's')].visible = false;
    }
}
