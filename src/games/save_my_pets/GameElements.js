import {
    gameLogic,
    gameQuestions
}from '../SaveMyPets';
import{
    GetGameText
}from './Text';

export class AnswerSeat{
    sprite;     //这张图片
    mask;       //图片的mask，在start状态用的
    text;       //文字控件
    normalY;    //等待选择的时候的y
    bottomY;    //最底下的y

    textOffset = {
        x : 1, y : 66 - 156
    }

    constructor(spr, mask, txt, normalY, bottomY){
        this.sprite = spr;
        this.text = txt;
        this.mask = mask;
        this.normalY = normalY;
        this.bottomY = bottomY;
        this.sprite.setOrigin(0.5, 1);
        this.mask.setOrigin(0.5, 1);
        this.text.boundsAlignH = "middle";
        this.text.boundsAlignV = "center";
        this.text.wordWrapWidth = this.sprite.width * 0.7;
        this.text.wordWrap = true;
    }

    HideMask(b){
        this.mask.setVisible(b);
    }

    Update(delta){
        this.SynchroninzeTextAndSprite();
    }

    //回到刚开始的样子，就是在下面，并且没有文字的时候
    ResetToStart(){
        this.sprite.y = this.bottomY;
        this.SetText("");
    }

    SynchroninzeTextAndSprite(){
        this.text.y = this.sprite.y + this.textOffset.y;
        this.text.x = this.sprite.x + this.textOffset.x;
        this.mask.x = this.sprite.x;
        this.mask.y = this.sprite.y;
    }

    SetText(txt){
        this.text.setText(txt);
        this.text.setOrigin(0.5, 0.5);
    }
}

export class Character{
    sprite; //使用的精灵
    faceToRight = true;    //面向方向是否是右边
    scale = 1;  //基础的放大倍数
    actions = {};   //所有动作，key（string）就是动作名，value（string)是 this.anims.create中的key

    _playing = '';  //正在播放的动画

    constructor(spr, actions){
        this.sprite = spr;
        this.sprite.setOrigin(0.5, 1);
        this.ChangeFaceTo(true);
        this.actions = actions;
        this.Play('stand');
    }

    setVisible(v){
        this.sprite.setVisible(v);
    }

    Update(delta){
        
    }

    SetPos(x, y, resetToStand = false, faceToRight = this.faceToRight){
        this.sprite.x = x;
        this.sprite.y = y;
        this.ChangeFaceTo(faceToRight);
        if (resetToStand === true) this.Play('stand');
    }

    ChangeFaceTo(toRight = !this.faceToRight){
        this.faceToRight = toRight;
        if (this.sprite && this.sprite.setScale) this.sprite.setScale(
            (this.faceToRight === true ? 1 : -1) * this.scale, this.scale
        );
    }

    Play(actionName){
        if (this.actions[actionName]){
            this._playing = actionName;
            this.sprite.play(this.actions[actionName]);
        }
    }

    //只要changeAction，就能成为一个新的角色了
    ChangeActions(actions){
        this.actions = actions;
        this.Play(this._playing);
    }
}

export class SoundManager{
    musicOn = true; //音乐是否打开
    soundOn = true; //音效是否打开

    music;  //{name:value}所有的音乐
    sound;  //{name:value}所有的声音

    constructor(music, sound){
        this.music = music;
        this.sound = sound;
        this.LoadFromStorage();
    }

    Play(name){
        if (this.PlayMusic(name) ===false){
            this.PlaySound(name);
        }
    }

    PlayMusic(name){
        if (this.music && this.music[name]){
            this.music[name].play();
            return true;
        }else{
            return false;
        }
    }

    PlaySound(name){
        if (this.sound && this.sound[name]){
            this.sound[name].play();
            return true;
        }else {
            return false;
        }
    }

    ToggleMusic(){
        // this.musicOn = !this.musicOn;
        // let mo = this.musicOn;
        // for (let key in this.music){
        //     this.music[key].volume = mo ===true ? 1 : 0;
        // }
        this.SetMusicOn(!this.musicOn);
    }

