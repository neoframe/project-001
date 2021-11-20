import { Game, Scale, AUTO } from 'phaser';
import Raycaster from 'phaser-raycaster';

import { DEBUG, FPS } from './utils/settings';
import CRT from './effects/crt.pipeline';
import Intro from './scenes/intro';
import Menu from './scenes/menu';
import Settings from './scenes/settings';
import Main from './scenes/main';
import HUD from './scenes/hud';
import GameOver from './scenes/game-over';
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
  fps: {
    target: FPS,
  },
  scale: {
    mode: Scale.RESIZE,
    autoCenter: Scale.CENTER_BOTH,
  },
  pixelArt: true,
  scene: [Intro, Menu, Settings, Main, HUD, GameOver],
  plugins: {
    scene: [
      { key: 'raycaster', plugin: Raycaster, mapping: 'raycasterPlugin' },
    ],
  },
  pipeline: { CRT },
});
