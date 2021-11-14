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
      default: keys = level >= 5 ? 2 : level >= 10 ? 3 : 1;
    }

    this.registry.set('keysToFind', keys);
  }

  setKeys (count = 0) {
    this.registry.set('keysFound', count);
  }

  nextLevel () {
    this.player.canMove = false;

    this.registry.set('level', this.getData('level', 1) + 1);

    const mask = this.add.rectangle(
      0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000
    ).setAlpha(0).setScrollFactor(0).setDepth(Infinity).setOrigin(0);

    this.tweens.add({
      targets: mask,
      duration: 500,
      alpha: 1,
      onComplete: () => {
        this.initLevel();
        this.tweens.add({
          targets: mask,
          duration: 500,
          alpha: 0,
          onComplete: () => {
            this.player.canMove = true;
            mask.destroy();
          },
        });
      },
    });
  }

  create () {
    this.registry.set('level', this.getData('level', 1));

    // Generate keys (arrows + space + enter + ZQSD)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors.z = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.Z);
    this.cursors.q = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.Q);
    this.cursors.s = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.S);
    this.cursors.d = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.D);

    // Create player
    this.player.create();
    this.player.events.on('findKey', () => {
      this.setKeys(this.getData('keysFound', 0) + 1);

      if (this.getData('keysFound', 0) >= this.getData('keysToFind')) {
        this.dungeon.openDoor();
      }
    });

    // Add camera
    this.cameras.main.startFollow(this.player.centeredOrigin, true);
    this.cameras.main.setZoom(ZOOM);

    this.initLevel();

    this.scene.launch('HUDScene');
  }

  update () {
    this.player.update();
  }

  initLevel () {
    this.setKeysToFind();
    this.setKeys();

    // Generate lightning
    delete this.raycaster;
    this.raycaster = this.raycasterPlugin.createRaycaster({});
    this.player.initLightning();

    // Create walls & floors
    this.dungeon?.destroy();
    this.dungeon.create();
    this.dungeon.events.once('nextLevel', () => this.nextLevel());

    // Adjust lightning according to walls
    const bounds = [
      0, 0, this.dungeon.map.widthInPixels, this.dungeon.map.heightInPixels,
    ];
    this.physics.world.setBounds(...bounds);
    this.cameras.main.setBounds(...bounds);
    this.player.setFieldOfView(...bounds);
    this.raycaster.setBoundingBox(...bounds);

    // Set collisions between walls & light
    this.raycaster.mapGameObjects(this.dungeon.obstacles, true, {
      collisionTiles: Dungeon.LIGHT_BLOCKING_TILES,
    });
  }
}
