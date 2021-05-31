/* eslint-disable */

import { Midi } from '@tonejs/midi';
import { PiecePlayer } from './PiecePlayer';
import { SheetNoteComponent } from './SheetNoteComponent';
import * as CONFIG from './constants';

export class AssetsLoaderService {
    engine: PIXI.Application;

    shared: any;

    resources: any = {};

    constructor(engine: PIXI.Application, shared: any) {
      this.engine = engine;
      this.shared = shared;
    }

    loadSceneMain() {
      const self = this;
      return new Promise((resolve, reject) => this.engine.loader
        .add('dis_piano', 'assets/dis_piano.png')
        .add('piano', 'assets/piano.png')
        .add('C', 'assets/C.png')
        .add('Cs', 'assets/Cs.png')
        .add('D', 'assets/D.png')
        .add('Ds', 'assets/Ds.png')
        .add('E', 'assets/E.png')
        .add('F', 'assets/F.png')
        .add('Fs', 'assets/Fs.png')
        .add('G', 'assets/G.png')
        .add('Gs', 'assets/Gs.png')
        .add('A', 'assets/A.png')
        .add('As', 'assets/As.png')
        .add('B', 'assets/B.png')
        .load((loader, res) => {
          self.resources = res;
          resolve(res);
        }));
    }

    loadPiece(name: string, player: PiecePlayer) {
      const self = this;
      return new Promise<void>((resolve, reject) => Midi.fromUrl(`songs/${name}`)
        .then((midi) => {
          const { name } = midi;
          const toWait: SheetNoteComponent[] = [];
          midi.tracks.filter((t, i) => i < CONFIG.MAX_TRACKS).forEach((track) => {
            // the track also has a channel and instrument
            // track.instrument.name
            // console.log(track.instrument.name);
            const { notes } = track;

            notes.forEach((note) => {
              // note.midi, note.time, note.duration, note.name
              const g = new SheetNoteComponent(note, self.engine, self.shared, player);
              toWait.push(g);
            });
          });
          toWait.sort((a, b) => {
            if (a.n.time > b.n.time) {
              return 1;
            }
            if (a.n.time < b.n.time) {
              return -1;
            }
            return 0;
          });
          player.addNotes(toWait);
          resolve();
        }));
    }
}
