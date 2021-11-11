import { Scene, Math } from 'phaser';

import { ZOOM } from '../utils/settings';
import Player from '../objects/player';

export default class MainScene extends Scene {
  walls = [];

  constructor () {
    super('MainScene');
  }

  preload () {
    this.player = new Player(this, 100, 100);
  }

  generateWalls () {
    // Randomly generate rectangles in the world
    for (let i = 0; i < 100; i++) {
      const x = Math.Between(0, this.physics.world.bounds.width);
      const y = Math.Between(0, this.physics.world.bounds.height);
      const w = Math.Between(50, 100);
      const h = Math.Between(50, 100);
      const rect = this.add.rectangle(
        x - this.physics.world.bounds.width / 2,
        y - this.physics.world.bounds.width / 2,
        w, h, 0x00FF00
      );
      this.physics.add.existing(rect);
      rect.body.immovable = true;
      this.walls.push(rect);
    }
  }

  create () {
    this.physics.world.setBounds(0, 0, 2000, 2000);
    this.add.rectangle(0, 0, 2000, 2000, 0x000000);

    this.generateWalls();

    // Generate keys (arrows + space + enter)
    this.cursors = this.input.keyboard.createCursorKeys();

    this.player.create();

    // Add physics to walls
    this.physics.add.collider(this.player, this.walls);

    // Add camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(ZOOM);
  }

  update () {
    this.player.update();
  }
}
