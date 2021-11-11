import { GameObjects, Physics } from 'phaser';

import { PLAYER_SPEED } from '../utils/settings';
import heroIdleFront from '../assets/hero-idle-front.png';
import heroIdleBack from '../assets/hero-idle-back.png';
import heroIdleSide from '../assets/hero-idle-side.png';
import heroWalkFront from '../assets/hero-walk-front.png';
import heroWalkBack from '../assets/hero-walk-back.png';
import heroWalkSide from '../assets/hero-walk-side.png';

export default class Player extends GameObjects.Sprite {

  constructor (scene, ...args) {
    super(scene, ...args);

    scene.load.image('hero-idle-front', heroIdleFront);
    scene.load.image('hero-idle-back', heroIdleBack);
    scene.load.image('hero-idle-side', heroIdleSide);

    scene.load.spritesheet('hero-walk-front', heroWalkFront,
      { frameWidth: 32, frameHeight: 32 });
    scene.load.spritesheet('hero-walk-back', heroWalkBack,
      { frameWidth: 32, frameHeight: 32 });
    scene.load.spritesheet('hero-walk-side', heroWalkSide,
      { frameWidth: 32, frameHeight: 32 });
  }

  create () {
    this.setTexture('hero-idle-front');
    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);
    // this.body.setCollideWorldBounds(true);

    this.light = this.scene.lights.addLight(this.x, this.y, 100);

    this.scene.anims.create({
      key: 'walk-front',
      frames: this.scene.anims
        .generateFrameNumbers('hero-walk-front', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.anims.create({
      key: 'walk-back',
      frames: this.scene.anims
        .generateFrameNumbers('hero-walk-back', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.anims.create({
      key: 'walk-side',
      frames: this.scene.anims
        .generateFrameNumbers('hero-walk-side', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  update () {
    if (this.scene.cursors.left.isDown) {
      this.setFlip(true);
      this.body.setVelocityX(-PLAYER_SPEED);
    } else if (this.scene.cursors.right.isDown) {
      this.setFlip(false);
      this.body.setVelocityX(PLAYER_SPEED);
    } else {
      this.body.setVelocityX(0);
    }

    if (this.scene.cursors.up.isDown) {
      this.body.setVelocityY(-PLAYER_SPEED);
    } else if (this.scene.cursors.down.isDown) {
      this.body.setVelocityY(PLAYER_SPEED);
    } else {
      this.body.setVelocityY(0);
    }

    if (this.body.velocity.x !== 0) {
      this.anims.play('walk-side', true);
    } else if (this.body.velocity.y < 0) {
      this.anims.play('walk-back', true);
    } else if (this.body.velocity.y > 0) {
      this.anims.play('walk-front', true);
    }

    if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
      switch (this.body.facing) {
        case Physics.Arcade.FACING_LEFT:
        case Physics.Arcade.FACING_RIGHT:
          this.setTexture('hero-idle-side');
          break;
        case Physics.Arcade.FACING_UP:
          this.setTexture('hero-idle-back');
          break;
        default:
          this.setTexture('hero-idle-front');
      }
    }
  }
}
