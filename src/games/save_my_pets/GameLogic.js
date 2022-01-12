import{
    gameConfig, 
    gameQuestions
}from '../SaveMyPets';
import {
    Phaser,
    Copyright,
    portalReportHighscore
} from '@commontown/arcade-library';
import {
    Timeline,
    TimelineNode
} from './Timeline';
import {
    GetGameText
}from './Text';
import { Question } from './GameElements';

export class GameLogic{
    player;     //Character 玩家的小人
    pet;        //Character 宠物
    cage;       //Character 笼子
    boss;       //Character 大怪物
    answerSeats;    //AnswerSeat[4] 答题座椅
    smallWheel;     //Sprite 小齿轮
    bigWheel;       //Sprite 大齿轮
    cageRope;   //Sprite 笼子上面那跟绳子
    dialogBubble;  //DialogBubble 答题泡泡
    chaGuide;   //Sprite 角色头上的提示

    answerResText;  //Text 答对答错的提示

    resultPanel;    //Sprite 结果面板的底板
    resultTitle;    //Character 结果面板的标题图片
    //resultKey;      //Text[] 结果面板那3个标签，答对什么的
    //resultValue;    //Text[] 结果面板那3个值，答对多少，打错多少之类的
    resultText;     //Text 结果的那个数字
    replayButton;   //Sprite 重玩按钮
    quitButton;     //Sprite 退出按钮
    resultBoss;     //Image 飞上去的boss
    resultPlane;    //Image 飞上去的飞机
    resultFlight;   //Image 横过来飞的飞机
    resultCryGuy;   //Image 失败以后哭泣的主角
    resultWinPlayer;    //Sprite 胜利后用的玩家
    resultUsePet;       //Sprite 失败或者胜利后用的宠物
    resultBossWithCage; //Sprite 提着笼子的boss
    resultCage;         //Sprite boss提着的笼子

    scoreSeat;  //Sprite 得分板的底板
    scoreTitle; //Text 得分2个字
    scoreText;  //Text 得分值
    scorePlus;  //Text 加分

    startButton;    //Sprite 开始按钮
    ruleButton;     //Sprite 规则按钮
    gameTitle;      //Image 开始的标题

    uiMask;     //Sprite UI的遮罩
    musicButton;    //Sprite 音乐开关
    soundButton;    //Sprite 声音开关

    tutorialWindow; //Image 说明的面板
    tutorialButton; //Sprite 说明关闭按钮

    currentScore = 0;   //int 【重置为0】当前分数
    currentCorrect = 0; //int 【重置为0】答对多少
    currentWrong = 0;   //int 【重置为0】答错多少
    currentTime = 0;    //float 【用了多少秒】

    questions;          //Question[] 这轮游戏要遇到的所有题目
    currentQuestion;    //Question 当前的问题
    answerIndex = 3;    //Int 【重置为3】玩家当前选择的答案
    canControl = false;  //Bool 是否接受玩家输入
    answerCountDown;    //CountdownTimer 答题倒计时

    questionIndex = -1; //int 【重置为-1如果要播放动画的话】玩家当前是第几题
    questionCount = 6;  //int 一共多少题，如果questionIndex >= this.questionCount - 1，就会获胜
    wrongCount = 0;     //int 【重置为0】 玩家答错了几题，这是为了表现动画的，所以可以和currentWrong不同，那个是标准计数

    gameState;      //Enum(GameState) 游戏状态

    inputs;         //phaser输入
    posSync;        //PositionSynchronizer 坐标同步器
    sounds;         //SoundManager 音乐管理

    copyRight;      //CopyRight 大概是商标吧

    timeline;       //Timeline 游戏中的表现管理器

    petFree = true; //bool 宠物是否空闲，如果不空闲，就不会跳跳了
    petJumpDelay = 1000;    //int 单位毫秒，宠物下次跳的间隔是多少

    answerSeatY = 780;  //答题按钮的位置
    answerSeatBottom = 820; //踩下去以后石头的高度
    answerSeatXDis = 240;   //每个答案石头之间的坐标距离
    answerSeatHeight = 150;
    firstAnswerSeatX = (1024 - 945 + 225) / 2;    //最左边的石头位置
    tableUpInSec = 1.00;    //1秒内桌子升起来
    tableDownInSec = 0.50;  //0.5秒内桌子下去

    scoreSeatPos = {x:10, y:10};    //计分板位置
    scoreTitlePos = {x:this.scoreSeatPos.x + 13, y:this.scoreSeatPos.y + 31}; //积分标题位置
    scoreValuePos = {x:this.scoreSeatPos.x + 208, y:this.scoreSeatPos.y + 31};    //积分值位置
    scorePlusY = this.scoreValuePos.y + 40;  //加分值初始位置

    bossStartPos = {x:1100, y:755}; //boss的初始位置
    bossMoveX = [
        [1270, 1340, 1700],   //向右移动，分2次，第三个数字给移动后置为这个值并转身
        [1282, 960],
        [300, -1500]
        //[1382, 1282],
        //[1024, 740]
    ]

    cageStartPos = {x:512, y:240};   //笼子开始位置
    cageBottom = 450;   //笼子下到最底下的位置
    cageFallTo = 1000;  //笼子彻底掉下去的位子
    petDownPointWhileCageFall = {x:470, y:510}; //笼子掉下去的时候，宠物飞到这个位置，然后向左上角的最后位置飞
    petFinalPos = {x:208, y:450};   //宠物最后飞到这个位置
    cageTotalDown = 3;  //笼子最多下降3次，3次之后就变宠物飞出了
    eachTimeCageDown = (this.cageBottom - this.cageStartPos.y) / this.cageTotalDown; //每次下降多少
    cageHasDown = 0;    //【重置为0】笼子已经下降了多少次了
    petToCageY = 50;    //宠物脚到笼子底的偏移
    cageRopeToCage = {x:12, y:-130};   //笼子的y到绳子的y

    startButtonPos = {x: 350, y: 600};  //开始按钮位置
    ruleButtonPos = {x: 1024-350, y:600};   //规则按钮位置
    titleToCageY = 110;  //标题到笼子下方

    smallWheelPos = {x:70, y:380};  //小齿轮的位置
    bigWheelPos = {x:173, y:525};   //大齿轮的位置

    playerStartPos = {x: 1300, y: this.answerSeatY - this.answerSeatHeight};
    playerSelectedAnswerY = this.answerSeatBottom - this.answerSeatHeight;    //玩家选择了一个答案之后的y坐标（石头踩下去了）
    playerJumpY = this.playerStartPos.y - 120;  //角色跳起来以后y最多到这里

