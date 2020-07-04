/* eslint-disable */

import * as PIXI from 'pixi.js';
import * as Tone from 'tone';
import { PiecePlayer } from './PiecePlayer';
import { LerpService } from './LerpService';
import {
  PixiGraphicsIndexed, PixiTextIndexed, PixiContainerIndexed, PixiDisplayIndexed,
} from './commons';

export class SheetNoteComponent {
  n: any;

  piecePlayer: PiecePlayer;

  ready = false;

  container: PixiContainerIndexed;

  label?: PixiTextIndexed;

  gNote?: PixiGraphicsIndexed;

  gNotePlus?: PixiGraphicsIndexed;

  gTail?: PixiGraphicsIndexed;

  gDuration?: PixiGraphicsIndexed;

  nameNote = '';

  octave = '';

  engine: PIXI.Application;

  shared: any;

  gSustain: any;

  sustainLerp: any;

  color?: number;

  constructor(note: any, engine: PIXI.Application, shared: any, piecePlayer: PiecePlayer) {
    this.engine = engine;
    this.shared = shared;
    this.n = note;
    this.piecePlayer = piecePlayer;
    this.container = new PIXI.Container();
  }

  draw() {
    const note = this.n.midi;
    const { octave } = this.n;
    this.nameNote = Tone.Frequency(note, 'midi').toNote();
    this.octave = `${octave - 1}`;

    if (this.shared.octavesContainer.hasOwnProperty(this.octave)) {
      this.ready = true;
      this.container.x = this.shared.notesSpritePool[this.nameNote.replace('#', 's')].x - 50;
      this.container.y = -800;


      // lerp basado en la reclacion
      // 1 segundo de recorrido = 55 pixeles
      this.gDuration = new PIXI.Graphics();
      this.gDuration.beginFill(0x0000ff);
      this.gDuration.drawRect(50, 195 - (55 * this.n.duration) - 5, 20, 55 * this.n.duration);
      this.gDuration.alpha = 0.5;
      this.gDuration.endFill();
      this.gDuration._index = 1;

      this.gTail = new PIXI.Graphics();
      this.gTail.beginFill(0x0000ff);
      this.gTail.arc(0, 0, 10, 0, Math.PI);
      this.gTail.rotation = Math.PI;
      this.gTail.alpha = 0.5;
      this.gTail.position.x = 60;
      this.gTail.position.y = 190 - (55 * this.n.duration);
      this.gTail._index = 1;

      this.gNote = new PIXI.Graphics();
      this.gNote.beginFill(0x0000ff);
      this.gNote.drawCircle(60, 185, 10);
      this.gNote.endFill();
      this.gNote._index = 4;


      this.gNotePlus = new PIXI.Graphics();
      this.gNotePlus.beginFill(0x0000ff);
      this.gNotePlus.drawCircle(60, 185, 14);
      this.gNotePlus.endFill();
      this.gNotePlus.alpha = 1; // 0.5;
      this.gNotePlus.visible = false;
      this.gNotePlus._index = 3;

      const noteName = this.nameNote.replace(octave, '');
      let fontSize = 15;
      if (noteName.length > 1) {
        fontSize = 13;
      }
      this.label = new PIXI.Text(noteName, {
        fontFamily: 'Arial', fontSize, fill: 0xffffff, align: 'center',
      });
      this.label.position.x = 60 - this.label.width / 2;
      this.label.position.y = 185 - this.label.height / 2;
      this.label._index = 99;

      this.container.addChild(this.gTail);
      this.container.addChild(this.gDuration);
      this.container.addChild(this.gNote);
      this.container.addChild(this.gNotePlus);
      this.container.addChild(this.label);
      this.container._index = 1;

      this.shared.octavesContainer[this.octave].container.addChild(this.container);

      this.zIndexCalc();
    }
  }

  animate() {
    if (this.ready) {
      this.stretchATransformation();
    }
  }

  stretchATransformation() {
    const stretch = new LerpService(this.container.y, -250, 0.11, this.piecePlayer.get());
    stretch.onUpdate = (val) => this.container.y = val;
    stretch.onComplete = () => this.stretchBTransformation();
    this.engine.ticker.add(() => stretch.update(this.piecePlayer.get()));
  }

  stretchBTransformation() {
    this.touch();
    const stretch = new LerpService(this.container.y, 2000, 0.11, this.piecePlayer.get());
    stretch.onUpdate = (val) => this.container.y = val;
    stretch.onComplete = (val) => this.hide();
    this.engine.ticker.add(() => stretch.update(this.piecePlayer.get()));
  }

  touch() {
    if (this.gNotePlus) {
      this.container.alpha = 1;
      this.gNotePlus.visible = true;
    }
  }

  hide() {
    this.container.visible = false;
  }

  zIndexCalc() {
    this.container.children.sort((a: PixiDisplayIndexed, b: PixiDisplayIndexed) => {
      if ((a._index || 0) > (b._index || 0)) return 1;
      if ((b._index || 0) > (a._index || 0)) return -1;
      return 0;
    });

    this.shared.octavesContainer[this.octave].container.children.sort((a: PixiDisplayIndexed, b: PixiDisplayIndexed) => {
      if ((a._index || 0) > (b._index || 0)) return 1;
      if ((b._index || 0) > (a._index || 0)) return -1;
      return 0;
    });
  }

  sustainIn() {
    const self = this;
    const stretch = new LerpService(0, 55 * this.n.duration, 0.11, this.piecePlayer.get());
    this.sustainLerp = stretch;

    stretch.onUpdate = function (val) {
      const _gSustain = new PIXI.Graphics() as PixiGraphicsIndexed;
      _gSustain.beginFill(self.color);
      _gSustain.drawRect(50, 195 - val - 5, 20, val);
      _gSustain.endFill();
      _gSustain._index = 2;

      if (self.gSustain) {
        self.container.removeChild(self.gSustain);
      }
      self.gSustain = _gSustain;
      self.container.addChild(self.gSustain);

      self.zIndexCalc();
    };

    this.engine.ticker.add(() => {
      stretch.update(self.piecePlayer.get());
    });
  }

