import { Scene } from 'phaser';

import { FONT } from '../utils/settings';
import CRT from '../effects/crt.pipeline';

export default class Settings extends Scene {
  static items = [
    { key: 'difficulty', default: 'normal', values: ['easy', 'normal'] },
    { key: 'back', action: function () { this.saveAndExit(); } },
  ]

  values = {}

  selected = 0;

  template = (key, value) => `${key}     ← ${value} →`

  constructor () {
    super({ key: 'SettingsScene' });
  }

  create () {
    this.selected = 0;

    Settings.items.forEach(item => {
      this.values[item.key] = item.value ||
        this.registry?.get?.(item.key) ||
        globalThis.localStorage.getItem(item.key) ||
        item.default;
    });

    const { centerX, centerY } = this.cameras.main;

    this.container = this.add.container(centerX, centerY - 100);

    const title = this.add
      .text(0, 0, 'Settings', { ...FONT, fontSize: 32 })
      .setOrigin(0.5);
    this.container.add(title);

    Settings.items.filter(it => !it.action).forEach((item, i) => {
      const { key, default: def } = item;
      const value = this.values[key];

      const text = this.add
        .text(0, 150 + 50 * i, this.template(key, value || def), FONT)
        .setOrigin(0.5);

      this.container.add(text);
    });

    this.backText = this.add
      .text(0, 150 + 50 * (Settings.items.length + 1), 'back', FONT)
      .setOrigin(0.5);
    this.container.add(this.backText);

    this.arrow = this.add.triangle(0, 50, 0, 30, 15, 10, 30, 30)
      .setScale(0.5).setRotation(1.57).setFillStyle(0xFFFFFF);
    this.container.add(this.arrow);

    this.input.keyboard.on('keyup-DOWN', () => {
      this.setItem('next');
    });

    this.input.keyboard.on('keyup-UP', () => {
      this.setItem('previous');
    });

    this.input.keyboard.on('keyup-ENTER', () => {
      const item = Settings.items[this.selected];
      item?.action?.bind(this)?.();
    });

    this.input.keyboard.on('keyup-ESC', () => {
      this.saveAndExit();
    });

    this.input.keyboard.on('keyup-RIGHT', () => {
      this.setValue('next');
    });

    this.input.keyboard.on('keyup-LEFT', () => {
      this.setValue('previous');
    });

    this.height = this.container.getBounds().height;

    this.cameras.main.setPostPipeline(CRT);
  }

  setItem (direction = 'next') {
    switch (direction) {
      case 'previous':
        this.selected = this.selected > 0
          ? this.selected - 1 : Settings.items.length - 1;
        break;
      default:
        this.selected = this.selected < Settings.items.length - 1
          ? this.selected + 1 : 0;
    }
  }

  setValue (direction = 'next') {
    const item = Settings.items[this.selected];
    const currentValue = this.values[item.key] || item.default;

    let newValue;

    switch (direction) {
      case 'previous':
        newValue = item.values[item.values.indexOf(currentValue) - 1] ||
          item.values[item.values.length - 1];
        break;
      default:
        newValue = item.values[item.values.indexOf(currentValue) + 1] ||
          item.values[0];
    }

    this.values[item.key] = newValue;
    this.container.getAt(this.selected + 1)
      .setText(this.template(item.key, newValue));
  }

  update () {
    const { centerX, centerY } = this.cameras.main;

    this.container.setPosition(centerX, centerY - this.height / 2);

    const selectedItem = this.container.getAt(this.selected + 1);
    this.arrow.setPosition(
      selectedItem.x - (selectedItem.width / 2) - 20,
      selectedItem.y + 3
    );
  }

  saveAndExit () {
    Object.entries(this.values).forEach(([key, value]) => {
      this.registry.set(key, value);
      globalThis.localStorage.setItem(key, value);
      Settings.items.find(it => it.key === key)?.onSave?.bind(this)?.(value);
    });

    this.scene.start('MenuScene');
  }
}
