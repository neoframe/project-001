import { Display, Events, GameObjects, Geom, Math as PMath } from 'phaser';

import {
  DEBUG,
  PLAYER_LIGHT_CONE_ANGLE,
  PLAYER_LIGHT_MAX_DISTANCE,
  PLAYER_SPEED,
} from '../utils/settings';
import charset from '../assets/charset.png';

export default class Player extends GameObjects.Sprite {
  static FRAMES = {
    IDLE: {
      FRONT: 1,
      BACK: 10,
      LEFT: 4,
      RIGHT: 7,
    },
    WALKING: {
      FRONT: [0, 1, 2],
      BACK: [9, 10, 11],
      LEFT: [3, 4, 5],
      RIGHT: [6, 7, 8],
    },
  };

  events = new Events.EventEmitter()
  pointerAngle = 0;
  ray = null;
  lightMask = null;
  upperLightMask = null;
  fov = null;
  spotlight = null;
  canMove = true;

  constructor (scene, ...args) {
    super(scene, ...args);

    scene.load
      .spritesheet('charset', charset, { frameWidth: 32, frameHeight: 48 });
  }

  getSetting (key) {
    return this.scene.registry.get(key);
  }

  create () {
    this.setTexture('charset', Player.FRAMES.IDLE.FRONT);
    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);
    this.setScale(0.75);
    this.body.setCollideWorldBounds(true);
    this.body.setSize(14, 25);
    this.body.setOffset(8, 20);

    this.centeredOrigin = new Geom.Point(this.x, this.y);

    this.scene.anims.create({
      key: 'walk-front',
      frames: this.anims.generateFrameNumbers('charset',
        { frames: Player.FRAMES.WALKING.FRONT }),
      frameRate: 6,
      repeat: -1,
    });

    this.scene.anims.create({
      key: 'walk-back',
      frames: this.anims.generateFrameNumbers('charset',
        { frames: Player.FRAMES.WALKING.BACK }),
      frameRate: 6,
      repeat: -1,
    });

    this.scene.anims.create({
      key: 'walk-left',
      frames: this.anims.generateFrameNumbers('charset',
        { frames: Player.FRAMES.WALKING.LEFT }),
      frameRate: 6,
      repeat: -1,
    });

    this.scene.anims.create({
      key: 'walk-right',
      frames: this.anims.generateFrameNumbers('charset',
        { frames: Player.FRAMES.WALKING.RIGHT }),
      frameRate: 6,
      repeat: -1,
    });
  }

  update () {
    this.move();
    this.determinePointerAngle();
    this.setDirection();
    this.spotlight.setPosition(this.x, this.y);
    this.drawLightBeam();
    this.centeredOrigin.setTo(this.x, this.y);
  }

  initLightning () {
    // Create the light ray using the scene raycaster
    this.ray?.destroy?.();
    this.ray = this.scene.raycaster.createRay();
    // The more the cone angle, the more the performances will be affected
    this.ray.setConeDeg(PLAYER_LIGHT_CONE_ANGLE);

    // This graphics represents the light (basically it's just an undefined
    // rectangle, for now)
    this.lightMask?.destroy();
    this.lightMask = this.scene.add
      .graphics({ fillStyle: { color: 0xffffff, alpha: 0 } });
    this.lightMask.setDepth(1);

    // This is the mask that will be used to cut the light into the ray's cone
    this.upperLightMask?.destroy();
    this.upperLightMask = new Display.Masks
      .GeometryMask(this.scene, this.lightMask);
    this.upperLightMask.setInvertAlpha(true);

    // Add natural lights following the player
    this.createSpotLight();

    // This graphics represents the shadows (another undefined rectangle, black
    // this time)
    this.fov?.destroy();
    this.fov = this.scene.add.graphics({
      fillStyle: { color: 0x000000, alpha: DEBUG ? 0.2 : 0.85 },
    }).setDepth(2);
    this.fov.setMask(this.upperLightMask);
    this.fov.fillRect(0, 0,
      this.scene.physics.world.bounds.width,
      this.scene.physics.world.bounds.height);

    this.setDepth(4);
  }

  createSpotLight () {
    const difficulty = this.getSetting('difficulty');

    this.scene.lights.enable();

    this.scene.lights.removeLight(this.spotlight);
    this.spotlight = this.scene.lights.addLight(
      0, 0,
      DEBUG
        ? 10000
        : PLAYER_LIGHT_MAX_DISTANCE * (difficulty === 'easy' ? 2 : 1),
      0xffffff, 1.5
    );
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
    this.ray.setAngle(this.pointerAngle);

    // Gather all the objects that the ray collides with
    const difficulty = this.getSetting('difficulty');
    const lightMode = difficulty === 'easy' ? 'circle' : 'cone';
    const intersections = lightMode === 'circle'
      ? this.ray.castCircle()
      : this.ray.castCone();

    // In cone mode, we need to add the ray's origin to the intersections
    // to correctly close the mask shape, otherwise everything is fucked
    lightMode !== 'circle' && intersections.push(this.ray.origin);

    // And then we redraw the light according to the new raycasting points
    this.lightMask.clear();
    this.lightMask.fillPoints(intersections);
    this.lightMask.setPipeline('Light2D');
  }

  move () {
    if (!this.canMove) {
      this.body.setVelocityX(0);
      this.body.setVelocityY(0);

      return;
    }

    if (this.scene.cursors.left.isDown || this.scene.cursors.q.isDown) {
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
  }

  determinePointerAngle () {
    this.pointerAngle = PMath.Angle.Between(
      this.x,
      this.y,
      this.scene.input.activePointer.worldX,
      this.scene.input.activePointer.worldY,
    );
    this.pointerAngleDeg = Math.round(PMath.RadToDeg(this.pointerAngle));
  }

  isMoving () {
    return this.body.velocity.x !== 0 || this.body.velocity.y !== 0;
  }

  setDirection () {
    if (this.pointerAngleDeg >= -45 && this.pointerAngleDeg <= 45) {
      if (this.isMoving()) {
        this.anims.play('walk-right', true);
      } else {
        this.setFrame(Player.FRAMES.IDLE.RIGHT);
      }
    } else if (this.pointerAngleDeg >= 45 && this.pointerAngleDeg <= 135) {
      if (this.isMoving()) {
        this.anims.play('walk-front', true);
      } else {
        this.setFrame(Player.FRAMES.IDLE.FRONT);
      }
    } else if (
      (this.pointerAngleDeg >= 135 && this.pointerAngleDeg <= 180) ||
      (this.pointerAngleDeg >= -180 && this.pointerAngleDeg <= -135)
    ) {
      if (this.isMoving()) {
        this.anims.play('walk-left', true);
      } else {
        this.setFrame(Player.FRAMES.IDLE.LEFT);
      }
    } else if (this.pointerAngleDeg >= -135 && this.pointerAngleDeg <= -45) {
      if (this.isMoving()) {
        this.anims.play('walk-back', true);
      } else {
        this.setFrame(Player.FRAMES.IDLE.BACK);
      }
    }
  }

  findKey () {
    this.events.emit('findKey');
  }
}
