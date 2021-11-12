import RandomDungeon from '@mikewesthad/dungeon';

import tileset from '../assets/tileset.png';
import { DEBUG } from '../utils/settings';

export default class Dungeon {
  static TILES = {
    TOP_LEFT_WALL: 24,
    TOP_RIGHT_WALL: 25,
    BOTTOM_RIGHT_WALL: 33,
    BOTTOM_LEFT_WALL: 32,
    TOP_UPPER_WALL: 17,
    TOP_WALL: [
      { index: 3, weight: 4 },
      { index: 4, weight: 1 },
      { index: 5, weight: 1 },
      { index: 6, weight: 1 },
    ],
    LEFT_WALL: 10,
    RIGHT_WALL: 8,
    BOTTOM_WALL: 1,
    GROUND: 37,
    FLOOR: [
      { index: 19, weight: 20 },
      { index: 20, weight: 1 },
      { index: 21, weight: 1 },
    ],
    DOOR: {
      TOP_LEFT: 16,
      TOP_RIGHT: 18,
      BOTTOM_RIGHT: 2,
      BOTTOM_LEFT: 0,
    },
  };

  static LIGHT_BLOCKING_TILES = [
    Dungeon.TILES.LEFT_WALL,
    Dungeon.TILES.RIGHT_WALL,
    Dungeon.TILES.BOTTOM_WALL,
    Dungeon.TILES.DOOR.TOP_LEFT,
    Dungeon.TILES.DOOR.TOP_RIGHT,
    Dungeon.TILES.DOOR.BOTTOM_LEFT,
    Dungeon.TILES.DOOR.BOTTOM_RIGHT,
    Dungeon.TILES.GROUND,
    Dungeon.TILES.TOP_LEFT_WALL,
    Dungeon.TILES.TOP_RIGHT_WALL,
    Dungeon.TILES.BOTTOM_RIGHT_WALL,
    Dungeon.TILES.BOTTOM_LEFT_WALL,
    Dungeon.TILES.TOP_UPPER_WALL,
  ]

  constructor (scene, player) {
    this.scene = scene;
    this.player = player;

    this.dungeon = new RandomDungeon({
      width: 50,
      height: 50,
      doorPadding: 2,
      rooms: {
        width: {
          min: 8,
          max: 20,
        },
        height: {
          min: 8,
          max: 20,
        },
        maxArea: 100,
        maxRooms: 20,
      },
    });

    if (DEBUG) {
      this.dungeon.drawToConsole();
    }

    this.scene.load.image('tileset', tileset);
  }

  create () {
    if (this.map) {
      this.map.destroy();
    }

    this.map = this.scene.make.tilemap({
      tileWidth: 32,
      tileHeight: 32,
      width: this.dungeon.width,
      height: this.dungeon.height,
    });

    const tileset = this.map
      .addTilesetImage('tileset', 'tileset', 32, 32, 0, 0);
    const floorLayer = this.map
      .createBlankLayer('floor', tileset)
      .setPipeline('Light2D')
      .fill(Dungeon.TILES.GROUND);
    const wallsLayer = this.map
      .createBlankLayer('walls', tileset)
      .setPipeline('Light2D');

    this.dungeon.rooms.forEach(room => {
      const { x, y, width, height, left, right, top, bottom } = room;

      // Add floor
      floorLayer.weightedRandomize(Dungeon.TILES.FLOOR, x, y, width, height);

      // Add walls
      wallsLayer
        .weightedRandomize(Dungeon.TILES.TOP_WALL, left, top, width, 1);
      wallsLayer
        .fill(Dungeon.TILES.BOTTOM_WALL, left + 1, bottom, width - 2, 1);
      wallsLayer.fill(Dungeon.TILES.LEFT_WALL, left, top, 1, height - 1);
      wallsLayer.fill(Dungeon.TILES.RIGHT_WALL, right, top, 1, height - 1);

      // Add wall corners
      wallsLayer.putTileAt(Dungeon.TILES.BOTTOM_LEFT_WALL, left, bottom);
      wallsLayer.putTileAt(Dungeon.TILES.BOTTOM_RIGHT_WALL, right, bottom);

      const doors = room.getDoorLocations();

      doors.forEach(door => {
        const { x: dx, y: dy } = door;
        const TILES = Dungeon.TILES.DOOR;

        // Removing a tile doesn't work with phaser-raycaster 0.9.4 as the tile
        // becomes null, replaced with tile type of -1 at door position
        // TODO: create an issue at https://github.com/wiserim/phaser-raycaster
        // and remove this workaround when fixed
        // wallsLayer.removeTileAt(x + dx, y + dy);
        wallsLayer.putTileAt(-1, x + dx, y + dy);

        if (dx === 0) {
          wallsLayer.putTileAt(TILES.TOP_RIGHT, x + dx, y + dy - 1);
          wallsLayer.putTileAt(TILES.BOTTOM_RIGHT, x + dx, y + dy + 1);
        } else if (dx === room.width - 1) {
          wallsLayer.putTileAt(TILES.TOP_LEFT, x + dx, y + dy - 1);
          wallsLayer.putTileAt(TILES.BOTTOM_LEFT, x + dx, y + dy + 1);
        } else if (dy === room.height - 1) {
          wallsLayer.putTileAt(TILES.BOTTOM_RIGHT, x + dx - 1, y + dy);
          wallsLayer.putTileAt(TILES.BOTTOM_LEFT, x + dx + 1, y + dy);
        }
      });
    });

    wallsLayer.setCollisionByExclusion([-1]);
    this.scene.physics.add.collider(this.player, wallsLayer);
    this.player.x = this.map.widthInPixels / 2;
    this.player.y = this.map.heightInPixels / 2;

    this.obstacles = [wallsLayer, floorLayer];
  }
}