    musicBtnPos = {x:900, y:40} //音乐开关位置
    soundBtnPos = {x:980, y:45}    //声音开关位置
    chaGuideToPlayer = 130; //主角脚下往上这么多显示chaGuide

    // resultPanelAnchor = {x:261, y:244};     //结果面板的锚点
    // resultPanelStartPos = {x: 512, y:-500}; //结果面板初始位置
    // resultPanelFinalPos = {x: 512, y:384};  //结果面板最终位置
    // resultTitleOffset = {x:0, y:120-this.resultPanelAnchor.y};        //结果面板中标题画面的位置
    // resultKeyOffset = {x:150-this.resultPanelAnchor.x, y:220-this.resultPanelAnchor.y}    //第一行标题“答对”所在的坐标
    // resultValueOffset = {x:370-this.resultPanelAnchor.x, y:220-this.resultPanelAnchor.y}  //第一行结果所在的坐标
    resultScoreTextOffset = {x:0, y:296};  //结果得分位于面板位置
    resultLineDistance = 45;                 //三行字的字间距
    resultRetryBtnOffset = {x:-160,y:460}    //重来按钮的位置
    resultQuitBtnOffset = {x:160, y:460}    //退出按钮位置
    resultWaitSec = 0.1;                    //大白马老师说，出现结果之前要等等。
    resultBossStartPos = {x:512, y:1000};   //结局大boss起飞点
    resultBossFlyTo = {x:512, y:-800};     //结局大boss飞到这里
    resultPlaneStartPos = {x:512, y:1000};  //结局大飞机起点
    resultPlaneFlyTo = {x:512, y:-800};    //结局大飞机最终飞到
    resultFlightStartPos = {x: 1500, y:190};    //结局飞机右边起点
    resultFlightFlyTo = {x: 540, y:190 };       //结局飞机飞到终点下棋
    resultPanelToFlight = {x:-28, y:-40};         //面板与飞机的位置
    resultPlayerAtFlight = {x:-70, y:-20};      //结局玩家坐在飞机的位置上
    resultPetAtFlight = {x:20, y:-40};         //结局宠物坐在飞机的位置上
    resultTitlePos_Win = {x:0, y:202};        //获胜之后标题位于面板的坐标
    resultTitlePos_Lose = {x:0, y:180};
    resultCageToBoss = {x:312 - 445 - 12, y: 130 - 290};  //boss抓住笼子的位置
    resultPetToBoss = {x:this.resultCageToBoss.x, y: this.resultCageToBoss.y - this.petToCageY};  //宠物到boss
    resultCageBossStartPos = {x:1600, y: 0};    //抓着笼子的boss开始坐标
    resultCageBossFlyTo = {x:900, y: 700};      //抓着笼子的boss最终飞到这里
    resultLosePanelPos = {x: 300, y: -1000};   //失败时候，ui的位置
    resultLosePanelFlyTo = {x: 300, y: 150};   //失败界面飞到哪儿

    tutorialBtnOffset = {x:361, y:-232}; //新手引导按钮和面板的位置关系

    constructor(scene, appInfo){
        this.copyRight = new Copyright(scene, appInfo);
    }


    GetCurrentScore = (correct)=>{
        return correct === true ? 
            gameConfig.correct_point :
            -(Math.min(this.currentScore, gameConfig.incorrect_point));
    }


    //答题座椅上升
    TableUp = (index, nextNodes = [])=>{
        index = Math.min(Math.max(0, index), 3);

        let startY = this.answerSeats[index].sprite.y;
        let speed = Phaser.Math.GetSpeed(this.answerSeatBottom - this.answerSeatY, this.tableUpInSec);

        let tn = new TimelineNode(this.answerSeats[index].sprite, (target, timeElapsed)=>{
            target.y = startY - timeElapsed * speed;
            if (target.y <= this.answerSeatY){
                target.y = this.answerSeatY;
                return true;
            }else{
                return false;
            }
        }, nextNodes);
        this.timeline.AddTimelineNode(tn);
    }

    //答题座椅下降
    TableDown = (index, nextNodes = []) =>{
        index = Math.min(Math.max(0, index), 3);
        let startY = this.answerSeats[index].sprite.y;
        let speed = Phaser.Math.GetSpeed(this.answerSeatBottom - this.answerSeatY, this.tableDownInSec);

        let tn = new TimelineNode(this.answerSeats[index].sprite, (target, timeElapsed)=>{
            target.y = startY + timeElapsed * speed;
            if (target.y >= this.answerSeatBottom){
                target.y = this.answerSeatBottom;
                return true;
            }else{
                return false;
            }
        }, nextNodes);
        this.timeline.AddTimelineNode(tn);
    }

    //返回玩家左右跳的timelineNode
    GetPlayerJumpTimelineNode = (toIndex, nextNodes = []) => {
        toIndex = Math.min(Math.max(0, toIndex), 3);
        let inTime = 0.3;   //0.3秒内完成跳跃
        let tarX = this.answerSeats[toIndex].sprite.x;
        let xDis = tarX - this.player.sprite.x;
        let xSpd = Phaser.Math.GetSpeed(xDis, inTime);
        let startX = this.player.sprite.x;
        let maxHeight = this.playerStartPos.y - this.playerJumpY;

        let tn = new TimelineNode(this.player.sprite, (target, timeElapsed)=>{
            let moved = xSpd * timeElapsed;
            let it = inTime * 1000;
            target.x = startX + moved;
            let md = timeElapsed / it * Math.PI;
            target.y = this.playerStartPos.y - Math.sin(md) * maxHeight;
            if (timeElapsed >= it){
                target.x = tarX;
                target.y = this.playerStartPos.y;
                return true;
            }else{
                return false;
            }
        });
        tn.nextNodes = nextNodes;
        return tn;
    }

    //返回播放声音的timelineNode
    GetPlaySound = (key, nextNodes = []) =>{
        return new TimelineNode(null, (t, tp)=>{
            this.sounds[key].play();
            return true;
        }, nextNodes);
    }

    //返回宠物跳跃的timelineNode
    GetPetJumpTimelineNode = (nextNodes = []) => {
        let petY = this.pet.sprite.y;
        let jHeight = 30;       //宠物跳跃高度
        let inTime = 300;   //0.3秒完事儿

        return new TimelineNode(this.pet.sprite, (target, timeElapsed)=>{
            if (timeElapsed <= 0){
                this.petFree = false;
                this.sounds.Play("idle");
            }
            let md = timeElapsed / inTime * Math.PI;
            target.y = petY - jHeight * Math.sin(md);
            if (timeElapsed >= inTime){
                target.y = petY;
                this.petFree = this.PetShouldBeFree();
                return true;
            }else{
                return false;
            }
        }, nextNodes);
    }

