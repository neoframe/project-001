import { Display, GameObjects, Math, Physics } from 'phaser';

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
    this.body.setCollideWorldBounds(true);

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

    // Manage lightning
    this.ray = this.scene.raycaster.createRay();
    this.ray.autoSlice = true;
    this.ray.setConeDeg(45);

    // Light masks
    this.lightMask = this.scene.add
      .graphics({ fillStyle: { color: 0xffffff, alpha: 0 } });
    this.lightMask.setDepth(1);
    this.upperLightMask = new Display.Masks
      .GeometryMask(this.scene, this.lightMask);
    this.upperLightMask.setInvertAlpha(true);
    this.fov = this.scene.add
      .graphics({ fillStyle: { color: 0x000000, alpha: 0.9 } }).setDepth(2);
    this.fov.setMask(this.upperLightMask);
    this.fov.fillRect(0, 0,
      this.scene.physics.world.bounds.width,
      this.scene.physics.world.bounds.height);
    this.setDepth(3);
  }

  drawLight () {
    this.scene.input.activePointer.updateWorldPoint(this.scene.cameras.main);
    this.ray.setOrigin(this.x, this.y);
    this.ray.setAngle(Math.Angle.Between(
      this.x,
      this.y,
      this.scene.input.activePointer.worldX,
      this.scene.input.activePointer.worldY,
    ));
    const intersections = this.ray.castCone();
    intersections.push(this.ray.origin);
    this.lightMask.clear();
    this.lightMask.fillPoints(intersections);
  }

  update () {
    this.drawLight();

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
