export class WebMidiService {
  ready: Promise<any>;

  midi?: WebMidi.MIDIAccess;

  output?: WebMidi.MIDIOutput;

  input?: WebMidi.MIDIInput;

  constructor() {
    const o = this;
    this.ready = new Promise<void>((resolve, reject) => {
      navigator.requestMIDIAccess().then((m) => {
        o.midi = m;
        resolve();
      }, (msg) => {
        reject(`Failed to get MIDI access - ${msg}`);
      });
    });
  }


  inOpen = (callback: Function) => {
    if (this.midi) {
      for (const i of this.midi.inputs.values()) {
        this.input = i;
        if (this.input) {
          this.input.onmidimessage = (e) => {
            callback(e);
          };
          break;
        }
      }
    }
  }

  outOpen = () => {
    if (this.midi) {
      for (const i of this.midi.outputs.values()) {
        this.output = i;
        if (this.output) {
          break;
        }
      }
    }
  }

  inClose = () => {
    if (this.input) {
      if (this.input && this.input) {
        this.input.onmidimessage = () => null;
      }
    }
  }

  out = (byte1: any, byte2: any, byte3: any) => {
    const o = this;
    if (o.output) {
      const data = [byte1, byte2];
      if (typeof byte3 === 'number') {
        data.push(byte3);
      }
      o.output.send(data);
    }
  }
}