    //小宠物始终蹦跶的那个timeline
    SetPetAlwaysJumpJump = ()=>{
        this.timeline.AddTimelineNode(new TimelineNode(null, (t, timeElapsed)=>{
            if (timeElapsed >= this.petJumpDelay){
                if (this.petFree ===true){
                    this.timeline.AddTimelineNode(this.GetPetJumpTimelineNode([this.GetPetJumpTimelineNode()]))
                }
                this.petJumpDelay = Math.random() * 5000 + 3000 + timeElapsed; //5-8秒跳跳
            }
            return;
        }))
    }

    //返回一个等多少秒完事儿的timelineNode
    GetWait = (inSec, nextNodes = []) => {
        let t = inSec * 1000;
        let tn = new TimelineNode(null, (target, tp)=>{
            return tp >= t;
        })
        tn.nextNodes = nextNodes;
        return tn;
    }

    //玩家选择指令时候左右跳
    PlayerJump = (toIndex) =>{
        this.timeline.AddTimelineNode(this.GetPlayerJumpTimelineNode(toIndex, [
            new TimelineNode(null, (t, e)=>{
                this.player.Play("stand");   
                this.chaGuide.setVisible(this.questionIndex <= 0);
                this.canControl = true;
                return true;
            })
        ]));
        this.canControl = false;
        this.chaGuide.setVisible(false);
        this.player.Play('jump');
        this.sounds.Play('jump');
        if (this.answerIndex < toIndex){
            this.player.ChangeFaceTo(false);
        }else if (this.answerIndex > toIndex){
            this.player.ChangeFaceTo(true);
        }
        this.answerIndex = toIndex;
    }

    //宠物在游戏开始前说”答对问题救我出去，然后跳几下"
    GetPetPerformOnStart = (nextNodes = [])=>{
        //上来先说话
        let tn = new TimelineNode(null, (t, ela)=>{
            this.dialogBubble.ShowText(GetGameText("petSayOnGameStart"));
            return true;
        }, [this.GetWait(0.1,
            [this.GetPetJumpTimelineNode(
                [this.GetPetJumpTimelineNode(
                    [this.GetWait(0.6, nextNodes)]
                )]
            )]    
        )]);
        return tn;
    }

    //玩家按下开始按钮之后开始游戏
    OnPlayButtonClicked = ()=>{
        if (this.gameState !== GameState.MainMenu) return;

        this.pet.sprite.y = this.cageStartPos.y - this.petToCageY; //强行把小宠物拉回来
        this.dialogBubble.Hide();

        this.ChangeState(GameState.Starting);
        this.startButton.setVisible(false);
        for (let i = 0; i< this.answerSeats.length; i++){
            this.TableUp(i);
        }
        let tn = this.GetWait(0.7);
        let pj = this.GetPlayerJumpTimelineNode(this.answerIndex);
        let pp = this.GetPetPerformOnStart([new TimelineNode(null, (t, e)=>{
            this.ChangeState(GameState.Questioning);
            return true;
        })]);

        tn.nextNodes.push(pj);
        pj.nextNodes.push(pp);
        
        this.timeline.AddTimelineNode(tn);
    }

    //获得计分板加分timeline
    ScoreBoardPlusScore = (addScore)=>{
        this.scorePlus.y = this.scorePlusY;
        this.scorePlus.alpha = 1;
        this.currentScore += addScore;
        this.scorePlus.setText((addScore >= 0 ? "+" : "") + addScore.toString());
        
        let inTime = 0.3;
        let speed = Phaser.Math.GetSpeed(this.scorePlusY - this.scoreValuePos.y, inTime);
        return new TimelineNode(this.scorePlus, (target, timeElapsed)=>{
            if (timeElapsed <= 0){
                this.scorePlus.setVisible(true);
            }
            target.y = this.scorePlusY - timeElapsed * speed;
            if (target.y <= this.scoreValuePos.y){
                target.y = this.scoreValuePos.y;
                return true;
            }else{
                return false;
            }
        }, [
            new TimelineNode(this.scoreText, (target, e)=>{
                target.setText(this.currentScore.toString());
                this.scorePlus.setVisible(false);
                return true;
            })
        ]);
    }

    //展示当前的题目，并且将状态切换到玩家可以操作
    OnShowQuestion = (tableUp)=>{
        //出题并且跳转状态
        this.player.Play("stand");
        let tn  = new TimelineNode(null, (t, te)=>{
            this.dialogBubble.ShowText(this.currentQuestion.question, true);
            let qc = Math.min(this.currentQuestion.answer.length, this.answerSeats.length);
            for (let i = 0; i < qc; i++){
                this.answerSeats[i].SetText(this.currentQuestion.answer[i]);
            }
            this.ChangeState(GameState.WaitingAnswer);
            return true;
        });
        if (tableUp === true){
            for (let i = 0; i < 4; i++){
                this.TableUp(i);
            }
            //角色升起来
            let yDis = this.playerStartPos.y - this.player.sprite.y;
            let startY = this.player.sprite.y;
            let speed = Phaser.Math.GetSpeed(yDis, this.tableUpInSec);
            this.timeline.AddTimelineNode(new TimelineNode(this.player.sprite, (target, timeElapsed)=>{
                target.y = startY + speed * timeElapsed;
                if (timeElapsed >= this.tableUpInSec * 1000){
                    target.y = this.playerStartPos.y;
                    return true;
                }else{
                    return false;
                }
            }, [tn]));
        }else{
            this.timeline.AddTimelineNode(tn);
        }
        
    }