    ToggleSound(){
        // this.soundOn = !this.soundOn;
        // let mo = this.soundOn;
        // for (let key in this.sound){
        //     this.sound[key].volume = mo ===true ? 1 : 0;
        // }
        this.SetSoundOn(!this.soundOn);
    }

    SetMusicOn(on, save = true){
        this.musicOn = on;
        for (let key in this.music){
            this.music[key].volume = on ===true ? 1 : 0;
        }
        if (save === true) this.SaveToStorage();
    }

    SetSoundOn(on, save = true){
        this.soundOn = on;
        for (let key in this.sound){
            this.sound[key].volume = on ===true ? 1 : 0;
        }
        if (save === true) this.SaveToStorage();
    }

    SaveToStorage(){
        let o = {
            musicOn : this.musicOn,
            soundOn : this.soundOn
        }
        let oj = JSON.stringify(o);
        window.localStorage.setItem('soundManager', oj);
    }
    LoadFromStorage(){
        let res = window.localStorage.getItem("soundManager");
        let r = {
            musicOn : true,
            soundOn : true
        }
        if (res !== null){
            r = JSON.parse(res);
        }
        this.SetMusicOn(r.musicOn, false);
        this.SetSoundOn(r.soundOn, false);
    }
}

export class Question{
    question;   //string, 问题文字
    answer;     //string[4]，回答内容
    rightIndex; //int，第几个回答是对的
    time;       //int，还有多久可以回答问题，毫秒

    constructor(json, answerSec){
        this.FromJson(json, answerSec);
    }

    Reset(question, answer, rightIndex, answerSec){
        let ans = new Array();
        for (let i = 0; i < answer.length; i++) ans.push(answer[i]);
        this.question = question;
        this.answer = ans;
        this.rightIndex = rightIndex;
        this.time = answerSec * 1000;
    }

    FromJson(json, answerSec){
        this.Reset(json.question, json.answer, json.correct, answerSec);
    }

    //随机一下答案
    Random(){
        let rightOne = this.answer[this.rightIndex];
        //console.log("random 1 gather answer", rightOne, this.rightIndex, this.answer);
        this.answer.sort((a, b)=>{
            return Math.random() < 0.5 ? -1 : 1;
        });
        for (let i = 0; i < this.answer.length; i++){
            if (this.answer[i] == rightOne){
                this.rightIndex = i;
                break;
            }
        }
        //console.log("random 2 got answer", rightOne, this.answer, this.rightIndex, this.answer[this.rightIndex]);
    }
}

//坐标同步管理器
export class PositionSynchronizer{
    info;   //PosSyncInfo 同步信息

    constructor(){
        this.info = [];
    }

    Update(delta){
        let i = 0;
        while (i < this.info.length){
            if (!this.info[i].follower || !this.info[i].target){
                this.info.splice(i, 1);
            }else{
                this.info[i].follower.x = this.info[i].target.x + this.info[i].offset.x;
                this.info[i].follower.y = this.info[i].target.y + this.info[i].offset.y;
                i += 1;
            }
        }
    }

    Add(key, follower, target, offset = {x:0, y:0}){
        this.info.push(new PosSyncInfo(key, follower, target, offset));
    }

    ResetTarget(key, target, offset = {x:0, y:0}){
        let pi = this.GetByKey(key);
        pi.target = target;
        pi.offset = offset;
    }

    GetByKey(key){
        for (let i = 0; i < this.info.length; i++){
            if (this.info[i].key === key){
                return this.info[i];
            }
        }
        return null;
    }

    Get(follower, target){
        for (let i = 0; i < this.info.length; i++){
            if (this.info[i].Is(follower, target) ===true){
                return this.info[i];
            }
        }
        return null;
    }

    Remove(key){
        let i = 0;
        while (i < this.info.length){
            if (this.info[i].key === key){
                this.info[i].splice(i, 1);
            }else{
                i += 1;
            }
        }
    }

    RemoveByFollower(follower){
        let i = 0;
        while (i < this.info.length){
            if (this.info[i].follower === follower){
                this.info[i].splice(i, 1);
            }else{
                i += 1;
            }
        }
    }

