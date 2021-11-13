import { Scene } from 'phaser';

import { ZOOM } from '../utils/settings';
import Dungeon from '../objects/dungeon';
import logo from '../assets/game-logo.png';
import tileset from '../assets/tileset.png';

export default class MenuScene extends Scene {
  selected = 0;
  menuItems = [
    { text: 'play', action: () => this.scene.start('MainScene') },
    { text: 'settings', action: () => this.scene.start('SettingsScene') },
  ];

  constructor () {
    super('MenuScene');
  }

  preload () {
    this.load.image('game-logo', logo);
    this.load.image('tileset', tileset);
  }

  generateBackground () {
    const { x, y, width, height } = this.cameras.main;
    const size = 32 * ZOOM;

    const map = this.add
      .tilemap(null, size, size, width / size, height / size);

    const tileset = map.addTilesetImage('tileset', 'tileset', 32, 32, 0, 0);

    this.background = map
      .createBlankLayer(
        'background', tileset, x, y, map.width, map.height, size, size
      )
      .fill(Dungeon.TILES.GROUND)
      .setOrigin(0)
      .setDepth(1)
      .setAlpha(0.3);

    for (let x = 0; x < map.width; x++) {
      for (let y = 0; y < map.height; y++) {
        this.background.weightedRandomize(Dungeon.TILES.FLOOR, x, y);
      }
    }
  }

  create () {
    const { centerX, centerY } = this.cameras.main;

    this.container = this.add.container(centerX, centerY).setDepth(2);

    this.generateBackground();

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
    const { x, y, centerX, centerY } = this.cameras.main;

    this.container.setPosition(centerX, centerY - 50);

    const selectedItem = this.content[this.selected];
    this.arrow.setPosition(
      selectedItem.x - (selectedItem.width / 2) - 20,
      selectedItem.y + 5
    );

    this.background.setPosition(x, y);
  }
}