    //选择了某个答案，肯定是answerIndex那个
    SelectAnswer = () => {
        this.ChangeState(GameState.Judge);
        let correct = (this.answerIndex ===this.currentQuestion.rightIndex);
        if (correct ===true){
            this.currentCorrect += 1;
        }else{
            this.currentWrong += 1;
        }
        this.currentTime += gameConfig.question_time - this.answerCountDown.time;
        //console.log("time used", this.currentTime, this.answerCountDown.time, (gameConfig.question_time - this.answerCountDown.time));

        this.TableDown(this.answerIndex);
        
        let startY = this.player.sprite.y;
        let yDis = this.playerSelectedAnswerY - startY;
        let speed = Phaser.Math.GetSpeed(yDis, this.tableDownInSec);
        this.timeline.AddTimelineNode(new TimelineNode(this.player.sprite, (target, timeElapsed)=>{
            //角色跟着石头一起下去，下去之后判断结果了
            target.y = startY + speed * timeElapsed;
            if (target.y >= this.playerSelectedAnswerY){
                target.y = this.playerSelectedAnswerY;
                return true;
            }else{
                return false;
            }
        }, this.DealWithAnswerResult(false)));
    }
    //玩家没做出选择，超时了
    SelectTimeUp = ()=>{
        this.ChangeState(GameState.Judge);
        this.currentWrong += 1;   //int 【重置为0】答错多少
        this.currentTime += gameConfig.question_time;    //float 【用了多少秒】

        for (let i = 0; i < 4; i++){
            this.TableDown(i);
        }
        
        let startY = this.player.sprite.y;
        let yDis = this.playerSelectedAnswerY - startY;
        let speed = Phaser.Math.GetSpeed(yDis, this.tableDownInSec);
        this.timeline.AddTimelineNode(new TimelineNode(this.player.sprite, (target, timeElapsed)=>{
            //角色跟着石头一起下去，下去之后判断结果了
            target.y = startY + speed * timeElapsed;
            if (target.y >= this.playerSelectedAnswerY){
                target.y = this.playerSelectedAnswerY;
                //console.log("Table move done");
                return true;
            }else{
                return false;
            }
        }, [this.GetWait(0.2 ,this.DealWithAnswerResult(true))]));
    }

    //根据答题结果做不同的表现，返回nextNodes（TimelineNode[])
    DealWithAnswerResult = (timeUp)=>{
        
        let correct = (!(timeUp === true)) && (this.answerIndex ===this.currentQuestion.rightIndex);
        let tn = new TimelineNode(null, (t, e)=>{
            this.dialogBubble.Hide();
            this.player.Play(correct ===true ? "jump" : "cry");
            // if (correct ===true){
            //     this.player.Play("jump");
            // }else{
            //     this.player.Play("stand");
            // }
            return true;
        }, 
        correct ===true ? (
            this.cageHasDown ===this.cageTotalDown ? this.Correct_CageFall() : 
                (this.cageHasDown < this.cageTotalDown ? this.Correct_CageDown() : this.Correct_NoCage())
        ):(
            this.Wrong_MonsterMove()
        ));

        this.answerCountDown.Reset();

        //屏幕中间的正确错误提示，先关闭掉
        // if (timeUp === false){
        //     this.answerResText.setText(GetGameText(correct == true ? "answerRes_Correct" : "answerRes_Wrong"));
        //     this.answerResText.setOrigin(0.5, 0.5);
        //     this.answerResText.setVisible(true);
        // }
        

        if (correct ===true){
            this.cageHasDown += 1;   //笼子下降次数总是要+1
        }
        
        return [tn];
    }

