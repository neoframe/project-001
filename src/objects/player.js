import { Display, GameObjects, Math, Physics } from 'phaser';

import {
  DEBUG,
  LIGHT_MODE,
  PLAYER_LIGHT_CONE_ANGLE,
  PLAYER_LIGHT_MAX_DISTANCE,
  PLAYER_SPEED,
} from '../utils/settings';
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
    this.body.setSize(16, 22);
    this.body.setOffset(8, 8);

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

    // Create the light ray using the scene raycaster
    this.ray = this.scene.raycaster.createRay();
    // The more the cone angle, the more the performances will be affected
    this.ray.setConeDeg(PLAYER_LIGHT_CONE_ANGLE);

    // This graphics represents the light (basically it's just an undefined
    // rectangle, for now)
    this.lightMask = this.scene.add
      .graphics({ fillStyle: { color: 0xffffff, alpha: 0 } });
    this.lightMask.setDepth(1);

    // This is the mask that will be used to cut the light into the ray's cone
    this.upperLightMask = new Display.Masks
      .GeometryMask(this.scene, this.lightMask);
    this.upperLightMask.setInvertAlpha(true);

    // This graphics represents the shadows (another undefined rectangle, black
    // this time)
    this.fov = this.scene.add.graphics({
      fillStyle: { color: 0x000000, alpha: DEBUG ? 0.2 : 0.85 },
    }).setDepth(2);
    this.fov.setMask(this.upperLightMask);
    this.fov.fillRect(0, 0,
      this.scene.physics.world.bounds.width,
      this.scene.physics.world.bounds.height);
    this.setDepth(3);

    // Add natural lights following the player
    this.scene.lights.enable();
    this.spotlight = this.scene.lights
      .addLight(0, 0, DEBUG ? 10000 : PLAYER_LIGHT_MAX_DISTANCE, 0xffffff, 1.5);
    this.setPipeline('Light2D');
    this.setTint(0x666666);
  }

  setFieldOfView (x, y, width, height) {
    this.fov.clear();
    this.fov.fillRect(x, y, width, height);
  }

  drawLightBeam () {
    // Update mouse pointer when cameras moves
    // This avoids keeping the mouse pointer to the same world position
    // when the player moves but not the mouse inside the viewport
    this.scene.input.activePointer.updateWorldPoint(this.scene.cameras.main);

    // Move the light ray beneath the player's body
    this.ray.setOrigin(
      this.body.x + this.body.width / 2,
      this.body.y + this.body.height / 2
    );

    // Set light angle according to mouse position inside the world
    this.ray.setAngle(Math.Angle.Between(
      this.x,
      this.y,
      this.scene.input.activePointer.worldX,
      this.scene.input.activePointer.worldY,
    ));

    // Gather all the objects that the ray collides with
    const intersections = LIGHT_MODE === 'circle'
      ? this.ray.castCircle()
      : this.ray.castCone();

    // In cone mode, we need to add the ray's origin to the intersections
    // to correctly close the mask shape, otherwise everything is fucked
    LIGHT_MODE !== 'circle' && intersections.push(this.ray.origin);

    // And then we redraw the light according to the new raycasting points
    this.lightMask.clear();
    this.lightMask.fillPoints(intersections);
    this.lightMask.setPipeline('Light2D');
  }

  update () {
    if (this.scene.cursors.left.isDown || this.scene.cursors.q.isDown) {
      this.setFlip(true);
      this.body.setVelocityX(-PLAYER_SPEED);
    } else if (this.scene.cursors.right.isDown || this.scene.cursors.d.isDown) {
      this.setFlip(false);
      this.body.setVelocityX(PLAYER_SPEED);
    } else {
      this.body.setVelocityX(0);
    }

    if (this.scene.cursors.up.isDown || this.scene.cursors.z.isDown) {
      this.body.setVelocityY(-PLAYER_SPEED);
    } else if (this.scene.cursors.down.isDown || this.scene.cursors.s.isDown) {
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

    this.spotlight.setPosition(this.x, this.y);
    this.drawLightBeam();
  }
}
