import RandomDungeon from '@mikewesthad/dungeon';

import tileset from '../assets/tileset.png';
import { DEBUG } from '../utils/settings';

export default class Dungeon {
  static TILES = {
    TOP_LEFT_WALL: 8,
    TOP_RIGHT_WALL: 9,
    BOTTOM_LEFT_WALL: 12,
    BOTTOM_RIGHT_WALL: 13,
    TOP_WALL: [
      { index: 32, weight: 1 },
      { index: 33, weight: 1 },
    ],
    LEFT_WALL: [
      { index: 43, weight: 20 },
      { index: 42, weight: 10 },
      { index: 41, weight: 1 },
      { index: 40, weight: 1 },
    ],
    RIGHT_WALL: [
      { index: 43, weight: 20 },
      { index: 42, weight: 10 },
      { index: 41, weight: 1 },
      { index: 40, weight: 1 },
    ],
    BOTTOM_WALL: [
      { index: 45, weight: 10 },
      { index: 44, weight: 20 },
      { index: 37, weight: 1 },
      { index: 36, weight: 1 },
    ],
    GROUND: 46,
    FLOOR: [
      { index: 2, weight: 100 },
      { index: 0, weight: 1 },
      { index: 1, weight: 1 },
      { index: 3, weight: 1 },
      { index: 4, weight: 1 },
      { index: 5, weight: 1 },
      { index: 6, weight: 1 },
      { index: 7, weight: 1 },
    ],
    DOOR: {
      TOP_LEFT: 32,
      TOP_RIGHT: 33,
      BOTTOM_LEFT: 8,
      BOTTOM_RIGHT: 9,
    },
  };

  static LIGHT_BLOCKING_TILES = [
    ...Dungeon.TILES.LEFT_WALL.map(t => t.index),
    ...Dungeon.TILES.RIGHT_WALL.map(t => t.index),
    ...Dungeon.TILES.BOTTOM_WALL.map(t => t.index),
    Dungeon.TILES.DOOR.BOTTOM_LEFT,
    Dungeon.TILES.DOOR.BOTTOM_RIGHT,
    Dungeon.TILES.GROUND,
    Dungeon.TILES.TOP_LEFT_WALL,
    Dungeon.TILES.TOP_RIGHT_WALL,
    Dungeon.TILES.BOTTOM_RIGHT_WALL,
    Dungeon.TILES.BOTTOM_LEFT_WALL,
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

  drawTile (layer, tile, x, y, w, h) {
    if (Array.isArray(tile)) {
      layer.weightedRandomize(tile, x, y, w, h);
    } else if (w && h) {
      layer.fill(tile, x, y, w, h);
    } else {
      layer.putTileAt(tile, x, y);
    }
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
      this.drawTile(floorLayer, Dungeon.TILES.FLOOR, x, y, width, height);

      // Add walls
      this.drawTile(wallsLayer,
        Dungeon.TILES.TOP_WALL, left, top, width, 1);
      this.drawTile(wallsLayer,
        Dungeon.TILES.BOTTOM_WALL, left + 1, bottom, width - 2, 1);
      this.drawTile(wallsLayer,
        Dungeon.TILES.LEFT_WALL, left, top, 1, height - 1);
      this.drawTile(wallsLayer,
        Dungeon.TILES.RIGHT_WALL, right, top, 1, height - 1);

      // Add wall corners
      this.drawTile(wallsLayer, Dungeon.TILES.BOTTOM_LEFT_WALL, left, bottom);
      this.drawTile(wallsLayer, Dungeon.TILES.BOTTOM_RIGHT_WALL, right, bottom);

      const doors = room.getDoorLocations();

      doors.forEach(door => {
        const { x: dx, y: dy } = door;
        const TILES = Dungeon.TILES.DOOR;

        // Removing a tile doesn't work with phaser-raycaster 0.9.4 as the tile
        // becomes null, replaced with tile type of -1 at door position
        // TODO: create an issue at https://github.com/wiserim/phaser-raycaster
        // and remove this workaround when fixed
        // wallsLayer.removeTileAt(x + dx, y + dy);
        this.drawTile(wallsLayer, -1, x + dx, y + dy);

        if (dx === 0) {
          this.drawTile(wallsLayer, TILES.TOP_RIGHT, x + dx, y + dy - 1);
          this.drawTile(wallsLayer, TILES.BOTTOM_RIGHT, x + dx, y + dy + 1);
        } else if (dx === room.width - 1) {
          this.drawTile(wallsLayer, TILES.TOP_LEFT, x + dx, y + dy - 1);
          this.drawTile(wallsLayer, TILES.BOTTOM_LEFT, x + dx, y + dy + 1);
        } else if (dy === room.height - 1) {
          this.drawTile(wallsLayer, TILES.BOTTOM_RIGHT, x + dx - 1, y + dy);
          this.drawTile(wallsLayer, TILES.BOTTOM_LEFT, x + dx + 1, y + dy);
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