    //答对1：在笼子里，笼子下降
    Correct_CageDown = (nextNodes = [])=>{
        let inTime = 800;   //多少毫秒内完事儿
        let cageStartY = this.cage.sprite.y;
        let petStartY = this.cage.sprite.y - this.petToCageY;//this.pet.sprite.y;
        let wheelDegreePlus = 170;
        let bwa = this.bigWheel.angle;
        let swa = this.smallWheel.angle;

        let ct = new TimelineNode(this.cage.sprite, (target, timeElapsed)=>{
            let v = timeElapsed / inTime;
            target.y = cageStartY + this.Ease_CageDown(v) * this.eachTimeCageDown;
            if (timeElapsed >= inTime){
                target.y = cageStartY + this.eachTimeCageDown;
            }
            return timeElapsed >= inTime;
        });
        let swr = new TimelineNode(this.smallWheel, (target, timeElapsed)=>{
            target.setAngle(swa + this.Ease_CageDown(timeElapsed / inTime) * wheelDegreePlus);
            return timeElapsed >= inTime;
        });
        let bwr = new TimelineNode(this.bigWheel, (target, timeElapsed)=>{
            target.setAngle(bwa - this.Ease_CageDown(timeElapsed / inTime) * wheelDegreePlus);
            return timeElapsed >= inTime;
        });
        let pt = new TimelineNode(this.pet.sprite, (target, timeElapsed)=>{
            if (timeElapsed <= 0){
                this.sounds.Play('correct');
            }
            let v = timeElapsed / inTime;
            target.y = petStartY + this.Ease_CageDown(v) * this.eachTimeCageDown;
            if (timeElapsed >= inTime){
                target.y = petStartY + this.eachTimeCageDown;
            }
            return timeElapsed >= inTime;
        }, [
            this.ScoreBoardPlusScore(this.GetCurrentScore(true)), 
            new TimelineNode(null, (t, timeElapsed)=>{
                if (timeElapsed <= 0){
                    this.dialogBubble.ShowText(GetGameText('answerCorrect'));
                }else if (timeElapsed >= 800){  //显示800毫秒
                    this.dialogBubble.Hide();
                    this.ChangeState(GameState.Questioning);
                    return true;
                }
                return false;
            }, nextNodes)
        ]);
        return [ct, swr, bwr, pt];
    }
    Ease_CageDown = (v)=>{
        let p = 0.8;  //前面80%的时间下降，最后5%弹回
        let b = 1.05;   //最多达到这么多
        if (v <= p){
            let t = v / p;
            return Math.pow(t, 3) * b;
        }else{
            let t = (v - p) / (1 - p);
            return b - t * (b - 1);
        }
    }
    //答对2：笼子掉下去飞走了
    Correct_CageFall = ()=>{
        let cageStartY = this.cage.sprite.y;
        let cageMoveDis = this.cageFallTo - cageStartY;
        let cageFallInTime = 300;   //毫秒内完事儿
        let cf = new TimelineNode(this.cage.sprite, (target, timeElapsed)=>{
            if (timeElapsed <= 0){
                this.cage.Play("dead");
                this.cageRope.setVisible(false);
                this.sounds.Play('correct');
            }
            target.y = this.Ease_CageFall(timeElapsed / cageFallInTime) * cageMoveDis + cageStartY;
            return timeElapsed >= cageFallInTime;
        },[
            this.ScoreBoardPlusScore(this.GetCurrentScore(true))
        ]);

        let wheelRollInTime = 1800;
        let wheelDegreePlus = 780;
        let swa = this.smallWheel.angle;
        let bwa = this.bigWheel.angle;
        let swr = new TimelineNode(this.smallWheel, (target, timeElapsed)=>{
            target.setAngle(swa + this.Ease_PetMoveBeSlower(timeElapsed / wheelRollInTime) * wheelDegreePlus);
            return timeElapsed >= wheelRollInTime;
        });
        let bwr = new TimelineNode(this.bigWheel, (target, timeElapsed)=>{
            target.setAngle(bwa - this.Ease_PetMoveBeSlower(timeElapsed / wheelRollInTime) * wheelDegreePlus);
            return timeElapsed >= wheelRollInTime;
        });

        let petStart = {x:this.pet.sprite.x, y:this.pet.sprite.y};
        let toMidDis = {x:this.petDownPointWhileCageFall.x - petStart.x, y:this.petDownPointWhileCageFall.y - petStart.y};
        let toDestDis = {x:this.petFinalPos.x - this.petDownPointWhileCageFall.x, y:this.petFinalPos.y - this.petDownPointWhileCageFall.y};
        let totalDis = toMidDis.x + toDestDis.x;    //只检查x就好
        let totalInTime = 900;  //这点毫秒内完成全程移动
        let toMiddleInTime = totalInTime * toMidDis.x / totalDis;
        let toDestInTime = totalInTime - toMiddleInTime;
        let bubbleShowTime = 1000;  //泡泡显示1000毫秒
        let pf = new TimelineNode(this.pet.sprite, (target, timeElapsed)=>{
            if (timeElapsed <= toMiddleInTime){
                let cpt = timeElapsed / toMiddleInTime;
                target.x = petStart.x + this.Ease_PetMoveBeSlower(cpt) * toMidDis.x;
                target.y = petStart.y + this.Ease_PetMoveBeSlower(cpt) * toMidDis.y;
            }else{
                let cpt = (timeElapsed - toMiddleInTime) / toDestInTime;
                target.x = this.petDownPointWhileCageFall.x + this.Ease_PetMoveBeFaster(cpt) * toDestDis.x;
                target.y = this.petDownPointWhileCageFall.y + this.Ease_PetMoveBeFaster(cpt) * toDestDis.y;
            }
            if (target.x <= this.petFinalPos.x){
                target.x = this.petFinalPos.x;
                target.y = this.petFinalPos.y;
                return true;
            }
            return false;
        },[
            new TimelineNode(null, (t, timeElapsed)=>{
                if (timeElapsed <= 0){
                    let questionRest = gameConfig.total_question - 1 - this.questionIndex;
                    if (questionRest <= 0){
                        if (this.Game_Win() ===true) this.ChangeState( GameState.Win );
                        return true;
                    }else{
                        this.dialogBubble.ShowText(GetGameText("petJustSaved", [questionRest]));    //TODO 先写死还有2题，因为我也不知道还有几题
                    }
                }else if (timeElapsed >= bubbleShowTime){
                    this.dialogBubble.Hide();
                    this.ChangeState(this.Game_Win() ===true ? GameState.Win : GameState.Questioning);
                    return true;
                }
                return false;
            })
        ]);

        return [cf, swr, bwr, pf];
    }
    Ease_CageFall = (v)=>{
        return Math.pow(v, 3);
    }
    Ease_PetMoveBeSlower = (v)=>{
        return 1 - Math.pow(1 - v, 2);
    }
    Ease_PetMoveBeFaster = (v)=>{
        return Math.pow(v, 2);
    }
    //答对3：飞在天上
    Correct_NoCage = (nextFunc) => {
        //轮子还是要转动的，因为底座是机关，只是笼子没有了
        let inTime = 800;   //多少毫秒内完事儿
        let wheelDegreePlus = 170;
        let bwa = this.bigWheel.angle;
        let swa = this.smallWheel.angle;
        // let swr = new TimelineNode(this.smallWheel, (target, timeElapsed)=>{
        //     target.setAngle(swa + this.Ease_CageDown(timeElapsed / inTime) * wheelDegreePlus);
        //     return timeElapsed >= inTime;
        // });
        // let bwr = new TimelineNode(this.bigWheel, (target, timeElapsed)=>{
        //     target.setAngle(bwa - this.Ease_CageDown(timeElapsed / inTime) * wheelDegreePlus);
        //     return timeElapsed >= inTime;
        // });
        //改成宠物原地跳2下说答对了
        let pt = this.GetPetJumpTimelineNode([this.GetPetJumpTimelineNode([
            this.ScoreBoardPlusScore(this.GetCurrentScore(true)), 
            new TimelineNode(null, (t, timeElapsed)=>{
                if (timeElapsed <= 0){
                    this.sounds.Play("correct");
                    this.dialogBubble.ShowText(GetGameText('answerCorrect'));
                }else if (timeElapsed >= 800){  //显示800毫秒
                    this.dialogBubble.Hide();
                    this.ChangeState(this.Game_Win() ===true ? GameState.Win : GameState.Questioning);
                    return true;
                }
                return false;
            })
        ])]);
        return [pt]; //[swr, bwr, pt];
    }

    //回答错误，返回也得是TimelineNode[]
    Wrong_MonsterMove = ()=>{
        let tarPosX = this.bossMoveX[this.wrongCount];
        let inTime = 400;   //400毫秒一次移动
        let inSec = inTime / 1000;
        let startX = this.boss.sprite.x;
        let toChangeFace = this.wrongCount ===0;
        let waitSec = 0.1; //等待100毫秒之后再次移动
        let speed = [
            Phaser.Math.GetSpeed(tarPosX[0] - this.boss.sprite.x, inSec),
            Phaser.Math.GetSpeed(tarPosX[1] - tarPosX[0], inSec)
        ]
        let res = []
        //减分
        let addScore = this.GetCurrentScore(false);
        if (addScore !== 0) res.push(this.ScoreBoardPlusScore(addScore));
        //笼子鼓一下
        res.push(new TimelineNode(this.cage.sprite, (target, timeElapsed)=>{
            let inTime = 200;
            let scaleOri = 1;
            let scaleMax = 1.1;
            let scaled = Math.sin(timeElapsed / inTime * Math.PI) * (scaleMax - scaleOri) + scaleOri;
            target.setScale(scaled, scaled);
            if (timeElapsed <= 0){
                this.dialogBubble.ShowText(GetGameText("monsterComes"));
            }else
            if (timeElapsed >= inTime){
                target.setScale(scaleOri, scaleOri);
                return true;
            }
            return false;
        }));    
        //龙移动
        res.push(new TimelineNode(this.boss.sprite, (target, timeElapsed)=>{
            if (timeElapsed <= 0){
                this.sounds.Play("monsterComing");
            }
            target.x = startX + timeElapsed * speed[0];
            if (timeElapsed >= inTime){
                target.x = tarPosX[0];
                return true;
            }
            return false;
        }, [
            this.GetWait(waitSec, [
                new TimelineNode(this.boss.sprite, (target, timeElapsed)=>{
                    target.x = tarPosX[0] + timeElapsed * speed[1];
                    if (timeElapsed >= inTime){
                        //target.x = tarPosX[1];
                        target.x = tarPosX.length > 2 ? tarPosX[2] : tarPosX[1];
                        if (toChangeFace ===true){
                            this.boss.ChangeFaceTo(true);  
                        }
                        this.wrongCount += 1;
                        if (this.Game_Lose() ===true){
                            this.ChangeState(GameState.Lose);
                        }else if (this.Game_Win() ===true){
                            this.ChangeState(GameState.Win);
                        }else{
                            this.ChangeState(GameState.Questioning);
                        }
                        this.dialogBubble.Hide();
                        return true;
                    }
                    return false;
                })
            ])
        ]));
        return res;
    }

