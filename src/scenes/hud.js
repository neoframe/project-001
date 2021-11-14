import { Scene } from 'phaser';

import { FONT } from '../utils/settings';
import sprites from '../assets/hud.png';

export default class HUD extends Scene {
  constructor () {
    super('HUDScene');
  }

  preload () {
    this.load.spritesheet('hud', sprites, { frameWidth: 32, frameHeight: 32 });
  }

  getLevel () {
    return this.registry.get('level') || 1;
  }

  getKeysToFind () {
    return this.registry.get('keysToFind') || 1;
  }

  generateKeysToFind () {
    this.keysToFind?.destroy(true, true);
    delete this.keysToFind;

    this.keysToFind = this.add.group({
      key: 'hud',
      frame: 1,
      repeat: this.getKeysToFind(),
      maxSize: this.getKeysToFind(),
      setXY: {
        x: 20,
        y: this.level.y + this.level.height + 10,
        stepX: 30,
        stepY: 0,
      },
      setOrigin: {
        x: 0,
        y: 0,
      },
    });
  }

  getKeys () {
    return this.registry.get('keysFound') || 0;
  }

  create () {
    this.level = this.add
      .text(20, 20, 'level: ' + this.getLevel(), FONT);

    this.generateKeysToFind();

    this.registry.events.on('changedata-level', () => {
      this.level.setText('level: ' + this.getLevel());
    });

    this.registry.events.on('changedata-keysToFind', () => {
      this.generateKeysToFind();
    });

    this.registry.events.on('changedata-keysFound', () => {
      for (let i = 0; i < this.getKeys(); i++) {
        this.keysToFind?.children?.getArray()?.[i]?.setTexture('hud', 0);
      }
    });
  }
}
