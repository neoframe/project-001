import { Scene } from 'phaser';

import Settings from './settings';
import logo from '../assets/logo.png';
import CRT from '../effects/crt.pipeline';

export default class IntroScene extends Scene {
  constructor () {
    super('IntroScene');
  }

  preload () {
    this.load.image('logo', logo);

    // Load settings into registry
    Settings.items.forEach(item => {
      const value = globalThis.localStorage.getItem(item.key);
      this.registry.set(item.key, value || item.default);
    });
  }

  create () {
    this.logo = this.add.image(
      this.cameras.main.centerX, this.cameras.main.centerY, 'logo'
    ).setOrigin(0.5).setAlpha(0);

    this.input.keyboard.on('keyup', () => {
      this.scene.start('MenuScene');
    });

    this.tweens.add({
      targets: [this.logo],
      alpha: 1,
      ease: 'Cubic.easeOut',
      duration: 3000,
      yoyo: true,
      repeat: 0,
    }).on('complete', () => {
      this.scene.start('MenuScene');
    });

    this.cameras.main.setPostPipeline(CRT);
  }

  update () {
    this.logo.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
  }
}