    //隐藏结果界面
    HideResultPanel = ()=>{
        this.resultPanel.setVisible(false);
        this.resultText.setVisible(false);
        this.resultTitle.sprite.setVisible(false);
        this.quitButton.setVisible(false);
        this.replayButton.setVisible(false);
    }

    //回到标题画面
    OnGameStart = ()=>{
        this.currentScore = 0;
        this.currentCorrect = 0; //int 【重置为0】答对多少
        this.currentWrong = 0;   //int 【重置为0】答错多少
        this.currentTime = 0;    //float 【用了多少秒】
        this.answerIndex = 3;
        this.questionIndex = -1;
        this.wrongCount = 0;    
        this.cageHasDown = 0;

        this.GatherQuestions();

        this.boss.SetPos(this.bossStartPos.x, this.bossStartPos.y, true, false);
        this.cageRope.setVisible(true);
        this.scoreText.setText("0");
        this.pet.SetPos(this.cageStartPos.x, this.cageStartPos.y - this.petToCageY, true, true);
        this.cage.SetPos(this.cageStartPos.x, this.cageStartPos.y, false, true);
        this.cage.Play("stand");
        this.cage.setVisible(true);
        this.player.SetPos(this.playerStartPos.x, this.playerStartPos.y, true, true);
        this.dialogBubble.Hide();
        for (let i = 0; i < 4; i++){
            this.answerSeats[i].ResetToStart();
        }
        this.answerCountDown.Reset();
        this.resultPanel.x = 0;
        this.resultPanel.y = 0;
        this.HideResultPanel();

        this.resultBoss.x = this.resultBossStartPos.x;
        this.resultBoss.y = this.resultBossStartPos.y;
        this.resultBoss.setVisible(false);
        this.resultPlane.x = this.resultPlaneStartPos.x;
        this.resultPlane.y = this.resultPlaneStartPos.y;
        this.resultPlane.setVisible(false);
        this.resultFlight.x = this.resultFlightStartPos.x;
        this.resultFlight.y = this.resultFlightStartPos.y;
        this.resultFlight.setVisible(false);
        this.resultWinPlayer.sprite.setVisible(false);
        this.resultUsePet.sprite.setVisible(false);
        this.resultBossWithCage.setVisible(false);

        this.resultCage.setVisible(false);
        this.resultCryGuy.setVisible(false);

        this.player.sprite.setVisible(true);
        this.boss.sprite.setVisible(true);
        this.pet.sprite.setVisible(true);

        this.ChangeState(GameState.MainMenu);
    }

