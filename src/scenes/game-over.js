import { Scene } from 'phaser';

import gameOverLogo from '../assets/game-over.png';
import { FONT, ZOOM } from '../utils/settings';

export default class GameOver extends Scene {
  constructor () {
    super('GameOverScene');
  }

  preload () {
    this.load.image('game-over', gameOverLogo);
  }

  create () {
    this.container = this.add.container(
      this.cameras.main.centerX, this.cameras.main.centerY
    );

    // this.cameras.main.setZoom(ZOOM);

    const logo = this.add
      .image(0, 0, 'game-over').setOrigin(0.5).setScale(ZOOM * ZOOM);
    this.container.add(logo);

    const text = this.add
      .text(0, 100, 'retry', FONT)
      .setOrigin(0.5);
    this.container.add(text);

    const arrow = this.add
      .triangle(text.x - (text.width / 2) - 20, 105, 0, 30, 15, 10, 30, 30)
      .setScale(0.5)
      .setRotation(1.57)
      .setFillStyle(0xFFFFFF);
    this.container.add(arrow);

    this.input.keyboard.on('keyup-ENTER', () => {
      this.scene.start('IntroScene');
    });

    this.cameras.main.fadeIn(500);
  }

  update () {
    this.container.setPosition(
      this.cameras.main.centerX,
      this.cameras.main.centerY - this.container.height / 2
    );
  }
}
