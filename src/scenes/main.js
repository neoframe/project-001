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

  getData (key, def) {
    return this.registry.get(key) ||
      JSON.parse(globalThis.localStorage.getItem(key)) ||
      def;
  }

  setKeysToFind () {
    const difficulty = this.getData('difficulty', 'normal');
    const level = this.getData('level', 1);

    let keys;

    switch (difficulty) {
      case 'easy': keys = 1; break;
      default: keys = level > 10 ? 2 : level > 20 ? 3 : 1;
    }

    this.registry.set('keysToFind', keys);
  }

  create () {
    this.setKeysToFind();

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

    // Create walls & floors
    this.dungeon.create();

    // Adjust lightning according to walls
    const bounds = [
      0, 0, this.dungeon.map.widthInPixels, this.dungeon.map.heightInPixels,
    ];
    this.physics.world.setBounds(...bounds);
    this.cameras.main.setBounds(...bounds);
    this.player.setFieldOfView(...bounds);
    this.raycaster.setBoundingBox(...bounds);

    // Add camera
    this.cameras.main.startFollow(this.player.centeredOrigin, true);
    this.cameras.main.setZoom(ZOOM);

    // Set collisions between walls & light
    this.raycaster.mapGameObjects(this.dungeon.obstacles, true, {
      collisionTiles: Dungeon.LIGHT_BLOCKING_TILES,
    });

    this.scene.launch('HUDScene');
  }

  update () {
    this.player.update();
  }
}
