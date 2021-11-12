import { Scene } from 'phaser';

import logo from '../assets/game-logo.png';

export default class MenuScene extends Scene {
  constructor () {
    super('MenuScene');
  }

  preload () {
    this.load.image('game-logo', logo);
  }

  create () {
    this.logo = this.add.image(
      this.cameras.main.centerX, this.cameras.main.centerY, 'game-logo');
    this.logo.setPosition(
      this.cameras.main.centerX - this.logo.width / 2,
      this.cameras.main.centerY - this.logo.height / 2 - 50
    );
    this.logo.setScale(4);

    this.input.keyboard.on('keyup', () => {
      this.scene.start('MainScene');
    });
  }

  update () {
    this.logo.setPosition(
      this.cameras.main.centerX - this.logo.width / 2,
      this.cameras.main.centerY - this.logo.height / 2 - 50
    );
  }
}
