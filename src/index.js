import { Game, Scale, AUTO } from 'phaser';
import Raycaster from 'phaser-raycaster';

import { DEBUG } from './utils/settings';
import Intro from './scenes/intro';
import Menu from './scenes/menu';
import Main from './scenes/main';
import './index.css';

const _ = new Game({
  type: AUTO,
  backgroundColor: 0x000000,
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
  scene: [Intro, Menu, Main],
  plugins: {
    scene: [
      { key: 'raycaster', plugin: Raycaster, mapping: 'raycasterPlugin' },
    ],
  },
});
