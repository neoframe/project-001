import { Scene, Input } from 'phaser';

import { ZOOM } from '../utils/settings';
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

    // Generate keys (arrows + space + enter + ZQSD)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors.z = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.Z);
    this.cursors.q = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.Q);
    this.cursors.s = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.S);
    this.cursors.d = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.D);

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
