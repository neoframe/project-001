import { Input, Scene } from 'phaser';

import logo from '../assets/logo.png';

export default class IntroScene extends Scene {
  constructor () {
    super('IntroScene');
  }

  preload () {
    this.load.image('logo', logo);
  }

  create () {
    this.logo = this.add.image(
      this.cameras.main.centerX, this.cameras.main.centerY, 'logo'
    ).setOrigin(1, 0.5).setAlpha(0);

    this.input.keyboard.on('keyup', () => {
      this.scene.start('MainScene');
    });

    this.tweens.add({
      targets: [this.logo],
      alpha: 1,
      ease: 'Cubic.easeOut',
      duration: 3000,
      yoyo: true,
      repeat: 0,
    }).on('complete', () => {
      this.scene.start('MainScene');
    });
  }

  update () {
    this.logo.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
  }
}
