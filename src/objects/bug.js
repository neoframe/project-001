import { PLAYER_SPEED } from '../utils/settings';

export default class Bug {
  constructor (scene, player, time, type) {
    this.scene = scene.scene;

    this.body = player.body;
    this.time = time;
    this.type = type;
  }

  start () {
    this.tempPlayer = this.player;

    switch (this.type) {
      case 'random-controls':
        return this.randomizeControls();
    }

    this.scene.time.addEvent({
      delay: 10000,
      callback: () => this.stop(),
    });
  }

  stop () {
    this.player = this.tempPlayer;
  }

  randomizeControls () {
    let randoms = [
      { method: this.body.setVelocityX, speedCoeff: 1 },
      { method: this.body.setVelocityX, speedCoeff: -1 },
      { method: this.body.setVelocityY, speedCoeff: 1 },
      { method: this.body.setVelocityY, speedCoeff: -1 },
    ];

    randoms = randoms.sort(() => Math.random() - 0.5);

    const [leftControl, rightControl, upControl, downControl] = randoms;

    if (this.scene.cursors.left.isDown || this.scene.cursors.q.isDown) {
      leftControl.method(leftControl.speedCoeff * PLAYER_SPEED);
    } else if (this.scene.cursors.right.isDown || this.scene.cursors.d.isDown) {
      rightControl.method(rightControl.speedCoeff * PLAYER_SPEED);
    }

    if (this.scene.cursors.up.isDown || this.scene.cursors.z.isDown) {
      upControl.method(upControl.speedCoeff * PLAYER_SPEED);
    } else if (this.scene.cursors.down.isDown || this.scene.cursors.s.isDown) {
      downControl.method(downControl.speedCoeff * PLAYER_SPEED);
    }
  }
}