    RemoveByTarget(target){
        let i = 0;
        while (i < this.info.length){
            if (this.info[i].target === target){
                this.info[i].splice(i, 1);
            }else{
                i += 1;
            }
        }
    }
}

//坐标同步信息
export class PosSyncInfo{
    key;        //string 这条跟随信息的key，用于查找
    follower;   //sprite 要跟随target坐标的sprite，或者至少得带有x,y的东西
    target;     //sprite 被follower跟随的sprite，或者至少是一个有x,y的东西
    offset;     //object{x, y} 跟随时候的坐标偏移量

    constructor(key, follower, target, offset = {x:0, y:0}){
        this.key = key;
        this.follower = follower;
        this.target = target;
        this.offset = offset
    }

    Is(follower, target){
        if (!follower && !target) return false;
        if (!(follower || this.follower === follower))return false;
        if (!(target || this.target === target)) return false;
        return true;
    }
}

export class DialogBubble{
    sprite;
    text;
    sound;
    sprScale;

    constructor(spr, txt, sound){
        this.sprScale = 1;

        this.sprite = spr;
        this.sprite.setOrigin(0, 0.5);
        this.sprite.setScale(this.sprScale);
        
        this.text = txt;
        this.text.boundsAlignH = "middle";
        this.text.boundsAlignV = "center";
        this.text.wordWrapWidth = this.sprite.width * 0.7 * this.sprScale;
        this.text.wordWrap = true;
        this.text.setOrigin(0, 0.5);

        this.sound = sound;
        
        this.Hide();
    }

    ShowText(word, playSound){
        this.sprite.setVisible(true);
        this.text.setVisible(true);
        this.text.setText(word);
        if (playSound === true){
            gameLogic.sounds.Play(this.sound);
        }
    }

    Hide(){
        this.sprite.setVisible(false);
        this.text.setVisible(false);
    }

    Update(delta){
        
        this.text.x = this.sprite.x + (this.sprite.width * this.sprScale - this.text.width) / 2;
        this.text.y = this.sprite.y;
        
    }
}

export class CountdownTimer{
    text;   //他的sprite控件
    time;   //float 要显示的秒数。自动会减少，如果work的话
    working;    //bool 是否在工作中

    onZero;     //()=>void 到0的时候的回调
    onHide;     //()=>void 移除时候的回调
    _zeroExecuted;  //bool 到0的函数执行过了吗

    defaultAnswerTime = 10; //10秒答题时间

    constructor (txt, onZero, onHide){
        this.text = txt;
        this.time = 9999;
        this.working = false;
        this.onZero = onZero;
        this.onHide = onHide;
        this.text.setOrigin(0.5, 0.5);
        this.text.x = 512;
        this.text.y = 300;
    }

    //这时候答对了可以拿多少分数
    GetCorrectScore(){
        let tp = Math.floor(this.defaultAnswerTime - this.time);    //偷个懒，假设都是10秒开始的
        return tp < 4 ? (200 - tp * 20) : 100;
    }

    Reset(time = this.defaultAnswerTime){
        this.time = time;
        this.working = true;
        this._zeroExecuted = false;
        this.text.setVisible(false);
    }

    Hide(){
        this.working = false;
        this.text.setVisible(false);
        if (this.onHide) this.onHide();
    }

    Update(delta){
        if (this.working ===false)return;

        let wasTime = this.time;
        this.time -= delta / 1000;
        
        let txt =  "";
        if (this.time < 5){
            if (this.time >= 0){
                if (Math.floor(wasTime) !== Math.floor(this.time)){
                    gameLogic.sounds.Play("countdown");
                }
                txt = Math.ceil(this.time).toString();
            }else{
                txt = GetGameText("timeUp");
            }
        }

        this.text.setText(txt);
        

        if (this.time < 6){
            this.text.setVisible(true);
            if (this.time <= 0 && this._zeroExecuted ===false){
                this._zeroExecuted = true;
                if (this.onZero) this.onZero();
            }
            if (this.time < -1){        //多显示1秒超时
                this.Hide();
            }
        }
    }
}
