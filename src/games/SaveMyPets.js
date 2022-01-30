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
import {
  GameLogic,
  GameState
}from './save_my_pets/GameLogic';
import {
  GetGameText
}from './save_my_pets/Text';
import {
  Timeline,
  TimelineNode
} from './save_my_pets/Timeline';
import {
  PositionSynchronizer,
  SoundManager,
  Question,
  Character,
  AnswerSeat,
  CountdownTimer,
  DialogBubble
}from './save_my_pets/GameElements';


const appInfo = {
  publisher: 'CommonTown Pte Ltd',
  version: 'v1.0.0',
  releaseDate: ' 2021-10-28',
};

var game;   //Phaser.game，为了凑出先load gameData然后再根据gameData开始游戏的效果
export var langVersion = "zh"; //语言版本，"zh"读取zh文件夹下对应内容，而"en"读取en文件夹下所有内容
export var gameLogic;   //游戏核心逻辑对象，也就是主游戏了
export var gameConfig = {   //游戏的设置，对应gameData["config"]
  character : "0",    //读取几号角色
  pet : "0",  //读取几号宠物
  monster: "0",    //boss使用的图片，比如0就是boss0.png
  question_time: 10,  //float 答题时间，秒数
  correct_point: 200, //int 答对得分
  incorrect_point: 100,   //int 答错扣分
  bgm : 'bgm.mp3',       //背景音乐路径
  win_music: 'jingle_win.mp3',    
  lose_music: 'jingle_lose.mp3',
  bkg: "0",       //背景的图片，比如0就是bkg0.png
  total_question: 6,  //总共多少题
  mainPageUrl : 'http://www.baidu.com',  //quitButton跳转
}
export var gameQuestions;   //游戏的题目，对应gameData["questions"]

export default function SaveMyPets(elid) {
  const object = new Phaser.Game({
    type: Phaser.WEBGL,
    width: 1024,
    height: 768,
    parent: elid,
    transparent: true,
    //scene: [LoadingScene],
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
      //disableWebAudio: true,
    },
  });
  object.scene.add('Loading', LoadingScene);
  object.scene.add('Game', SaveMyPetScene);
  object.scene.start('Loading');
  const destroy = _ => {
    object.destroy(true);
  };
  const { version, releaseDate } = appInfo;
  game = object;
  return { object, destroy, version, releaseDate };
}


var gData;

//因为gameData需要设定一些preload的内容，所以不得不加上一个scene专门来负责拿gameData
class LoadingScene extends Phaser.Scene{
    

    initialize() {
        Phaser.Scene.call(this, { key: 'Loading', active:true});
    }

    preload(){
        portalRequestGameData(this, (scene, gameData)=>{
            //console.log("After game data", scene, gameData);
            const jsonPath = `${PublicPath}/assets/save_my_pets/json/`;
            this.load.json('gameData', jsonPath + "GameData.json");
            this.gData = gameData;
            //console.log("game data preload", this.cache.json.get('gameData'), this.cache.json);
        })
        // //console.log("preload done", this.gData, gameConfig, gameQuestions);
    }

    create(){
        // if (!gData){
        //     gData = this.cache.json.get('gameData');
        // }
        // if (gData){
        //     gameConfig = gData["config"];
        //     gameQuestions = gData["questions"];
        // }
        // //console.log("load create", gData);
        // game.scene.start('Game');

        const jsonPath = `${PublicPath}/assets/save_my_pets/json/`;
        this.load.json('gameData', jsonPath + "GameData.json");
        gData = this.cache.json.get('gameData');
        //console.log("1st step", gData);

        portalRequestGameData(this, (scene, gameData)=>{
            //console.log("After game data", scene, gameData);
            // const jsonPath = `${PublicPath}/assets/save_my_pets/json/`;
            // this.load.json('gameData', jsonPath + "GameData.json");
            //console.log("Portal requested", gameData);
            if (gameData) gData = gameData;
            //console.log("game data preload", gData, gameData==gData);
            game.scene.start('Game');
        })

    }
}

class SaveMyPetScene extends Phaser.Scene {
    initialize() {
        Phaser.Scene.call(this, { key: 'Game', active:false });
    }

