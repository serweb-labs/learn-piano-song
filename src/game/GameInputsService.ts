import * as Tone from 'tone';
import { PiecePlayer } from './PiecePlayer';
import { WebMidiService } from './WebMidiService';
import { Controls } from './Controls';

export class GameInputsService {
    midi: WebMidiService;

    player: PiecePlayer;

    controls: Controls;

    constructor(midi: WebMidiService, player: PiecePlayer, controls: Controls) {
      this.midi = midi;
      this.player = player;
      this.controls = controls;
    }

    init() {
      const self = this;
      // midi
      this.midi.inOpen((message: any) => {
        const command = message.data[0];
        const note = message.data[1];
        let velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command
        velocity *= 0.5;
        switch (command) {
          case 144:
            if (velocity > 0) {
              self.controls.noteOn(note, velocity, true);
              self.player.keyPress(Tone.Frequency(note, 'midi').toNote());
            } else {
              self.controls.noteOff(note);
              self.player.keyOff(Tone.Frequency(note, 'midi').toNote());
            }
            break;
          case 128:
            self.controls.noteOff(note);
            self.player.keyOff(Tone.Frequency(note, 'midi').toNote());
            break;
        }
      });

      // keys
      document.body.onkeyup = function (e) {
        if (e.keyCode == 32) {
          if (!self.player.isRunning) {
            self.player.start();
          } else if (self.player.isPaused) {
            self.player.resume();
          } else {
            self.player.pause();
          }
        }
      };
    }
}
