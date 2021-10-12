import {
  Phaser,
  Copyright,
  ActionFigure,
  PublicPath,
  randBetween,
  portalRequestGameData,
  portalReportHighscore,
  requestXHR,
} from '@commontown/arcade-library';

const appInfo = {
  publisher: 'CommonTown Pte Ltd',
  version: 'v1.0.0',
  releaseDate: ' 2021-08-11',
};

export default function RoseGame(elid) {
  const object = new Phaser.Game({
    type: Phaser.WEBGL,
    width: 1024,
    height: 768,
    parent: elid,
    transparent: true,
    scene: [RoseGameScene],
    physics: {
      default: 'arcade',
    },
    scale: {
      autoCenter: Phaser.Scale.CENTER_BOTH,
      mode: Phaser.Scale.FIT,
      width: 1024,
      height: 768
    },
    audio: {
      disableWebAudio: true,
    },
  });
  const destroy = _ => {
    object.destroy(true);
  };
  const { version, releaseDate } = appInfo;
  return { object, destroy, version, releaseDate };
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

class RoseGameScene extends Phaser.Scene {
  initialize() {
    Phaser.Scene.call(this, { key: 'RoseGame' });
  }

  preload() {
    const audiopath = `${PublicPath}/assets/audio`;
    const fxpath = `${PublicPath}/assets/audio/fx`;
    const modpath = `${PublicPath}/assets/games/RoseGame`;

    this.load.json('gameData', `${modpath}/gameData.json`);

    this.load.image('bg', `${modpath}/bg.jpg`);
    this.load.image('title', `${modpath}/title.png`);
    this.load.image('start', `${modpath}/start.png`);

    this.load.image('house-start', `${modpath}/house-start.png`);
    this.load.image('clock', `${modpath}/clock.png`);
    this.load.image('time-frame', `${modpath}/time-frame.png`);
    this.load.image('time-bar', `${modpath}/time-bar.png`);
    this.load.image('time-rose', `${modpath}/time-rose.png`);
    this.load.image('back', `${modpath}/back.png`);
    this.load.image('basket1', `${modpath}/basket1.png`);
    this.load.image('basket2', `${modpath}/basket2.png`);
    this.load.image('basket3', `${modpath}/basket3.png`);
    this.load.image('basket4', `${modpath}/basket4.png`);
    this.load.image('star-point', `${modpath}/star-point.png`);

    this.load.image('win-bg', `${modpath}/win-bg.png`);
    this.load.image('lose-bg', `${modpath}/lose-bg.png`);
    this.load.image('badge', `${modpath}/badge.png`);
    this.load.image('heart', `${modpath}/heart.png`);
    this.load.image('shine', `${modpath}/shine.png`);
    this.load.image('light', `${modpath}/light.png`);
    this.load.image('quit', `${modpath}/quit.png`);
    this.load.image('replay', `${modpath}/replay.png`);

    this.load.image('button-purple', `${modpath}/button-purple.png`);
    this.load.image('button-purple-grey', `${modpath}/button-purple-grey.png`);
    this.load.image('button-yellow', `${modpath}/button-yellow.png`);
    this.load.image('button-yellow-grey', `${modpath}/button-yellow-grey.png`);
    this.load.image('button-white', `${modpath}/button-white.png`);
    this.load.image('button-white-grey', `${modpath}/button-white-grey.png`);
    this.load.image('button-red', `${modpath}/button-red.png`);
    this.load.image('button-red-grey', `${modpath}/button-red-grey.png`);
    this.load.image('button-blue', `${modpath}/button-blue.png`);
    this.load.image('button-blue-grey', `${modpath}/button-blue-grey.png`);

    this.load.image('rose-purple', `${modpath}/rose-purple.png`);
    this.load.image('rose-yellow', `${modpath}/rose-yellow.png`);
    this.load.image('rose-white', `${modpath}/rose-white.png`);
    this.load.image('rose-red', `${modpath}/rose-red.png`);
    this.load.image('rose-blue', `${modpath}/rose-blue.png`);

    this.load.spritesheet(
      'rule',
      `${modpath}/sprite-rule.png`,
      {
        frameWidth: 498,
        frameHeight: 487,
      },
    );

    // music
    this.load.audio('theme', [
      `${audiopath}/light-jazz-1.ogg`,
      `${audiopath}/light-jazz-1.mp3`
    ]);
    this.load.audio('btn-press', [
      `${fxpath}/button.mp3`
    ]);
    this.load.audio('fx-right', [
      `${fxpath}/right.ogg`,
      `${fxpath}/right.mp3`
    ]);
    this.load.audio('fx-wrong', [
      `${fxpath}/wrong.ogg`,
      `${fxpath}/wrong.mp3`
    ]);
    this.load.audio('fx-win', [
      `${fxpath}/win.ogg`,
      `${fxpath}/win.mp3`
    ]);
    this.load.audio('fx-gameover', [
      `${fxpath}/gameover.ogg`,
      `${fxpath}/gameover.mp3`
    ]);
  }

  create() {
    const startfn = (scene, gameData) => {
      const logic = new __logic(scene, gameData);
      scene.input.on(
        'gameobjectdown',
        (pointer, obj) => logic.clickObject(pointer, obj),
      );
      scene.input.on(
        'gameobjectup',
        (pointer, obj) => logic.resetButtonColor(pointer, obj),
      );
  
      scene.physics.world.setFPS(30);
      scene.physics.world.setBounds(
        -20,
        -150,
        scene.scale.width + 60,
        scene.scale.height + 300,
        true,
        true,
        true,
        true,
      );
      scene.physics.world.on('worldbounds', (body, up, down, left, right) => {
        // disappear when it reach the bottom
        if (up || down) logic.deleteObject(body.gameObject, true);
      });
      logic.preloadFonts();
  
      logic.gameStart();
    };

    // wait for portal to start, startfn will be called if there is no encapsulating portal
    portalRequestGameData(this, startfn);
  }
}

// private logic class
class __logic {
  // depth of objects
  depth = {
    clockbar: 5,
    clockskull: 10,
    clockrose: 15,
    rose: 20,
    floater: 25,
    gameoverlight: 30,
    gameoverimage: 35,
    interface: 40,
  };

  animations = {
    rule: [
      {
        sheet: 'rule',
        anims: [
          {
            _act: 'normal',
            frameRate: 5,
            repeat: -1,
            _frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          },
        ],
        origin: [.5, .5],
      },
    ],
  }

  constructor(scene, gameData) {
    this.scene = scene;
    this.gameData = gameData;
    this.standalone = !gameData; // running as standalone if no gameData
    this.copyright = new Copyright(scene, appInfo);
  }

  getRightScore() {
    const baseScore = this.state.isFinalPhase
      ? this.finalScoring.right
      : this.scoring.right;
    const comboBonus = Math.pow(this.comboPower, this.state.comboCount);
    const score = Math.round(baseScore * comboBonus);
    return score;
  }

  getWrongScore() {
    const baseScore = this.state.isFinalPhase
      ? this.finalScoring.wrong
      : this.scoring.wrong;
    return baseScore;
  }

  deleteObject(rose, todestroy) {
    // mark rose as deleted
    const color = rose.getData('color');
    const matched = color + '-matched';
    const matchedIndex = this.state.flyingColors.indexOf(matched);
    const colorIndex = this.state.flyingColors.indexOf(color);
    const index = matchedIndex >= 0 ? matchedIndex : colorIndex;
    if (index >= 0) {
      this.state.flyingColors[index] += '-deleted';
    }

    // delete the rose object
    this.scene.physics.world.disable(rose);
    if (todestroy) rose.destroy();

    // in the final phase, trigger game over if there is no rose flying
    if (
      this.state.isFinalPhase &&
      this.state.flyingColors.length === this.totalRosesCount &&
      !this.state.flyingColors.includes('purple') &&
      !this.state.flyingColors.includes('yellow') &&
      !this.state.flyingColors.includes('white') &&
      !this.state.flyingColors.includes('red') &&
      !this.state.flyingColors.includes('blue') &&
      !this.state.flyingColors.includes('purple-matched') &&
      !this.state.flyingColors.includes('yellow-matched') &&
      !this.state.flyingColors.includes('white-matched') &&
      !this.state.flyingColors.includes('red-matched') &&
      !this.state.flyingColors.includes('blue-matched')
    ) {
      this.gameOver();
    }
  }

  clickObject(pointer, btn) {
    // non-colored buttons
    const onclick = btn.getData('onclick');
    if (typeof onclick === 'function')
      return onclick(pointer.event);

    // colored buttons
    const btnColor = btn.getData('color');
    if (btnColor) {
      let bg = btn.getAt(0);
      let isWrongColor = true;
      let roseIndex = -1;
      const rosesLength = this.state.flyingColors.length;

      // found the correct rose
      for (let i = 0; i < rosesLength; i++) {
        const roseColor = this.state.flyingColors[i];
        if (roseColor === btnColor) {
          const rose = this.state.flyingRoses[i];
          this.sendRoseToBasket(rose);
          isWrongColor = false;
          bg.setTexture(`button-${btnColor}`);
          let score = this.getRightScore();
          this.scene.sound.play('fx-right');
          this.scoreboard.change(score);
          this.makeTextFloater(
            rose.x + 50,
            rose.y,
            '+' + score,
            '#35d510',
            '#00953f',
          );
          this.state.comboCount++;
          roseIndex = 0 + i;
          break;
        }
      }
      if (roseIndex >= 0) {
        this.state.flyingColors[roseIndex] += '-matched';
      }

      // found the wrong rose
      if (isWrongColor) {
        let score = this.getWrongScore();
        this.scene.sound.play('fx-wrong');
        this.scoreboard.change(score);
        this.makeTextFloater(
          pointer.x,
          pointer.y,
          '' + score,
          '#f5242d',
          '#880005',
        );
        this.state.comboCount = 0;
      }
    }
  }

  sendRoseToBasket(rose) {
    // disable rose's physics otherwise it'll still have gravity and velocity applied
    this.scene.physics.world.disable(rose);

    const targetScaleX = 0.2
    const targetScaleY = 0.2

    // send rose to the basket, it'll shrink and disappear along the way
    this.scene.tweens.add({
      targets: rose,
      x: this.basket.x - (rose.width * targetScaleX / 2),
      y: this.basket.y + (rose.height * targetScaleY / 2),
      scaleX: targetScaleX,
      scaleY: targetScaleY,
      alpha: 0.2,
      duration: 500,
      ease: 'Circular',
      onComplete: _ => {
        this.deleteObject(rose, true);
      },
    });

    this.state.correctRoseCount++;
  }

  resetButtonColor(pointer, btn) {
    const onclick = btn.getData('onclick');
    if (typeof onclick === 'function')
      return onclick(pointer.event);

    const btnColor = btn.getData('color');
    let bg = btn.getAt(0);
    bg.setTexture(`button-${btnColor}-grey`);
  }

  dispenseDelay() {
    const { itemDelay } = this.state;
    return itemDelay;
  }

  // dispense rose
  dispenseItem() {
    const { playing } = this.state;
    if (playing && this.items.length) {
      // each dispense may have 1-3 roses
      const itemsPerDispense = this.items.splice(0, 1)[0];
      for (let i = 0; i < itemsPerDispense.length; i++) {
        let item = itemsPerDispense[i];
        this.makeRose(item);
      }
      this.scene.time.addEvent({
        callback: _ => this.dispenseItem(),
        delay: this.dispenseDelay(),
      });
    }
  }

  // in final phase only
  dispenseItems() {
    for (let i = 0; i < this.finalItems.length; i++) {
      this.makeRose(this.finalItems[i]);
    }
  }

  makeRose(color) {
    // set origin locations that dispense rose randomly
    const num = this.itemsSide.splice(0, 1)[0];
    switch (num) {
      case 2:
        this.makeRoseLeft(color);
        break;
      case 1:
        this.makeRoseRight(color);
        break;
      case 0:
      default:
        this.makeRoseBottom(color);
        break;
    }
  }

  makeRoseLeft(color) {
    const { width, height } = this.scene.scale;
    const roseX = 0;
    const roseY = randBetween(height - 300, height - 200);
    const speed = randBetween(250, 400);

    // horizontal speed range
    const horizontalSpeed = ((width / 2) - roseX) / width * speed;
    const horizontalSpeedMin = horizontalSpeed - 50;
    const horizontalSpeedMax = horizontalSpeed + 50;

    // create the rose object
    const rose = this.scene.physics.add
      .image(roseX, roseY, 'rose-' + color)
      .setOrigin(0);
    rose.setData('color', color);
    rose.setDepth(this.depth.rose);

    // set rose's physics
    this.scene.physics.world.enable(rose);
    rose.body.setGravity(0, 150);
    rose.body.setVelocity(
      randBetween(horizontalSpeedMin, horizontalSpeedMax),
      -1 * randBetween(250, 350),
    );
    rose.body.setCollideWorldBounds(true);
    rose.body.onWorldBounds = true;

    // rotate the rose as it moves
    rose.setRotation(randBetween(-10, 10) / 10 || .2);
    const rotation = this.scene.tweens.add({
      targets: rose,
      angle: 0,
      duration: 100000,
      ease: 'Elastic',
    });
    rose.setData('rotation', rotation);

    this.state.flyingColors.push(color);
    this.state.flyingRoses.push(rose);
  }

  makeRoseRight(color) {
    const { width, height } = this.scene.scale;
    const roseX = width - 134.6;
    const roseY = randBetween(height - 300, height - 200);
    const speed = randBetween(250, 400);

    // horizontal speed range
    const horizontalSpeed = ((width / 2) - roseX) / width * speed;
    const horizontalSpeedMin = horizontalSpeed - 50;
    const horizontalSpeedMax = horizontalSpeed + 50;

    // create the rose object
    const rose = this.scene.physics.add
      .image(roseX, roseY, 'rose-' + color)
      .setOrigin(0);
    rose.setData('color', color);
    rose.setDepth(this.depth.rose);

    // set rose's physics
    this.scene.physics.world.enable(rose);
    rose.body.setGravity(0, 150);
    rose.body.setVelocity(
      randBetween(horizontalSpeedMin, horizontalSpeedMax),
      -1 * randBetween(250, 350),
    );
    rose.body.setCollideWorldBounds(true);
    rose.body.onWorldBounds = true;

    // rotate the rose as it moves
    rose.setRotation(randBetween(-10, 10) / 10 || .2);
    const rotation = this.scene.tweens.add({
      targets: rose,
      angle: 0,
      duration: 100000,
      ease: 'Elastic',
    });
    rose.setData('rotation', rotation);

    this.state.flyingColors.push(color);
    this.state.flyingRoses.push(rose);
  }

  makeRoseBottom(color) {
    const { width, height } = this.scene.scale;
    const roseX = randBetween(104, width - 104);
    const roseY = height;
    const speed = randBetween(200, 400);

    // horizontal speed range
    const horizontalSpeed = ((width / 2) - roseX) / width * speed;
    const horizontalSpeedMin = horizontalSpeed - 50;
    const horizontalSpeedMax = horizontalSpeed + 50;

    // create the rose object
    const rose = this.scene.physics.add
      .image(roseX, roseY, 'rose-' + color)
      .setOrigin(0);
    rose.setData('color', color);
    rose.setDepth(this.depth.rose);

    // set rose's physics
    this.scene.physics.world.enable(rose);
    rose.body.setGravity(0, 150);
    rose.body.setVelocity(
      randBetween(horizontalSpeedMin, horizontalSpeedMax),
      -1 * randBetween(350, 450),
    );
    rose.body.setCollideWorldBounds(true);
    rose.body.onWorldBounds = true;

    // rotate the rose as it moves
    rose.setRotation(randBetween(-10, 10) / 10 || .2);
    const rotation = this.scene.tweens.add({
      targets: rose,
      angle: 0,
      duration: 100000,
      ease: 'Elastic',
    });
    rose.setData('rotation', rotation);

    this.state.flyingColors.push(color);
    this.state.flyingRoses.push(rose);
  }

  makeTextFloater(x, y, text, color, stroke) {
    // default text colors
    if (!color) color = '#fdfdfe';
    if (!stroke) stroke = '#7704d5';

    // create the floating score text object
    const floater = this.scene.add.text(
      x,
      y - 50,
      '' + text,
      {
        fontFamily: 'Buding Ti',
        fontSize: 30,
        align: 'center',
        color,
      },
    ).setOrigin(.5);
    floater.setStroke(stroke, 4);
    floater.setDepth(this.depth.floater);

    // destroy it when faded
    this.scene.tweens.add({
      targets: floater,
      y: y - 150,
      duration: 2000,
      alpha: 0,
      ease: 'Cubic',
      onComplete: _ => {
        floater.destroy();
      },
    });
  }

  makeColorButton(x, y, color) {
    const bg = this.scene.add.image(0, 0, `button-${color}-grey`);
    const ctn = this.scene.add.container(x, y, [bg]);
    ctn.setSize(210, 94);
    ctn.setInteractive({ useHandCursor: true });
    ctn.setData('color', color);
    ctn.setDepth(this.depth.interface);
    ctn.on('pointerover', pointer => {
      bg.setScale(1.1);
    });
    ctn.on('pointerout', pointer => {
      bg.setScale(1);
    });
    return ctn;
  }

  makeColorButtons() {
    const { width, height } = this.scene.scale;
    const btnX = width / 5;
    const btnY = height - 60;

    // randomize the buttons' positions
    let nums = [1, 2, 3, 4, 5];
    nums = shuffleArray(nums);

    this.btnPurple =
      this.makeColorButton((nums[0] * btnX) - 105, btnY, 'purple');
    this.btnYellow =
      this.makeColorButton((nums[1] * btnX) - 105, btnY, 'yellow');
    this.btnWhite = this.makeColorButton((nums[2] * btnX) - 105, btnY, 'white');
    this.btnRed = this.makeColorButton((nums[3] * btnX) - 105, btnY, 'red');
    this.btnBlue = this.makeColorButton((nums[4] * btnX) - 105, btnY, 'blue');
  }

  makeBackButton(x, y, callback) {
    const btn = this.scene.add.image(x, y, 'back').setOrigin(0);
    btn.setInteractive({ useHandCursor: true });
    btn.setData('onclick', callback);
    btn.setDepth(this.depth.interface);
  }

  makeTimeBar(x, y, onZero) {
    // define dimensions and coordinates
    const frameWidth = 418;
    const barWidth = 363;
    const roseWidth = 77;
    const roseLength = frameWidth - roseWidth;
    const roseXmin = x - (roseLength / 2) - (roseWidth / 2);
    const roseXmax = roseXmin + roseLength + (roseWidth / 2);
    const barXmin = -(frameWidth / 2) - barWidth - (roseWidth / 2) + 5;
    const barXmax = barXmin + (roseXmax - roseXmin);

    // frame with skull at the most back
    const frame = this.scene.add.image(x, y, 'time-frame').setOrigin(.5);

    // green bar
    const bar = this.scene.add.image(barXmin, 0, 'time-bar').setOrigin(0, .5);
    const ctnMask = this.scene.add.graphics()
      .fillEllipse(x, y, 405, 67, 100)
      .createGeometryMask();
    const ctn = this.scene.add.container(x, y, [bar]);
    ctn.setSize(418, 67);
    ctn.setMask(ctnMask);

    // rose at the most front
    const rose = this.scene.add.image(roseXmin, y, 'time-rose').setOrigin(.5);

    const roseMotion = this.scene.tweens.add({
      targets: rose,
      x: roseXmax,
      duration: this.state.secLeft * 1000,
      ease: 'Linear',
      onComplete: _ => {
        if (onZero) onZero();
      },
    });

    const barMotion = this.scene.tweens.add({
      targets: bar,
      x: barXmax,
      duration: this.state.secLeft * 1000,
      ease: 'Linear',
    });
  }

  makeBasket(x, y, image = 'basket1') {
    if (this.basket) this.basket.destroy();
    const basket = this.scene.add.image(x, y, image);
    this.basket = basket;
  }

  makeScoreboard(x, y) {
    // background image
    const bg = this.scene.add.image(0, 0, 'star-point');

    // score label text
    const label = this.scene.add.text(
      0,
      40,
      '', // not setting any text because font is not loaded yet
      {
        fontFamily: 'Hao Buding Ti',
        fontSize: 30,
        align: 'center',
        color: '#ffffff',
      },
    ).setOrigin(.5, 0);
    label.setStroke('#010101', 3);

    // main container
    const ctn = this.scene.add.container(x, y, [bg, label]);
    ctn.setSize(140, 142);
    const change = (inc) => {
      this.state.score += inc;
      this.updateBasketImage();
      label.setText('' + this.state.score);
    };
    const get = (_ => this.state.score);

    return { change, get, object: ctn };
  }

  serverHighscore(score) {
    portalReportHighscore(score, data => this.makeHighscoreBoard(data));
  }

  updateBasketImage() {
    const { score } = this.state;
    let newBasket = '' + this.state.currentBasket;
    switch (this.state.currentBasket) {
      case 'basket1':
        if (score >= 1000) {
          newBasket = 'basket2';
        }
        break;
      case 'basket2':
        if (score >= 3000) {
          newBasket = 'basket3';
        } else if (score < 1000) {
          newBasket = 'basket1';
        }
        break;
      case 'basket3':
        if (score >= 6000) {
          newBasket = 'basket4';
        } else if (score < 3000) {
          newBasket = 'basket2';
        }
        break;
      case 'basket4':
        if (score < 6000) {
          newBasket = 'basket3';
        }
        break;
    }
    if (newBasket != this.state.currentBasket) {
      this.state.currentBasket = '' + newBasket;
      const { width, height } = this.scene.scale;
      this.makeBasket(width - 200, 56, newBasket);
    }
  }

  setItems(items) {
    this.items = [];
    this.totalRosesCount = 0 + this.finalPhaseItemsCount;
    const numUniqueItems = items.length - 1;
    for (let i = 0; i < this.dispenseCount; i++) {
      // 1-3 roses will be dispensed randomly
      let numItems = randBetween(this.itemsRnd.min, this.itemsRnd.max);
      this.totalRosesCount += numItems;
      let itemsPerDispense;
      let isWrongCombination = true;
      while (isWrongCombination) {
        itemsPerDispense = [];
        for (let j = 0; j < numItems; j++) {
          itemsPerDispense.push(items[randBetween(0, numUniqueItems)]);
        }
        isWrongCombination = itemsPerDispense.length > 1 &&
          this.hasSameColors(itemsPerDispense);
      }
      this.items.push(itemsPerDispense);
    }
  }

  // for final phase
  setFinalItems(items) {
    let isWrongCombination = true;
    while (isWrongCombination) {
      this.finalItems = [];
      for (let i = 0; i < this.finalPhaseItemsCount; i++) {
        this.finalItems.push(items[randBetween(0, items.length - 1)]);
      }
      isWrongCombination = this.hasSameColors(this.finalItems) ||
        this.hasDifferentColors(items);
    }
  }

  // set origin locations that dispense roses randomly
  setItemsSide() {
    this.itemsSide = [];
    for (let i = 0; i < this.totalRosesCount; i++) {
      this.itemsSide.push(randBetween(0, 2));
    }
  }

  hasSameColors(items) {
    for (let i = 0; i < items.length - 1; i++) {
      if (items[i] != items[i+1]) {
        return false;
      }
    }
    return true;
  }

  hasDifferentColors(items) {
    for (let i = 0; i < items.length; i++) {
      if (!this.finalItems.includes(items[i])) {
        return false;
      }
    }
    return true;
  }

  // initialize the game
  initGame() {
    const gameData = this.standalone
      ? this.scene.cache.json.get('gameData')
      : this.gameData;

    const {
      timeGivenSec: secLeft,
      gravity,
      roses: items,
      winningPercentage,
      finalPhaseItemsCount,
      dispenseCount,
      comboPower,
      itemsRndMin,
      itemsRndMax,
      normalPhaseScoreRight,
      normalPhaseScoreWrong,
      finalPhaseScoreRight,
      finalPhaseScoreWrong,
    } = gameData;

    this.winningPercentage = winningPercentage;
    this.finalPhaseItemsCount = finalPhaseItemsCount;
    this.dispenseCount = dispenseCount;
    this.comboPower = comboPower;
    this.itemsRnd = {
      min: itemsRndMin,
      max: itemsRndMax,
    };
    this.scoring = {
      right: normalPhaseScoreRight,
      wrong: normalPhaseScoreWrong,
    };
    this.finalScoring = {
      right: finalPhaseScoreRight,
      wrong: finalPhaseScoreWrong,
    };

    this.setFinalItems(items);
    this.setItems(items);
    this.setItemsSide();

    this.scene.physics.world.gravity.y = Number(gravity);

    // delay for next rose to be dispensed
    const itemDelay = 1000 * secLeft * 0.95 / this.items.length;

    // initial game state
    this.state = {
      playing: false,
      itemDelay,
      secLeft,
      flyingColors: [],
      flyingRoses: [],
      comboCount: 0,
      correctRoseCount: 0,
      score: 0,
      currentBasket: 'basket1',
      isFinalPhase: false,
      isWin: false,
    };
  }

  preloadFonts() {
    this.scene.add.text(
      0,
      0,
      '1',
      {
        fontFamily: 'Buding Ti',
        fontSize: 1,
        align: 'left',
        color: '#000000',
      },
    ).setOrigin(0);

    this.scene.add.text(
      5,
      0,
      '2',
      {
        fontFamily: 'Public Sans',
        fontSize: 1,
        align: 'left',
        color: '#000000',
      },
    ).setOrigin(0);

    this.scene.add.text(
      10,
      0,
      '3',
      {
        fontFamily: 'Hao Buding Ti',
        fontSize: 1,
        align: 'left',
        color: '#000000',
      },
    ).setOrigin(0);

    this.scene.add.text(
      15,
      0,
      '4',
      {
        fontFamily: 'Noto Sans SC',
        fontSize: 1,
        align: 'left',
        color: '#000000',
      },
    ).setOrigin(0);
  }

  // main menu screen
  gameStart() {
    const { width, height } = this.scene.scale;

    // destroy these buttons on replay
    if (this.quitButton) this.quitButton.destroy();
    if (this.replayButton) this.replayButton.destroy();

    this.scene.add.image(0, 0, 'bg').setOrigin(0); // background image
    this.preloadFonts();
    this.scene.add.image(width / 2, 100, 'title').setOrigin(.5, 0); // title

    // animated game rules
    this.rule = new ActionFigure(
      this.scene,
      {
        x: width / 2,
        y: (height / 2) + 50,
        depth: this.depth.interface,
      },
      this.animations.rule,
    );

    // start button
    const btn = this.scene.add
      .image(width - 205, height - 91, 'start')
      .setOrigin(.5, .5);
    btn.setInteractive({ useHandCursor: true });
    btn.setData('onclick', _ => {
      this.scene.sound.play('btn-press');
      btn.destroy();
      this.scene.add.displayList.removeAll(); // remove all objects
      this.gameStartRound();
    });
    btn.on('pointerover', pointer => {
      btn.setScale(1.1);
    });
    btn.on('pointerout', pointer => {
      btn.setScale(1);
    });

    this.copyright.render();
  }

  // main game screen
  gameStartRound() {
    const { width, height } = this.scene.scale;
    if (this.music) {
      this.music.setVolume(.5);
    } else {
      this.music = this.scene.sound.add('theme');
      this.music.setVolume(.5);
      this.music.play({ loop: true });
    }
    this.scene.add.image(0, 0, 'bg').setOrigin(0); // background image
    this.preloadFonts();
    this.initGame();
    this.state.playing = true;
    this.makeTimeBar(width / 2, 62, _ => {
      this.state.isFinalPhase = true;
      this.state.comboCount = 0;
      this.dispenseItems();
    });
    this.makeBasket(width - 200, 56);
    this.scoreboard = this.makeScoreboard(width - 80, 56);
    this.makeColorButtons();
    this.dispenseItem();

    this.copyright.render();
  }

  makeGameOverImages() {
    const { width, height } = this.scene.scale;
    const imageX = width / 2;
    const imageY = height / 3;

    let bg = null;
    let image = null;

    if (this.state.isWin) {
      bg = this.scene.add.image(0, 0, 'win-bg').setOrigin(0);
      image = this.scene.add.image(imageX, imageY, 'badge').setOrigin(.5);
      image.setDepth(this.depth.gameoverimage);
    } else {
      bg = this.scene.add.image(0, 0, 'lose-bg').setOrigin(0);
      image = this.scene.add.image(imageX, imageY, 'heart').setOrigin(.5);
      image.setDepth(this.depth.gameoverimage);
    }
  }

  makeGameOverText() {
    const { width, height } = this.scene.scale;
    const message = this.state.isWin ? "你真棒!" : "要加油哦！";
    const messageTextX = width / 2;
    const messageTextY = (height / 3) + 225;
    const messageText = this.scene.add.text(
      0,
      0,
      message,
      {
        fontFamily: 'Hao Buding Ti',
        fontSize: 44,
        align: 'center',
        color: '#ffffff',
      },
    ).setOrigin(.5);
    messageText.setStroke('#a223ff', 7);
    const ctn = this.scene.add.container(
      messageTextX,
      messageTextY,
      [messageText],
    );
    ctn.setSize(210, 94);
  }

  makeGameOverScore() {
    const { width, height } = this.scene.scale;

    // score text
    const score = '' + this.state.score;
    let paddingLeft = 0;
    const text1 = this.scene.add.text(
      paddingLeft,
      0,
      score,
      {
        fontFamily: 'Public Sans',
        fontSize: 44,
        align: 'right',
        color: '#ffffff',
      },
    ).setOrigin(0, .5);
    text1.setStroke('#e78903', 7);

    // 分
    paddingLeft = text1.width + 5;
    const text2 = this.scene.add.text(
      paddingLeft,
      0,
      '分',
      {
        fontFamily: 'Hao Buding Ti',
        fontSize: 44,
        align: 'left',
        color: '#ffffff',
      },
    ).setOrigin(0, .5);
    text2.setStroke('#e78903', 7);

    // accuracy text
    paddingLeft += text2.width + 20;
    const accuracy =
      `(答对${this.state.correctRoseCount}/${this.totalRosesCount}个)`;
    const text3 = this.scene.add.text(
      paddingLeft,
      0,
      accuracy,
      {
        fontFamily: 'Noto Sans SC',
        fontSize: 36,
        align: 'left',
        color: '#e78903',
      },
    ).setOrigin(0, .5);

    // container
    const ctnWidth = paddingLeft + text3.width
    const ctnX = (width - ctnWidth) / 2;
    const ctnY = (height / 3) + 285;
    const ctn = this.scene.add.container(
      ctnX,
      ctnY,
      [text1, text2, text3],
    );
    ctn.setSize(ctnWidth, 60);
  }

  makeQuitButton() {
    const { width, height } = this.scene.scale;
    const btnX = width / 3;
    const btnY = height - 125;
    const btn = this.scene.add.image(btnX, btnY, 'quit');
    btn.setSize(170, 89);
    btn.setInteractive({ useHandCursor: true });
    btn.setData('onclick', _ => {
      this.scene.sound.play('btn-press');
      document.location.hash = '#/';
    });
    btn.setDepth(this.depth.interface);
    btn.on('pointerover', pointer => {
      btn.setScale(1.1);
    });
    btn.on('pointerout', pointer => {
      btn.setScale(1);
    });
    return btn;
  }

  makeReplayButton() {
    const { width, height } = this.scene.scale;
    const btnX = width / 2;
    const btnY = height - 125;
    const btn = this.scene.add.image(btnX, btnY, 'replay');
    btn.setSize(175, 92);
    btn.setInteractive({ useHandCursor: true });
    btn.setData('onclick', _ => {
      this.scene.sound.play('btn-press');
      this.scene.add.displayList.removeAll();
      this.gameStart();
    });
    btn.setDepth(this.depth.interface);
    btn.on('pointerover', pointer => {
      btn.setScale(1.1);
    });
    btn.on('pointerout', pointer => {
      btn.setScale(1);
    });
    return btn;
  }

  serverHighscore(score) {
    const { server } = this.gameData || {};
    if (server) {
      const { highscoreUrl, gameId } = server;
      if (highscoreUrl && gameId) {
        requestXHR(highscoreUrl, {
          method: 'post',
          data: {
            cat: gameId,
            total: score,
          }
        }).then(data => {
          this.makeHighscoreBoard(data);
        });
      }
    }
  }

  makeHighscoreBoard(board) {
    const { high } = board;
    let hsctn;
    if (Array.isArray(high)) {
      const fsize = 40;
      const indentWidth = 40; // indent before the name
      const nameWidth = 320;
      const scoreWidth = 110;
      const basestyle = { fontFamily: 'san-serif', fontSize: fsize, color: '#fdfdfe', };
      const titley = 0;
      const rowy = 120;
      const rowspacing = 1.2;
      const rowheight = fsize * rowspacing;
      const pad = { x: 32, y: 16 };
      const textwidth = indentWidth + nameWidth + scoreWidth;
      const badgewidth = 30;
      const badgecolors = [0xf1b619, 0x6aa6c6, 0x845f00];

      let objs = [];
      let minebar;

      // bg panel
      {
        let panel;
        panel = this.scene.add.graphics({ x: -pad.x, y: -pad.y });
        panel.fillStyle(0x03568a, 1);
        panel.fillRoundedRect(0, 0, textwidth + 2 * pad.x, rowy + rowheight * high.length + 2 * pad.y, pad.x);
        objs.push(panel);
      }

      // title
      {
        objs.push(this.scene.add.text(textwidth / 2, titley, 'High Scores', { fontFamily: 'san-serif', fontSize: fsize * 1.8, color: '#fdfdfe', }).setOrigin(0.5, 0).setStroke('#ab7a00', 12));
      }

      // rows
      high.forEach(({ fname, total, mine }, i) => {
        const y = rowy + i * rowheight; // title + row-offset

        mine = !!parseInt(mine);
        // bar
        if (mine) {
          const rowpad = { x: pad.x, y: 4 };
          minebar = this.scene.add.graphics({ x: -rowpad.x, y: y - rowpad.y });
          minebar.fillStyle(0x24c3fd, .7);
          minebar.fillRect(0, 0, textwidth + 2 * rowpad.x, fsize * 1.0 + 2 * rowpad.y);
          objs.push(minebar);
        }

        // badges 1 - 3
        if (i < 3) {
          const circle = this.scene.add.graphics({ x: 0, y });
          circle.fillStyle(badgecolors[i], 1);
          circle.fillCircle(badgewidth / 2, rowheight / 2, badgewidth / 2);
          objs.push(circle);

          const fontSize = basestyle.fontSize * 0.6;
          const numtext = this.scene.add.text(badgewidth / 2, y + rowheight / 2, '' + (i + 1), { ...basestyle, fontSize, }).setOrigin(.5);
          objs.push(numtext);
        }

        const nametext = this.scene.add.text(indentWidth, y, fname, { ...basestyle, }).setCrop(0, 0, nameWidth, fsize * 1.4);
        const scoretext = this.scene.add.text(textwidth, y, '' + total, { ...basestyle, }).setOrigin(1, 0);
        objs.push(nametext);
        objs.push(scoretext);
      });

      const { width, height } = this.scene.scale;

      hsctn = this.scene.add.container((width - textwidth) / 2, -200, objs);
      hsctn.setDepth(this.depth.epilog).setAlpha(0);
    }

    this.scene.tweens.add({
      targets: hsctn, y: 150, alpha: 1, repeat: -1,
      yoyo: true, delay: 2000, repeatDelay: 3000,
      duration: 4000, ease: 'Power4'
    });
  }

  setResult() {
    const percentage = this.state.correctRoseCount / this.totalRosesCount * 100;
    this.state.isWin = percentage >= this.winningPercentage;
    if (this.state.isWin) {
      this.scene.sound.play('fx-win', { loop: false });
    } else {
      this.scene.sound.play('fx-gameover', { loop: false });
    }
  }

  // Game over screen
  gameOver() {
    this.state.playing = false;
    this.music.setVolume(.25);
    this.scene.add.displayList.removeAll();

    // destroy the colored buttons
    if (this.btnPurple) this.btnPurple.destroy();
    if (this.btnYellow) this.btnYellow.destroy();
    if (this.btnWhite) this.btnWhite.destroy();
    if (this.btnRed) this.btnRed.destroy();
    if (this.btnBlue) this.btnBlue.destroy();

    this.setResult();
    this.makeGameOverImages();
    this.makeGameOverText();
    this.makeGameOverScore();
    this.serverHighscore(this.state.score);
    this.replayButton = this.makeReplayButton();

    this.copyright.render();
  }
}