    preload() {
        if (!gData){
            console.error("gData is empty, can't run game");
        }else{
            gameConfig = gData["config"];
            gameQuestions = gData["questions"];
            langVersion = gameConfig["langVersion"];
        }
        //console.log("Preload done", gameQuestions, gData, gameConfig);

        const imgPath = `${PublicPath}/assets/save_my_pets/images/${langVersion}/`; 
        const soundPath = `${PublicPath}/assets/save_my_pets/sounds/`; 
        //console.log("File path", langVersion, imgPath);

        this.load.image('bkg', imgPath + 'bkg' + gameConfig.bkg + '.jpg');
        this.load.image('rope', imgPath + 'line.png');
        this.load.image('bigWheel', imgPath + 'wheel_big.png');
        this.load.image('smallWheel', imgPath + 'wheel_small.png');
        this.load.image('dialog', imgPath + 'dialog.png');
        this.load.image('answer', imgPath + 'answer_seat.png');
        this.load.image('answer_mask', imgPath + 'answer_seat_mask.png');
        this.load.spritesheet('cage', imgPath + 'cage.png', { frameWidth: 136, frameHeight: 172 });
        this.load.spritesheet('cage_broken', imgPath + 'cage_broken.png', { frameWidth: 136, frameHeight: 172 });
        this.load.image('scoreBack', imgPath + 'score_seat.png');
        this.load.spritesheet('player', imgPath + 'player'+gameConfig.character+'.png', { frameWidth: 143, frameHeight: 137 });
        this.load.spritesheet('pet', imgPath + 'pet'+gameConfig.pet+'.png', { frameWidth: 144, frameHeight: 121 });
        this.load.spritesheet('boss', imgPath + 'boss' + gameConfig.monster + '.png', { frameWidth: 891, frameHeight: 729 });
        this.load.image('chaGuide', imgPath + "cha_guide.png");
        //buttons
        this.load.spritesheet('btn_start', imgPath + 'btn_start.png', {frameWidth:234, frameHeight:77});
        this.load.spritesheet('btn_replay', imgPath + 'btn_replay.png', {frameWidth:237, frameHeight:84});
        this.load.spritesheet('btn_start_down', imgPath + 'btn_start_pressed.png', {frameWidth:234, frameHeight:77});
        this.load.spritesheet('btn_replay_down', imgPath + 'btn_replay_pressed.png', {frameWidth:237, frameHeight:84});
        this.load.spritesheet('btn_music_on', imgPath + 'btn_music_on.png', {frameWidth:52, frameHeight:54});
        this.load.spritesheet('btn_music_off', imgPath + 'btn_music_off.png', {frameWidth:52, frameHeight:54});
        this.load.spritesheet('btn_sound_on', imgPath + 'btn_sound_on.png', {frameWidth:52, frameHeight:54});
        this.load.spritesheet('btn_sound_off', imgPath + 'btn_sound_off.png', {frameWidth:52, frameHeight:54});
        this.load.spritesheet('btn_quit', imgPath + 'btn_quit.png', {frameWidth:237, frameHeight:84});
        this.load.spritesheet('btn_rule', imgPath + 'btn_rule.png', {frameWidth:237, frameHeight:84});
        this.load.spritesheet('btn_quit_down', imgPath + 'btn_quit_pressed.png', {frameWidth:237, frameHeight:84});
        this.load.spritesheet('btn_rule_down', imgPath + 'btn_rule_pressed.png', {frameWidth:237, frameHeight:84});
        this.load.spritesheet('btn_help_close', imgPath + 'ui_close_normal.png', {frameWidth:58, frameHeight:59});
        this.load.spritesheet('btn_help_close_down', imgPath + 'ui_close_pressed.png', {frameWidth:55, frameHeight:59});
        //UI
        this.load.image('resultPanel', imgPath + 'result_panel.png');
        this.load.spritesheet('resultLogo', imgPath + 'result_logo.png', {frameWidth:252, frameHeight:94});
        this.load.image('uiMask', imgPath + 'mask.png');
        this.load.image('gameTitle', imgPath + 'gametitle.png');
        this.load.image('tutorial', imgPath + 'tutorial.png');
        this.load.image('boss_fly', imgPath + 'boss' + gameConfig.monster + '_fly.png');
        this.load.image('failCry', imgPath + 'fail_cry.png');
        this.load.image('winPlane', imgPath + 'win_big_plane.png');
        this.load.image('winFlight', imgPath + 'win_plane_onboard.png');

        this.load.audio('bgm', [soundPath + gameConfig.bgm]);
        this.load.audio('win', [soundPath + gameConfig.win_music]);
        this.load.audio('lose', [soundPath + gameConfig.lose_music]);
        this.load.audio('bubble', [soundPath + 'se_bubble.mp3']);
        this.load.audio('click', [soundPath + 'se_click.mp3']);
        this.load.audio('close', [soundPath + 'se_close.mp3']);
        this.load.audio('correct', [soundPath + 'se_correct.mp3']);
        this.load.audio('countdown', [soundPath + 'se_count_down.mp3']);
        this.load.audio('hurt', [soundPath + 'se_hurt.mp3']);
        this.load.audio('idle', [soundPath + 'se_idle.mp3']);
        this.load.audio('jump', [soundPath + 'se_jump.mp3']);
        this.load.audio('monsterComing', [soundPath + 'se_monster_coming.mp3']);
        this.load.audio('wrong', [soundPath + 'se_wrong.mp3']);

        
    }

