import * as PIXI from 'pixi.js';
import * as Tone from 'tone';

import { AssetsLoaderService } from './AssetsLoaderService';
import * as CONFIG from './constants';
import { Controls } from './Controls';
import { GameInputsService } from './GameInputsService';
import { PiecePlayer } from './PiecePlayer';
import { WebMidiService } from './WebMidiService';
import {
  unlockAudioContext,
  PixiSpriteIndexed,
  MyIterator,
  ConfigI,
} from './commons';
import { TWEEN } from './tween';
import { SampleLibrary } from '../sound/Tonejs-Instruments';

export class Game {
    engine: PIXI.Application;

    audioCtx: AudioContext;

    shared: any;

    player: PiecePlayer;

    inputs: GameInputsService;

    midi: WebMidiService;

    assets: AssetsLoaderService;

    controls: Controls;

    constructor() {
      this.shared = {
        instruments: null,
        octavesContainer: [],
        notesSpritePool: {},
      };

      this.audioCtx = new window.AudioContext();
      this.engine = new PIXI.Application({ width: 1870, height: 800 });
      this.controls = new Controls(this.shared);
      this.player = new PiecePlayer(16.67, this.controls);
      this.midi = new WebMidiService();
      this.inputs = new GameInputsService(this.midi, this.player, this.controls);
      this.assets = new AssetsLoaderService(this.engine, this.shared);
    }


    async init() {
      unlockAudioContext(this.audioCtx);

      const type = PIXI.utils.isWebGLSupported() ? 'WebGL' : 'canvas';

      PIXI.utils.sayHello(type);

      window.document.body.appendChild(this.engine.view);

      // note line
      const graphics = new PIXI.Graphics();
      graphics.beginFill(0xe74c3c);
      graphics.drawRect(10, 550, 1850, 5);
      graphics.endFill();
      this.engine.stage.addChild(graphics);

      // load assets
      await this.assets.loadSceneMain();
      this.loadinstrument();
      await this.assets.loadPiece(CONFIG.PIECE_NAME, this.player);

      // draw
      this.initScene();
      this.inputs.init();
      this.autoPauseInit();

      // init game loop
      this.gameLoop(0);
    }

    gameLoop(ts: number) {
      window.requestAnimationFrame(this.gameLoop.bind(this));

      if (!this.player.isPaused) {
        this.player.playMidiTick();
      }

      TWEEN.update(ts);
    }

    initScene() {
      const posX: ConfigI = {
        1: 50,
        2: 302,
        3: 554,
        4: 806,
        5: 1058,
        6: 1310,
        7: 1562,
      };

      for (const val of CONFIG.PIANO_OCTAVES) {
        let piano = null;
        if (CONFIG.PIANO_OCTAVES_ENABLED.includes(val)) {
          piano = new PIXI.Sprite(this.assets.resources.piano.texture) as PixiSpriteIndexed;
        } else {
          piano = new PIXI.Sprite(this.assets.resources.dis_piano.texture) as PixiSpriteIndexed;
        }
        piano.width *= 0.5;
        piano.height *= 0.5;

        // Setup the position of the piano
        piano.x = 0;
        piano.y = 0;

        // Rotate around the center
        piano.anchor.x = 0;
        piano.anchor.y = 0;
        piano._index = 200;

        const container = new PIXI.Container();

        this.shared.octavesContainer.push({
          name: val,
          container,
        });

        container.x = posX[val];
        container.y = this.engine.renderer.height - piano.height;

        container.addChild(piano);

        this.engine.stage.addChild(container);
      }

      this.drawOctaveKey(new MyIterator<any>(this.shared.octavesContainer));
    }

    drawNote(it: MyIterator<string>, o: any, octIt: MyIterator<any>) {
      const cursor = it.next();
      if (cursor.done || cursor.value === undefined) {
        this.drawOctaveKey(octIt);
        return;
      }

      const val: string = cursor.value;

      const posX: ConfigI = {
        C: 2,
        Cs: 24,
        D: 38,
        Ds: 66,
        Fs: 129,
        E: 74,
        F: 110,
        G: 146,
        Gs: 171,
        A: 182,
        As: 212,
        B: 218,
      };

      const posY: ConfigI = {
        C: 0,
        Cs: 0,
        D: 0,
        Ds: 0,
        E: 0,
        F: 0,
        Fs: 0,
        G: 0,
        Gs: 0,
        A: 0,
        As: 0,
        B: 0,
      };

      const note = new PIXI.Sprite(this.assets.resources[val].texture) as PixiSpriteIndexed;
      note.width *= 0.5;
      note.height *= 0.5;
      note.visible = false;

      // Setup the position of the note
      note.x = posX[val];
      note.y = 0 + posY[val];

      // Rotate around the center
      note.anchor.x = 0;
      note.anchor.y = 0;
      note._index = 200;

      // Add the note to the scene we are building
      o.container.addChild(note);
      this.shared.notesSpritePool[val + o.name] = note;

      this.drawNote(it, o, octIt);
    }

    drawOctaveKey(octIt: MyIterator<any>) {
      const currentOctave = octIt.next();
      if (!currentOctave.done) {
        const noteIt = new MyIterator<string>(CONFIG.NOTES);
        this.drawNote(noteIt, currentOctave.value, octIt);
      }
    }

    loadinstrument() {
      const self = this;

      self.shared.instruments = SampleLibrary.load({
        instruments: ['piano'],
      });

      Tone.Buffer.loaded().then((data) => {
        // console.log('sounds loaded')
        for (const property in self.shared.instruments) {
          if (self.shared.instruments.hasOwnProperty(property)) {
            self.shared.instruments[property].release = 0.5;
            self.shared.instruments[property].volume.value = -5;
            self.shared.instruments[property].toMaster();
          }
        }
      });
    }

    autoPauseInit() {
      const self = this;
      document.addEventListener('visibilitychange', (ev) => {
        // console.log(`Tab state : ${document.visibilityState}`);
        if (document.visibilityState === 'hidden') {
          if (self.player.isRunning && !self.player.isPaused) {
            self.player.pause();
            self.player._autoResume = true;
          }
        } else if (document.visibilityState === 'visible') {
          if (self.player.isRunning && self.player.isPaused && self.player._autoResume) {
            self.player.resume();
            self.player._autoResume = false;
          }
        }
      });
    }
}