    //胜利失败的时候，对话框结算界面出现
    OnGameOver = (win)=>{
        // this.resultValue[0].setText(this.currentCorrect.toString() + GetGameText("resultPoints", [this.currentCorrect > 1 ? "s" : ""]));
        // this.resultValue[1].setText(this.currentWrong.toString() + GetGameText("resultPoints", [this.currentWrong > 1 ? "s" : ""]));
        // this.resultValue[2].setText(this.GetTimeText(this.currentTime));
        this.answerResText.setVisible(false);
        this.answerCountDown.Reset();
        
        //Init game over
        this.resultText.setText(GetGameText("resultScore", [this.GetAnswerRightRateText()]));
        this.posSync.ResetTarget("resPanelTitle", this.resultPanel, (win === true ? this.resultTitlePos_Win : this.resultTitlePos_Lose));
        this.resultPanel.setVisible(true);
        this.resultPanel.setScale(1, 0);
        this.quitButton.setVisible(false);
        this.replayButton.setVisible(true);

        portalReportHighscore(this.currentScore, data => {
            console.log("Report score", data)
        });

        this.resultTitle.Play(win ===true ? (this.currentWrong <= 0 ? "perfect" : "win") : "lose");
        this.sounds.Play(win === true ? "win" : "lose");
        
   
        // let moveDis = this.resultPanelFinalPos.y - this.resultPanelStartPos.y;
        // let inTime = 600;   //0.6秒内显示
        // this.timeline.AddTimelineNode(this.GetWait(this.resultWaitSec, [new TimelineNode(this.resultPanel, (target, timeElapsed)=>{
        //     if (timeElapsed <= 0){
        //         this.resultPanel.y = this.resultPanelStartPos.y;
        //     }
        //     this.resultPanel.y = this.resultPanelStartPos.y + moveDis * this.ResultPanelDownEase(timeElapsed / inTime);
        //     if (timeElapsed >= inTime){
        //         this.resultPanel.y = this.resultPanelFinalPos.y;
        //         return true;
        //     } 
        //     return false;
        // })]));
        this.timeline.AddTimelineNode(this.GetWait(this.resultWaitSec, [
            (win === true ? this.GetResultWinTimeline() : this.GetResultLoseTimeline())
        ]));
    }
    GetTimeText = (t) =>{
        let m = Math.floor(t / 60);
        let mt = m < 10 ? ("0" + m.toString()) : m.toString();
        let s = Math.floor(t % 60);
        let st = s < 10 ? ("0" + s.toString()) : s.toString();
        return mt + ":" + st;
    }
    ResultPanelDownEase = (t)=>{
        return Math.pow(t, 2);
    }
    GetAnswerRightRateText = ()=>{
        let p = Math.round(this.currentCorrect * 100 / this.questions.length);
        return p.toString();
    }
    //赢了的表演，返回TimelineNode
    GetResultWinTimeline = ()=>{
        let planeFlyInTime = 1600;  //毫秒，大飞机飞过
        let resultPlaneStartY = this.resultPlaneStartPos.y;
        let planeFlyDis = this.resultPlaneFlyTo.y - this.resultPlaneStartPos.y;
        let flightFlyInTime = 800; //毫秒，飞机横向飞过
        let resultFlightStartX = this.resultFlightStartPos.x;
        let flightFlyDis = this.resultFlightFlyTo.x - this.resultFlightStartPos.x;
        let panelShowTime = 400;

        return new TimelineNode(this.resultPlane, (target, deltaTime)=>{
            //大飞机飞过
            if (deltaTime <= 0){
                this.resultPlane.y = resultPlaneStartY;
                this.resultPlane.setVisible(true);
                this.boss.sprite.setVisible(false);
            }
            this.resultPlane.y = resultPlaneStartY + planeFlyDis * deltaTime / planeFlyInTime;
            if (this.resultPlane.y <= this.player.sprite.y){
                this.player.sprite.setVisible(false);
            }
            if (this.resultPlane.y <= this.pet.sprite.y){
                this.pet.sprite.setVisible(false);
            }
            if (deltaTime >= planeFlyInTime){
                this.resultPlane.y = this.resultPlaneFlyTo.y;
                this.cage.setVisible(false);
                this.cageRope.setVisible(false);
                return true;
            }
            return false;
        },[
            //飞机横向飞过
            new TimelineNode(this.resultFlight, (target, deltaTime)=>{
                if (deltaTime <= 0){
                    this.resultPlane.setVisible(false);
                    this.resultFlight.x = this.resultFlightStartPos.x;
                    this.resultFlight.y = this.resultFlightStartPos.y;
                    this.posSync.ResetTarget("playerToFlight", this.resultFlight, this.resultPlayerAtFlight);
                    this.resultWinPlayer.Play("jump");
                    this.posSync.ResetTarget("petToFlight", this.resultFlight, this.resultPetAtFlight);
                    this.resultUsePet.Play("stand");
                    this.resultFlight.setVisible(true);
                    this.resultWinPlayer.sprite.setVisible(true);
                    this.resultUsePet.sprite.setVisible(true);
                }
                this.resultFlight.x = resultFlightStartX + flightFlyDis * deltaTime / flightFlyInTime;
                if (deltaTime >= flightFlyInTime){
                    this.resultFlight.x = this.resultFlightFlyTo.x;
                    return true;
                }
                return false;
            },[
                new TimelineNode(this.resultPanel, (target, deltaTime)=>{
                    if (deltaTime <= 0){
                        target.x = this.resultFlight.x + this.resultPanelToFlight.x;
                        target.y = this.resultFlight.y + this.resultPanelToFlight.y;
                    }
                    target.setScale(1, deltaTime / panelShowTime);
                    if (deltaTime >= panelShowTime){
                        target.setScale(1, 1);
                        this.quitButton.setVisible(true);
                        this.replayButton.setVisible(true);
                        this.resultTitle.sprite.setVisible(true);
                        this.resultText.setVisible(true);
                        return true;
                    }
                    return false;
                })
            ])
        ]);
    }
    //输了的表演，返回TimelineNode
    GetResultLoseTimeline= ()=>{
        let bossFlyInTime = 800;  //毫秒，大怪物
        let resultBossStartY = this.resultBossStartPos.y;
        let bossFlyUpDis = this.resultBossFlyTo.y - this.resultBossStartPos.y;
        let bossFlyIntoTime = 800; //毫秒，怪物横向飞过
        let bossFlyDis = {
            x: this.resultCageBossFlyTo.x - this.resultCageBossStartPos.x,
            y: this.resultCageBossFlyTo.y - this.resultCageBossStartPos.y
        };
        let panelShowTime = 400;
        let panelFlyDis = this.resultLosePanelFlyTo.y - this.resultLosePanelPos.y;

        return new TimelineNode(this.resultBoss, (target, deltaTime)=>{
            //大怪物飞过
            if (deltaTime <= 0){
                this.resultBoss.y = resultBossStartY;
                this.resultBoss.setVisible(true);
                this.boss.sprite.setVisible(false);
            }
            this.resultBoss.y = resultBossStartY + bossFlyUpDis * deltaTime / bossFlyInTime;
            //console.log("REsult boss pos" + this.resultBoss.y + ">" + this.resultBoss.visible);
            if (this.resultBoss.y <= this.player.sprite.y){
                this.player.sprite.setVisible(false);
            }
            if (this.resultBoss.y <= this.pet.sprite.y){
                this.pet.sprite.setVisible(false);
            }
            if (this.resultBoss.y <= this.cage.sprite.y){
                this.cage.setVisible(false);
                this.cageRope.setVisible(false);
            }
            if (deltaTime >= bossFlyInTime){
                this.resultBoss.y = this.resultBossFlyTo.y;
                return true;
            }
            return false;
        },[
            //大怪物飞进场子
            new TimelineNode(this.resultBossWithCage, (target, deltaTime)=>{
                if (deltaTime <= 0){
                    this.resultBoss.setVisible(false);
                    this.resultBossWithCage.sprite.x = this.resultCageBossStartPos.x;
                    this.resultBossWithCage.sprite.y = this.resultCageBossStartPos.y;
                    this.posSync.ResetTarget("petToFlight", this.resultBossWithCage.sprite, this.resultPetToBoss);
                    this.resultUsePet.Play("cry");
                    this.resultBossWithCage.setVisible(true);
                    this.resultCage.setVisible(true);
                    this.resultUsePet.setVisible(true);
                }
                this.resultBossWithCage.sprite.x = this.resultCageBossStartPos.x + bossFlyDis.x * deltaTime / bossFlyIntoTime;
                this.resultBossWithCage.sprite.y = this.resultCageBossStartPos.y + bossFlyDis.y * deltaTime / bossFlyIntoTime;
                if (deltaTime >= bossFlyIntoTime){
                    this.resultBossWithCage.sprite.x = this.resultCageBossFlyTo.x;
                    this.resultBossWithCage.sprite.y = this.resultCageBossFlyTo.y;
                    return true;
                }
                return false;
            },[
                new TimelineNode(this.resultPanel, (target, deltaTime)=>{
                    if (deltaTime <= 0){
                        target.setScale(1, 1);
                        target.x = this.resultLosePanelPos.x;
                        target.y = this.resultLosePanelPos.y;
                        this.resultCryGuy.setVisible(true);
                    }
                    target.y = this.resultLosePanelPos.y + deltaTime / panelShowTime * panelFlyDis;
                    if (deltaTime >= panelShowTime){
                        target.y = this.resultLosePanelFlyTo.y;
                        this.quitButton.setVisible(true);
                        this.replayButton.setVisible(true);
                        this.resultTitle.sprite.setVisible(true);
                        this.resultText.setVisible(true);
                        return true;
                    }
                    return false;
                })
            ])
        ]);
    }

