import {
    langVersion
} from '../SaveMyPets'

const rpStr = "<p>";

const LocalizeText = {
    "zh":{
        "petSayOnIntro" : '救我出去', //游戏开始画面上的宠物说话
        "petSayOnGameStart" : "答对问题\n救我出去",    //游戏开始后宠物先说的话
        "timeUp" : "超时",          //答题超时
        "scoreTitle" : "得分：",    //计分板标题
        "answerCorrect" : "答对了！\n真聪明！", //答对问题时
        "petJustSaved" : "得救了\n最后"+rpStr+"题分数很高哦", //刚飞到逃命点
        "monsterComes" : "加油！\n大怪物要来了",    //回答错误，小怪说打怪要来了

        "resultKeyCorrect":"答对",          //结算画面的”正确“
        "resultKeyWrong":"答错",            //结算画面的”错误“
        "resultKeyTime":"时间",             //结算画面的”时间"
        "resultPoints":"题",                //结算面板那个得分值
        "resultScore":"得分：" + rpStr + "%", //结算面板百分比得分
    },
    "en":{
        "petSayOnIntro" : 'Save me !', //游戏开始画面上的宠物说话
        "petSayOnGameStart" : "Answer the questions\nTo save me out",  //游戏开始后宠物先说的话
        "timeUp" : "TimeUp",          //答题超时
        "scoreTitle" : "Score: ",    //计分板标题
        "answerCorrect" : "Correct！\nClever！", //答对问题时
        "monsterComes" : "Warning!\nMonster is comming!",    //回答错误，小怪说打怪要来了

        "resultKeyCorrect":"Correct",          //结算画面的”正确“
        "resultKeyWrong":"Wrong",            //结算画面的”错误“
        "resultKeyTime":"Time",             //结算画面的”时间"
        "resultPoints":"Point"+rpStr,                //结算面板那个得分值
        "resultScore":"Score: " + rpStr + "%", //结算面板百分比得分
    }
}

export function GetGameText(key, replaceTo = []){
    let r = LocalizeText[langVersion][key];
    if (replaceTo && replaceTo.length > 0){
        for (let i = 0; i < replaceTo.length; i++){
            r = r.replace(/<p>/, replaceTo[i]);
        }
    }
    return r;
}