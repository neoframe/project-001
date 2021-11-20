import { Renderer } from 'phaser';

import fragShader from './crt.glsl';

export default class CRT extends Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor (game) {
    super({
      game,
      renderTarget: true,
      fragShader,
      uniforms: [
        'uProjectionMatrix',
        'uMainSampler',
        'uTime',
        'uResolution',
      ],
    });
  }

  onPreRender () {
    this.set1f('uTime', this.game.loop.time / 1000);
  }

  onBoot () {
    this.set2f('uResolution', this.renderer.width, this.renderer.height);
  }
}