    //显示新手引导
    ShowTutorial = ()=>{
        this.ChangeState(GameState.MainMenu_Help);
        this.tutorialWindow.setVisible(true);
        let inTime = 400;   //这点毫秒内显示面板
        this.timeline.AddTimelineNode(new TimelineNode(this.tutorialWindow, (target, timeElapsed)=>{
            if (timeElapsed <= 0){
                target.setScale(1, 0);
            }
            target.setScale(1, Math.min(1, timeElapsed / inTime));
            if (timeElapsed >= inTime){
                target.setScale(1, 1);
                this.tutorialButton.setVisible(true);
                return true;
            }
            return false;
        }))
    }

    //关闭新手引导，是tutorialButton做的事情
    HideTutorial = ()=>{
        this.tutorialButton.setVisible(false);
        let inTime = 300;   //这点毫秒内显示面板
        this.timeline.AddTimelineNode(new TimelineNode(this.tutorialWindow, (target, timeElapsed)=>{
            if (timeElapsed <= 0){
                target.setScale(1, 1);
            }
            target.setScale(1, Math.max(0, 1 - timeElapsed / inTime));
            if (timeElapsed >= inTime){
                target.setScale(1, 0);
                target.setVisible(false);
                this.ChangeState(GameState.MainMenu);
                return true;
            }
            return false;
        }))
    }

    //获得本次游戏所有的题目
    GatherQuestions(){
        this.questions = [];
        console.log("GameQuestions", gameQuestions);
        if (gameQuestions.length <= gameConfig.total_question){
            let i = 0;
            while (i < gameConfig.total_question){
                this.questions.push(new Question(gameQuestions[i % gameQuestions.length], gameConfig.question_time));
                i += 1;
            }
            // this.questions.sort((q1,q2)=>{
            //     return Math.random() < 0.5 ? -1 : 1;
            // })
        }else{
            let indexes = GetRandomIndexFromArray(gameQuestions.length, gameConfig.total_question);
            for (let i = 0; i < indexes.length; i++){
                this.questions.push(new Question(gameQuestions[indexes[i]], gameConfig.question_time));
            }
        }
    }

    //设置当前题目
    SetCurrentQuestion(){
        if (!this.questions){
            console.error("no questions found");
            return;
        }
        if (this.questionIndex < this.questions.length && this.questionIndex >= 0){
            //console.log("Current Question ",  this.questions[this.questionIndex])
            this.currentQuestion = this.questions[this.questionIndex];
        }else{
            console.error("index out of range", this.questionIndex);
        }
    }




    //判断游戏是否应了
    Game_Win = ()=>{
        return this.questionIndex >= this.questionCount - 1;
    }
    Game_Lose = ()=>{
        return this.wrongCount >= 3; //答错3题就完蛋
    }

    ChangeState = (state)=>{
        let fromState = this.gameState;
        this.gameState = state;
        this.canControl = this.gameState ===GameState.WaitingAnswer;
        //console.log("ChangeState", fromState, "=>", this.gameState);

        switch (this.gameState){
            case GameState.Questioning:{
                this.answerResText.setVisible(false);
                this.questionIndex += 1; //一开始是-1，所以第一题就变0了
                this.SetCurrentQuestion();
                //TODO this.currentQuestion = ...
                this.currentQuestion.Random();
                this.answerCountDown.Reset(gameConfig.question_time);
                let showTableUp = fromState !== GameState.Starting;  //如果是来自starting的就不显示太子升起来
                this.OnShowQuestion(showTableUp);
            }break;
            case GameState.Win:{
                this.OnGameOver(true);
            }break;
            case GameState.Lose:{
                this.OnGameOver(false);
                //this.replayButton.setVisible(true);
            }break;
        }

        //宠物什么时候会随机跳跳
        this.petFree = this.PetShouldBeFree();

        //角色头上的提示框显示
        this.chaGuide.setVisible(
            this.gameState === GameState.WaitingAnswer && this.questionIndex <= 0
        );

        //不是开始画面的判断
        let noStartMenu = !(this.gameState ===GameState.MainMenu ||
            this.gameState === GameState.MainMenu_Help);

        //底座mask
        for (let i = 0; i < 4; i++){
            this.answerSeats[i].HideMask(!noStartMenu);
        }

        //得分
        this.scoreSeat.setVisible(noStartMenu);
        this.scoreTitle.setVisible(noStartMenu);
        this.scoreText.setVisible(noStartMenu);

        //游戏标题
        this.gameTitle.setVisible(
            this.gameState ===GameState.MainMenu ||
            this.gameState ===GameState.MainMenu_Help
        );
        this.startButton.setVisible(
            this.gameState ===GameState.MainMenu
        );
        this.ruleButton.setVisible(
            this.gameState ===GameState.MainMenu
        );

        //uiMask的显示
        this.uiMask.setVisible(
            this.gameState ===GameState.MainMenu ||
            this.gameState ===GameState.MainMenu_Help ||
            this.gameState ===GameState.Win ||
            this.gameState ===GameState.Lose
        );
        
    }

    //根据当前状态判断宠物是否可以跳跳
    PetShouldBeFree = ()=>{
        return (
            this.gameState ===GameState.WaitingAnswer ||
            this.gameState ===GameState.MainMenu
        ); 
    }
}

export var GameState = {
    MainMenu : 0,   //主菜单
    MainMenu_Help : 1,  //主菜单的帮助
    Starting : 2,       //游戏开始，从主菜单进入游戏
    Questioning : 3,    //出题中
    WaitingAnswer: 4,   //等待玩家选择结果
    AnswerTimeUp: 5,    //等待超时，玩家没做出回答，进入一个不可控状态
    Judge: 6,            //玩家选完了开始根据结果表演
    Win: 7,         //获胜状态
    Lose: 8,            //失败状态
    JustWait: 10,       //干等着状态，胜利失败后要等几秒导致的
}

var GetRandomIndexFromArray = (arrLen, count) => {
    let res = [];
    for (let i = 0; i < arrLen; i++){
        res.push(i);
    }
    while (res.length > count){
        let tIndex = Math.min(Math.floor(Math.random() * res.length), res.length - 1);
        res.splice(tIndex, 1);
    }

    return res;
}