    create() {
        //console.log("Game Really Start", gameQuestions);
        gameLogic = new GameLogic(this, appInfo);
        gameLogic.gameState = GameState.MainMenu;
        gameLogic.GatherQuestions();

        gameLogic.timeline = new Timeline();
        gameLogic.posSync = new PositionSynchronizer();
        gameLogic.inputs = this.input.keyboard.createCursorKeys();

        gameLogic.answerIndex = 3;

        let gBgm = this.sound.add('bgm',1,true);
        gBgm.loop = true;
        gameLogic.sounds = new SoundManager({
            bgm: gBgm
        },{
            win: this.sound.add('win'),
            lose: this.sound.add('lose'),
            bubble: this.sound.add('bubble'),
            click: this.sound.add('click'),
            close: this.sound.add('close'),
            correct: this.sound.add('correct'),
            countdown: this.sound.add('countdown'),
            hurt: this.sound.add('hurt'),
            idle: this.sound.add('idle'),
            jump: this.sound.add('jump'),
            monsterComing: this.sound.add('monsterComing'),
            wrong: this.sound.add('wrong'),
        });
        gameLogic.sounds.Play('bgm');

        this.add.image(512, 384, 'bkg');    //bkg
        this.anims.create({
            key:'player_stand',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'player_jump',
            frames: this.anims.generateFrameNumbers('player', { start: 1, end: 1 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'player_cry',
            frames: this.anims.generateFrameNumbers('player', { start: 2, end: 2}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'cage_normal',
            frames: this.anims.generateFrameNumbers('cage', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'cage_broken',
            frames: this.anims.generateFrameNumbers('cage_broken', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'pet_cry',
            frames: this.anims.generateFrameNumbers('pet', { start: 1, end: 1 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'pet_stand',
            frames: this.anims.generateFrameNumbers('pet', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'boss_stand',
            frames: this.anims.generateFrameNumbers('boss', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'resultLogo_win',
            frames: this.anims.generateFrameNumbers('resultLogo', { start: 1, end: 1 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'resultLogo_lose',
            frames: this.anims.generateFrameNumbers('resultLogo', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'resultLogo_perfect',
            frames: this.anims.generateFrameNumbers('resultLogo', { start: 2, end: 2 }),
            frameRate: 10,
            repeat: -1
        })
        //buttons
        this.anims.create({
            key:'btn_start_up',
            frames: this.anims.generateFrameNumbers('btn_start', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'btn_start_down',
            frames: this.anims.generateFrameNumbers('btn_start_down', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'btn_replay_up',
            frames: this.anims.generateFrameNumbers('btn_replay', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'btn_replay_down',
            frames: this.anims.generateFrameNumbers('btn_replay_down', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'btn_quit_up',
            frames: this.anims.generateFrameNumbers('btn_quit', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'btn_quit_down',
            frames: this.anims.generateFrameNumbers('btn_quit_down', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'btn_help_close_up',
            frames: this.anims.generateFrameNumbers('btn_help_close', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'btn_help_close_down',
            frames: this.anims.generateFrameNumbers('btn_help_close_down', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'btn_rule_up',
            frames: this.anims.generateFrameNumbers('btn_rule', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'btn_rule_down',
            frames: this.anims.generateFrameNumbers('btn_rule_down', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'btn_music_on',
            frames: this.anims.generateFrameNumbers('btn_music_on', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'btn_music_off',
            frames: this.anims.generateFrameNumbers('btn_music_off', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'btn_sound_on',
            frames: this.anims.generateFrameNumbers('btn_sound_on', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:'btn_sound_off',
            frames: this.anims.generateFrameNumbers('btn_sound_off', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        
        let lineHeight = 537;
        let rope0Point = [
            {x: gameLogic.smallWheelPos.x + 15, y: gameLogic.smallWheelPos.y - 15} ,
            {x: gameLogic.bigWheelPos.x + 36, y: gameLogic.bigWheelPos.y - 15}
        ]
        let rope0ScaleY = Math.sqrt(Math.pow(rope0Point[0].x - rope0Point[1].x, 2) + Math.pow(rope0Point[0].y - rope0Point[1].y, 2)) / lineHeight;
        let rope0Rotate = -Math.atan2(rope0Point[1].x - rope0Point[0].x, rope0Point[1].y - rope0Point[0].y) * 180 / Math.PI;
        let rope1Point = [
            {x:gameLogic.smallWheelPos.x - 6, y:gameLogic.smallWheelPos.y + 3},
            {x:gameLogic.bigWheelPos.x - 18, y:gameLogic.bigWheelPos.y + 16}
        ]
        let rope1ScaleY = Math.sqrt(Math.pow(rope1Point[0].x - rope1Point[1].x, 2) + Math.pow(rope1Point[0].y - rope1Point[1].y, 2)) / lineHeight;
        let rope1Rotate = -Math.atan2(rope1Point[1].x - rope1Point[0].x, rope1Point[1].y - rope1Point[0].y) * 180 / Math.PI;
        let longRotRope = this.add.image(gameLogic.smallWheelPos.x, gameLogic.smallWheelPos.y, 'rope');
        longRotRope.setOrigin(0.5, 0);
        longRotRope.setAngle(220);
        let shortRotRope0 = this.add.image(rope0Point[0].x, rope0Point[0].y, 'rope');
        shortRotRope0.setOrigin(0.5, 0);
        shortRotRope0.setAngle(rope0Rotate);
        shortRotRope0.setScale(1, rope0ScaleY);
        let shortRotRope1 = this.add.image(rope1Point[0].x, rope1Point[0].y, 'rope');
        shortRotRope1.setOrigin(0.5, 0);
        shortRotRope1.setAngle(rope1Rotate);
        shortRotRope1.setScale(1, rope1ScaleY);
        gameLogic.smallWheel = this.add.image(gameLogic.smallWheelPos.x, gameLogic.smallWheelPos.y, 'smallWheel');
        gameLogic.bigWheel = this.add.image(gameLogic.bigWheelPos.x, gameLogic.bigWheelPos.y, 'bigWheel');
        gameLogic.cageRope = this.add.image( gameLogic.cageStartPos.x + gameLogic.cageRopeToCage.x,  gameLogic.cageStartPos.y - gameLogic.cageRopeToCage.y, 'rope');
        gameLogic.cageRope.setOrigin(0.5, 1);

        gameLogic.boss = new Character(this.add.sprite(gameLogic.bossStartPos.x, gameLogic.bossStartPos.y), {'stand': 'boss_stand'});
        gameLogic.boss.sprite.setOrigin(0.63, 1);
        gameLogic.boss.ChangeFaceTo(false);
        
        gameLogic.scoreSeat = this.add.image(gameLogic.scoreSeatPos.x, gameLogic.scoreSeatPos.y, 'scoreBack').setOrigin(0,0);
        gameLogic.scoreTitle = this.add.text(gameLogic.scoreTitlePos.x, gameLogic.scoreTitlePos.y, GetGameText('scoreTitle'), {font:"20px Arial", fill:"#0"}).setOrigin(0,0);
        gameLogic.scoreText = this.add.text(gameLogic.scoreValuePos.x, gameLogic.scoreValuePos.y, '0', {font:"20px Arial", fill:"#0"}).setOrigin(1, 0);
        gameLogic.scorePlus = this.add.text(gameLogic.scoreValuePos.x, gameLogic.scorePlusY, '+100', {font:"20px Arial", fill:"#0"}).setOrigin(1, 0).setVisible(false);
        
        gameLogic.pet = new Character(this.add.sprite( gameLogic.cageStartPos.x,  gameLogic.cageStartPos.y - gameLogic.petToCageY), {'stand': 'pet_stand', 'cry': 'pet_cry'});
        gameLogic.cage = new Character(this.add.sprite( gameLogic.cageStartPos.x,  gameLogic.cageStartPos.y), {'stand': 'cage_normal', 'dead': 'cage_broken'});
        gameLogic.player = new Character(this.add.sprite(gameLogic.playerStartPos.x, gameLogic.playerStartPos.y), {'stand': 'player_stand', 'jump': 'player_jump', 'cry':'player_cry'});
        gameLogic.chaGuide = this.add.image(0, 0, 'chaGuide').setOrigin(0.5, 1);
        gameLogic.dialogBubble = new DialogBubble(
            this.add.sprite(0, 0, 'dialog'), 
            this.add.text(130, 30, '', { font: "28px Arial Black", fill: "#0" }),
            "bubble"
        );

        gameLogic.answerSeats = [null, null, null, null];
        for (let i = 0; i < 4; i++){
            gameLogic.answerSeats[i] = new AnswerSeat(
                this.add.image(gameLogic.firstAnswerSeatX + i * gameLogic.answerSeatXDis, gameLogic.answerSeatBottom, 'answer'), 
                this.add.image(gameLogic.firstAnswerSeatX + i * gameLogic.answerSeatXDis, gameLogic.answerSeatBottom, 'answer_mask'),
                this.add.text(130, 30, '', { font: "28px Arial Black", fill: "#0" }),
                gameLogic.answerSeatY,
                gameLogic.answerSeatBottom
            );
        }

        
        let tol = this.add.text(0, 0, '', {font : '100px Arial Black', fill:"#8cc8d0"})
        gameLogic.countDownText = this.add.text(0, 0, '', {font : '100px Arial Black', fill:"#FF0204"});
        gameLogic.answerCountDown = new CountdownTimer(gameLogic.countDownText, tol, ()=>{
            gameLogic.ChangeState(GameState.AnswerTimeUp);  
        },()=>{
            gameLogic.SelectTimeUp();
        })

        //UI最前
        gameLogic.uiMask = this.add.sprite(512, 384, 'uiMask').setScale(1024 / 69, 768 / 52);
        gameLogic.answerResText = this.add.text(512, 384, GetGameText("answerRes_Correct"), {font: '120px Arial Black', fill:"#FF0204"});
        gameLogic.answerResText.setVisible(false);

        //音乐音效开关
        gameLogic.musicButton = this.add.sprite(gameLogic.musicBtnPos.x, gameLogic.musicBtnPos.y, 'btn_music_on').setInteractive();
        gameLogic.musicButton.play(gameLogic.sounds.musicOn ===true ? "btn_music_on" : "btn_music_off");
        gameLogic.musicButton.on('pointerdown', function(pointer){
            this.setTint(0x00ff00);
            gameLogic.sounds.Play('click');
        });
        gameLogic.musicButton.on('pointerout', function (pointer) {
            this.clearTint();
             document.body.style.cursor = "default";
        });
        gameLogic.musicButton.on('pointermove', function(p) {
             document.body.style.cursor = "pointer";
        });
        gameLogic.musicButton.on('pointerup', function (pointer) {
            this.clearTint();
            gameLogic.sounds.ToggleMusic();
            this.play(gameLogic.sounds.musicOn ===true ? "btn_music_on" : "btn_music_off");
        });
        gameLogic.soundButton = this.add.sprite(gameLogic.soundBtnPos.x, gameLogic.soundBtnPos.y, 'btn_sound_on').setInteractive();
        gameLogic.soundButton.play(gameLogic.sounds.soundOn ===true ? "btn_sound_on" : "btn_sound_off");
        gameLogic.soundButton.on('pointerdown', function(pointer){
            gameLogic.sounds.Play('click');
            this.setTint(0x00ff00);
        });
        gameLogic.soundButton.on('pointerout', function (pointer) {
            this.clearTint();
             document.body.style.cursor = "default";
        });
        gameLogic.soundButton.on('pointermove', function(p){
             document.body.style.cursor = "pointer";
        });
        gameLogic.soundButton.on('pointerup', function (pointer) {
            this.clearTint();
            gameLogic.sounds.ToggleSound();
            this.play(gameLogic.sounds.soundOn ===true ? "btn_sound_on" : "btn_sound_off");
        });

        //Start UI (main menu)
        gameLogic.gameTitle = this.add.image(512,  gameLogic.cageStartPos.y - gameLogic.titleToCageY, 'gameTitle').setOrigin(0.5, 0);  //笼子正下方
        gameLogic.startButton = this.add.sprite(gameLogic.startButtonPos.x, gameLogic.startButtonPos.y, 'btn_start').setInteractive();
        gameLogic.startButton.play('btn_start_up');
        gameLogic.startButton.on('pointerdown', function (pointer) {
            //this.setTint(0x00ff00);
            gameLogic.sounds.Play('click');
            this.play('btn_start_down');
        });
        gameLogic.startButton.on('pointerout', function (pointer) {
            //this.clearTint();
            this.play('btn_start_up');
             document.body.style.cursor = "default";
        });
        gameLogic.startButton.on('pointermove',  function(p){
             document.body.style.cursor = "pointer";
        });
        gameLogic.startButton.on('pointerup', function (pointer) {
            //this.clearTint();
            this.play('btn_start_up');
            if (gameLogic.gameState ===GameState.MainMenu) gameLogic.OnPlayButtonClicked();
        });
        gameLogic.ruleButton = this.add.sprite(gameLogic.ruleButtonPos.x, gameLogic.ruleButtonPos.y, 'btn_rule').setInteractive();
        gameLogic.ruleButton.play('btn_rule_up');
        gameLogic.ruleButton.on('pointerdown', function (pointer) {
            //this.setTint(0x00ff00);
            gameLogic.sounds.Play('click');
            this.play('btn_rule_down');
        });
        gameLogic.ruleButton.on('pointerout', function (pointer) {
            //this.clearTint();
            this.play('btn_rule_up');
             document.body.style.cursor = "default";
        });
        gameLogic.ruleButton.on('pointermove', function(p){
             document.body.style.cursor = "pointer";
        });
        gameLogic.ruleButton.on('pointerup', function (pointer) {
            //this.clearTint();
            this.play('btn_rule_up');
            if (gameLogic.gameState ===GameState.MainMenu) gameLogic.ShowTutorial();
        });

        

        //结算面板(先得最地下一层的boss)
        gameLogic.resultBossWithCage = new Character(this.add.sprite(gameLogic.bossStartPos.x, gameLogic.bossStartPos.y), {'stand': 'boss_stand'});
        gameLogic.resultBossWithCage.setVisible(false);
        gameLogic.resultBossWithCage.sprite.x = gameLogic.resultCageBossStartPos.x;
        gameLogic.resultBossWithCage.sprite.y = gameLogic.resultCageBossStartPos.y;

        gameLogic.resultPanel = this.add.image(0, 0, "resultPanel").setOrigin(0.5, 0);
        gameLogic.resultTitle = new Character(this.add.sprite(0, 0), {'stand': 'resultLogo_win', 'win': 'resultLogo_win', 'lose':'resultLogo_lose', 'perfect':'resultLogo_perfect'});
        gameLogic.resultTitle.sprite.setOrigin(0.5, 0.5);
        gameLogic.resultText = this.add.text(0, 0, GetGameText("resultScore"), {font:"40px Arial", fill:"#0"}).setOrigin(0.5, 0.5);
        
        // gameLogic.resultKey = [
        //     this.add.text(0, 0, GetGameText("resultKeyCorrect"), {font:"30px Arial", fill:"#0"}).setOrigin(0, 0),
        //     this.add.text(0, 0, GetGameText("resultKeyWrong"), {font:"30px Arial", fill:"#0"}).setOrigin(0, 0),
        //     this.add.text(0, 0, GetGameText("resultKeyTime"), {font:"30px Arial", fill:"#0"}).setOrigin(0, 0)
        // ];      
        // gameLogic.resultValue = [
        //     this.add.text(0, 0, "fuckme", {font:"30px Arial", fill:"#0"}).setOrigin(1, 0),
        //     this.add.text(0, 0, "fuckme", {font:"30px Arial", fill:"#0"}).setOrigin(1, 0),
        //     this.add.text(0, 0, "fuckme", {font:"30px Arial", fill:"#0"}).setOrigin(1, 0)
        // ];    
        gameLogic.replayButton = this.add.sprite(0, 0, 'btn_replay').setInteractive();
        gameLogic.replayButton.play('btn_replay_up');
        gameLogic.replayButton.on('pointerdown', function (pointer) {
            gameLogic.sounds.Play('click');
            this.play('btn_replay_down');
        });
        gameLogic.replayButton.on('pointerout', function (pointer) {
            this.play('btn_replay_up');
            document.body.style.cursor = "default";
        });
        gameLogic.replayButton.on('pointermove', function (pointer) {
            document.body.style.cursor = "pointer";
        });
        gameLogic.replayButton.on('pointerup', function (pointer) {
            this.play('btn_replay_up');
            if (gameLogic.gameState ===GameState.Win || gameLogic.gameState ===GameState.Lose) gameLogic.OnGameStart();
        });
        
        gameLogic.quitButton = this.add.sprite(0, 0, 'btn_quit').setInteractive();
        gameLogic.quitButton.play('btn_quit_up');
        gameLogic.quitButton.on('pointerdown', function (pointer) {
            gameLogic.sounds.Play('click');
            this.play('btn_quit_down');
        });
        gameLogic.quitButton.on('pointerout', function (pointer) {
            this.play('btn_quit_up');
            document.body.style.cursor = "default";
        });
        gameLogic.quitButton.on('pointermove', function (pointer) {
            document.body.style.cursor = "pointer";
        });
        gameLogic.quitButton.on('pointerup', function (pointer) {
            this.play('btn_quit_up');
            window.location.assign(gameConfig.mainPageUrl);
        });
        
        gameLogic.HideResultPanel();

        gameLogic.resultBoss = this.add.image(gameLogic.resultBossStartPos.x, gameLogic.resultBossStartPos.y, "boss_fly");
        gameLogic.resultBoss.setVisible(false);
        gameLogic.resultPlane = this.add.image(gameLogic.resultPlaneStartPos.x, gameLogic.resultPlaneStartPos.y, "winPlane");
        gameLogic.resultPlane.setVisible(false);
        gameLogic.resultUsePet = new Character(this.add.sprite( 0,0), {'stand': 'pet_stand', 'cry': 'pet_cry'});
        gameLogic.resultUsePet.sprite.setVisible(false);
        gameLogic.resultWinPlayer = new Character(this.add.sprite(0,0), {'stand': 'player_stand', 'jump': 'player_jump', 'cry':'player_cry'});
        gameLogic.resultWinPlayer.sprite.setVisible(false);
        gameLogic.resultCage = new Character(this.add.sprite( gameLogic.cageStartPos.x,  gameLogic.cageStartPos.y), {'stand': 'cage_normal', 'dead': 'cage_broken'});
        gameLogic.resultCage.setVisible(false);
        //gameLogic.resultCage.sprite.setOrigin(0.5, 0);
        gameLogic.resultCryGuy = this.add.image(gameLogic.resultPlaneStartPos.x, gameLogic.resultPlaneStartPos.y, "failCry");
        gameLogic.resultCryGuy.setVisible(false);
        gameLogic.resultFlight = this.add.image(gameLogic.resultPlaneStartPos.x, gameLogic.resultPlaneStartPos.y, "winFlight");

        //新手引导
        gameLogic.tutorialWindow = this.add.image(512, 384, 'tutorial');
        gameLogic.tutorialWindow.setVisible(false);
        gameLogic.tutorialButton = this.add.sprite(512 + gameLogic.tutorialBtnOffset.x, 384 + gameLogic.tutorialBtnOffset.y, 'btn_quit').setInteractive();    //故意用quit范围大点
        gameLogic.tutorialButton.setVisible(false);
        gameLogic.tutorialButton.play('btn_help_close_up');
        gameLogic.tutorialButton.on('pointerdown', function (pointer) {
            gameLogic.sounds.Play('click');
            this.play('btn_help_close_down');
        });
        gameLogic.tutorialButton.on('pointerout', function (pointer) {
            this.play('btn_help_close_up');
            document.body.style.cursor = "default";
        });
        gameLogic.tutorialButton.on('pointermove', function (pointer) {
            document.body.style.cursor = "pointer";
        });
        gameLogic.tutorialButton.on('pointerup', function (pointer) {
            this.play('btn_help_close_up');
            if (gameLogic.gameState ===GameState.MainMenu_Help) gameLogic.HideTutorial();
        });
        
        gameLogic.copyRight.render();

        //同步
        gameLogic.posSync.Add("cageLine", gameLogic.cageRope, gameLogic.cage.sprite, {x:gameLogic.cageRopeToCage.x, y:gameLogic.cageRopeToCage.y});   //绳子和笼子
        gameLogic.posSync.Add("petBubble", gameLogic.dialogBubble.sprite, gameLogic.pet.sprite, {x:60, y:-gameLogic.pet.sprite.height / 2});
        gameLogic.posSync.Add("chaGuide", gameLogic.chaGuide, gameLogic.player.sprite, {x: 0, y:-gameLogic.chaGuideToPlayer});

        gameLogic.posSync.Add("resPanelTitle", gameLogic.resultTitle.sprite, gameLogic.resultPanel);
        gameLogic.posSync.Add("resReplayButton", gameLogic.replayButton, gameLogic.resultPanel, {x: gameLogic.resultRetryBtnOffset.x, y:gameLogic.resultRetryBtnOffset.y});
        gameLogic.posSync.Add("resQuitButton", gameLogic.quitButton, gameLogic.resultPanel, {x: gameLogic.resultQuitBtnOffset.x, y:gameLogic.resultQuitBtnOffset.y});
        gameLogic.posSync.Add("resText", gameLogic.resultText, gameLogic.resultPanel, gameLogic.resultScoreTextOffset);
        gameLogic.posSync.Add("playerToFlight", gameLogic.resultWinPlayer.sprite, gameLogic.resultPlane, {x:gameLogic.resultPlayerAtFlight.x, y:gameLogic.resultPlayerAtFlight.y});
        gameLogic.posSync.Add("petToFlight", gameLogic.resultUsePet.sprite, gameLogic.resultFlight, {x:gameLogic.resultPetAtFlight.x, y:gameLogic.resultPetAtFlight.y});
        gameLogic.posSync.Add("resCageToBoss", gameLogic.resultCage.sprite, gameLogic.resultBossWithCage.sprite, gameLogic.resultCageToBoss);
        gameLogic.posSync.Add("cryGuyToResPanel", gameLogic.resultCryGuy, gameLogic.resultPanel, {x:0, y:10});
        // for (let i = 0; i < 3; i++){
        //     gameLogic.posSync.Add("resKey"+i, gameLogic.resultKey[i], gameLogic.resultPanel, {x: gameLogic.resultKeyOffset.x, y:gameLogic.resultKeyOffset.y + i * gameLogic.resultLineDistance});
        //     gameLogic.posSync.Add("resVal"+i, gameLogic.resultValue[i], gameLogic.resultPanel, {x: gameLogic.resultValueOffset.x, y:gameLogic.resultValueOffset.y + i * gameLogic.resultLineDistance});
        // }
        
        //gameLogic.posSync.Add("gameLogic.tutorialButton", gameLogic.tutorialButton, gameLogic.tutorialWindow, {x: gameLogic.tutorialBtnOffset.x, y:gameLogic.tutorialBtnOffset.y});

        // let aa = this.add.text(100, 100, "fuck me", { font: "28px Arial Black", fill: "#0" });
        // aa.setText("Fuck you too");
        // //console.log(aa.text)

        //宠物开始跳跳
        gameLogic.SetPetAlwaysJumpJump();

        // this.scoreSeat.setVisible(false);
        // this.scoreTitle.setVisible(false);
        // this.scoreText.setVisible(false);
        // this.scorePlus.setVisible(false);
        gameLogic.ChangeState(GameState.MainMenu);
    }

    cursorSetToPointer(b){
        if (b == true){
            document.body.style.cursor = "pointer";
        }else{
            document.body.style.cursor = "default";
        }
    }

    update (curTime, delta){
        //Controls
        let goConfirm = gameLogic.inputs.down.isDown;
        let goLeft = gameLogic.inputs.left.isDown;
        let goRight = gameLogic.inputs.right.isDown;
        let goUp = gameLogic.inputs.up.isDown;
        
        if (!gameLogic) return;

        //根据状态执行的
        switch (gameLogic.gameState){
            case GameState.MainMenu:{
                if (goConfirm) gameLogic.OnPlayButtonClicked();
                // if (goUp){
                //     let pId = Math.random() < 0.5 ? 0 : 1;
                //     //console.log(pId);
                //     pet.ChangeToPet(pId);
                // }
            }break;
            case GameState.MainMenu_Help :{

            }break;
            case GameState.Starting : {

            }break;
            case GameState.Questioning : {

            }break;
            case GameState.WaitingAnswer: {
                if (gameLogic.canControl ===true){
                    if (goConfirm){
                    gameLogic.SelectAnswer();
                    }else if (goLeft){
                        if (gameLogic.answerIndex > 0) gameLogic.PlayerJump(gameLogic.answerIndex - 1);
                    }else if (goRight){
                        if (gameLogic.answerIndex < 3) gameLogic.PlayerJump(gameLogic.answerIndex + 1);
                    }
                }

                gameLogic.answerCountDown.Update(delta);
            }break;
            case GameState.AnswerTimeUp:{
            gameLogic.answerCountDown.Update(delta);
            }break;
            case GameState.Judge: {

            }break;
        }

        //Performance
        gameLogic.posSync.Update(delta);

        gameLogic.player.Update(delta);
        gameLogic.boss.Update(delta);
        gameLogic.pet.Update(delta);
        gameLogic.dialogBubble.Update(delta);
        gameLogic.cage.Update(delta);
        for (let i = 0; i < gameLogic.answerSeats.length; i++){
        gameLogic.answerSeats[i].Update(delta);
        }
        
        gameLogic.timeline.Update(delta);
    }
}


