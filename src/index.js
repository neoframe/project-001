import { Game, Scale, AUTO } from 'phaser';
import Raycaster from 'phaser-raycaster';

import { DEBUG } from './utils/settings';
import Main from './scenes/main';
import './index.css';

const _ = new Game({
  type: AUTO,
  backgroundColor: 0x42393A,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      ...(DEBUG ? {
        debug: true,
        debugShowBody: true,
      } : {}),
    },
  },
  scale: {
    mode: Scale.RESIZE,
    autoCenter: Scale.CENTER_BOTH,
  },
  pixelArt: true,
  scene: [Main],
  plugins: {
    scene: [
      { key: 'raycaster', plugin: Raycaster, mapping: 'raycasterPlugin' },
    ],
  },
});
