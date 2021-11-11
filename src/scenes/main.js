import { Scene, Math, Geom } from 'phaser';

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
      const rect = this.add.rectangle(x, y, w, h, 0x00FF00);
      rect.setDepth(10);
      rect.setOrigin(0, 0);
      this.physics.add.existing(rect);
      rect.body.immovable = true;
      this.walls.push(rect);
    }
  }

  create () {
    this.physics.world.setBounds(0, 0, 2000, 2000);
    const worldRect = this.add.rectangle(0, 0, 2000, 2000, 0xcccccc);
    worldRect.setOrigin(0, 0);

    this.generateWalls();

    // Generate lightning
    this.raycaster = this.raycasterPlugin.createRaycaster({
      objects: this.walls,
    });

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
