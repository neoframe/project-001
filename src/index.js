import { Game, Scale, AUTO } from 'phaser';

import { FPS } from './utils/settings';
import Main from './scenes/main';

import './index.css';

const _ = new Game({
  type: AUTO,
  backgroundColor: 0x222222,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: true,
      debugShowBody: true,
    },
  },
  // fps: {
  //   target: FPS,
  // },
  scale: {
    mode: Scale.RESIZE,
    autoCenter: Scale.CENTER_BOTH,
  },
  pixelArt: true,
  scene: [Main],
});
