import { Scene } from 'phaser';

import logo from '../assets/game-logo.png';

export default class MenuScene extends Scene {
  selected = 0;
  menuItems = [
    { text: 'play', action: () => { this.scene.start('MainScene'); } },
    { text: 'settings', action: () => { this.scene.start('SettingsScene'); } },
  ];

  constructor () {
    super('MenuScene');
  }

  preload () {
    this.load.image('game-logo', logo);
  }

  create () {
    const { centerX, centerY } = this.cameras.main;

    this.container = this.add.container(centerX, centerY);

    this.logo = this.add.image(0, 0, 'game-logo')
      .setOrigin(0.5)
      .setScale(4);

    this.content = [];

    this.menuItems.forEach((item, i) => {
      const text = this.add.text(0, 150 + (i * 50), item.text,
        { fontFamily: 'WayfarersToyBox', fontSize: 20, color: '#FFF' }
      ).setOrigin(0.5);
      this.content.push(text);
    });

    this.arrow = this.add.triangle(0, 50, 0, 30, 15, 10, 30, 30)
      .setScale(0.5).setRotation(1.57).setFillStyle(0xFFFFFF);

    this.container.add([this.logo, this.arrow, ...this.content]);

    this.input.keyboard.on('keyup-DOWN', () => {
      this.selected = this.selected < this.menuItems.length - 1
        ? this.selected + 1 : 0;
    });

    this.input.keyboard.on('keyup-UP', () => {
      this.selected = this.selected > 0
        ? this.selected - 1 : this.menuItems.length - 1;
    });

    this.input.keyboard.on('keyup-ENTER', () => {
      this.menuItems[this.selected].action();
    });
  }

  update () {
    const { centerX, centerY } = this.cameras.main;

    this.container.setPosition(centerX, centerY - 50);

    const selectedItem = this.content[this.selected];
    this.arrow.setPosition(
      selectedItem.x - (selectedItem.width / 2) - 20,
      selectedItem.y + 5
    );
  }
}
