import { Scene, Math } from 'phaser';

import { DEBUG, ZOOM } from '../utils/settings';
import Player from '../objects/player';
import Dungeon from '../objects/dungeon';

export default class MainScene extends Scene {
  constructor () {
    super('MainScene');
  }

  preload () {
    this.player = new Player(this, 100, 100);
    this.dungeon = new Dungeon(this, this.player);
  }

  create () {
    this.physics.world.setBounds(0, 0, 2000, 2000);
    const worldRect = this.add.rectangle(0, 0, 2000, 2000, 0x42393A);
    worldRect.setOrigin(0, 0);

    // Generate lightning
    this.raycaster = this.raycasterPlugin.createRaycaster({});

    // Generate keys (arrows + space + enter)
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create player
    this.player.create();

    // Add camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(ZOOM);

    // Create walls & floors
    this.dungeon.create();

    // Set collisions between walls & light
    this.raycaster.mapGameObjects(this.dungeon.obstacles, true, {
      collisionTiles: Dungeon.LIGHT_BLOCKING_TILES,
    });
  }

  update () {
    this.player.update();
  }
}
