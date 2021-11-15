import { Events, GameObjects } from 'phaser';

export default class Collectible extends GameObjects.Sprite {
  static SIZES = {
    KEY: [16, 16],
  };

  static TILES = {
    KEY: 0,
  };

  events = new Events.EventEmitter();

  constructor (scene, player, type, x, y, ...args) {
    const tile = Collectible.TILES[type.toUpperCase()];
    super(scene, x, y, 'objects', tile, ...args);
    this.player = player;
    this.type = type;
  }

  create () {
    this.setDepth(1);
    this.setScale(0.8);
    this.setTexture('objects', Collectible.TILES[this.type.toUpperCase()]);

    // Fucking items are not being added to collisions when added from a
    // physics group, and I don't know why. So I have to add them one by
    // fucking one
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.scene.physics.add.overlap(this.player, this, () => {
      this.events.emit('collect', this);
    });

    this.body.setSize(...Collectible.SIZES[this.type.toUpperCase()]);
  }
}