  sustainOut() {
    if (this.sustainLerp) {
      this.sustainLerp.stop();
    }
  }

  markAsEarly() {
    if (!this.gNotePlus || !this.gNote || !this.label || this.color) {
      throw Error('not draw yet?');
    }
    const _gNote = new PIXI.Graphics() as PixiGraphicsIndexed;
    _gNote.beginFill(0xffff00);
    _gNote.drawCircle(60, 185, 10);
    _gNote.endFill();
    _gNote._index = 4;

    const _gNotePlus = new PIXI.Graphics() as PixiGraphicsIndexed;
    _gNotePlus.beginFill(0xffff00);
    _gNotePlus.drawCircle(60, 185, 14);
    _gNotePlus.endFill();
    _gNotePlus.alpha = this.gNotePlus.alpha;
    _gNotePlus.visible = this.gNotePlus.visible;
    _gNotePlus._index = 3;

    this.container.removeChild(this.gNote);
    this.container.removeChild(this.gNotePlus);

    this.gNote = _gNote;
    this.gNotePlus = _gNotePlus;

    this.container.addChild(this.gNote);
    this.container.addChild(this.gNotePlus);

    const noteName = this.nameNote.replace(this.n.octave, '');
    let fontSize = 15;
    if (noteName.length > 1) {
      fontSize = 13;
    }
    this.label.style = {
      fontFamily: 'Arial', fontSize, fill: 0x000000, align: 'center',
    };

    this.color = 0xffff00;
  }

  markAsSuccess() {
    if (!this.gNotePlus || !this.gNote || !this.label || this.color) {
      throw Error('not draw yet?');
    }
    const _gNote = new PIXI.Graphics() as PixiGraphicsIndexed;
    _gNote.beginFill(0x00ff00);
    _gNote.drawCircle(60, 185, 10);
    _gNote.endFill();
    _gNote._index = 4;

    const _gNotePlus = new PIXI.Graphics() as PixiGraphicsIndexed;
    _gNotePlus.beginFill(0x00ff00);
    _gNotePlus.drawCircle(60, 185, 14);
    _gNotePlus.endFill();
    _gNotePlus.alpha = this.gNotePlus.alpha;
    _gNotePlus.visible = this.gNotePlus.visible;
    _gNotePlus._index = 3;

    this.container.removeChild(this.gNote);
    this.container.removeChild(this.gNotePlus);

    this.gNote = _gNote;
    this.gNotePlus = _gNotePlus;

    this.container.addChild(this.gNote);
    this.container.addChild(this.gNotePlus);

    const noteName = this.nameNote.replace(this.n.octave, '');
    let fontSize = 15;
    if (noteName.length > 1) {
      fontSize = 13;
    }
    this.label.style = {
      fontFamily: 'Arial', fontSize, fill: 0x000000, align: 'center',
    };

    this.color = 0x00ff00;
  }

  markAsLate() {
    if (!this.gNotePlus || !this.gNote || !this.label || this.color) {
      throw Error('not draw yet?');
    }
    const _gNote = new PIXI.Graphics() as PixiGraphicsIndexed;
    _gNote.beginFill(0xffa500);
    _gNote.drawCircle(60, 185, 10);
    _gNote.endFill();
    _gNote._index = 4;

    const _gNotePlus = new PIXI.Graphics() as PixiGraphicsIndexed;
    _gNotePlus.beginFill(0xffa500);
    _gNotePlus.drawCircle(60, 185, 14);
    _gNotePlus.endFill();
    _gNotePlus.alpha = this.gNotePlus.alpha;
    _gNotePlus.visible = this.gNotePlus.visible;
    _gNotePlus._index = 3;

    this.container.removeChild(this.gNote);
    this.container.removeChild(this.gNotePlus);

    this.gNote = _gNote;
    this.gNotePlus = _gNotePlus;

    this.container.addChild(this.gNote);
    this.container.addChild(this.gNotePlus);

    const noteName = this.nameNote.replace(this.n.octave, '');
    let fontSize = 15;
    if (noteName.length > 1) {
      fontSize = 13;
    }
    this.label.style = {
      fontFamily: 'Arial', fontSize, fill: 0x000000, align: 'center',
    };

    this.color = 0xffa500;
  }

  markAsMiss() {
    if (!this.gNotePlus || !this.gNote || !this.label || this.color) {
      throw Error('not draw yet?');
    }
    const _gNote = new PIXI.Graphics() as PixiGraphicsIndexed;
    _gNote.beginFill(0xe74c3c);
    _gNote.drawCircle(60, 185, 10);
    _gNote.endFill();
    _gNote._index = 4;

    const _gNotePlus = new PIXI.Graphics() as PixiGraphicsIndexed;
    _gNotePlus.beginFill(0xe74c3c);
    _gNotePlus.drawCircle(60, 185, 14);
    _gNotePlus.endFill();
    _gNotePlus.alpha = this.gNotePlus.alpha;
    _gNotePlus.visible = this.gNotePlus.visible;
    _gNotePlus._index = 3;

    this.container.removeChild(this.gNote);
    this.container.removeChild(this.gNotePlus);

    this.gNote = _gNote;
    this.gNotePlus = _gNotePlus;

    this.container.addChild(this.gNote);
    this.container.addChild(this.gNotePlus);

    this.zIndexCalc();
  }


  getCountDown() {

  }

  sumPoint() {

  }
}
