# Save My Pets

## Installations
1. Create .npmrc file
2. Add the following codes into the newly created .npmrc file.
```
@commontown:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=<your_personal_access_token>
```
3. Replace `<your_personal_access_token>` with your token. 
4. Run `npm install`. If it's not working, you maybe lacking the access to [Arcade Library](https://github.com/commontown/arcade-library). Please request for access accordingly.
5. Installations are done at this point. You may run `npm start` to begin playing the game.

## Sample Game Data
###langVersion, string, use "zh" to display Chinese, "en" to display English.
###character & pet & monster, int, don't change unless there is an alternative one.
###question_time, int, change to adjust question time.
###correct_point & incorrect_point, int, change to adjust scores when answer correctly or wrong.
###bgm & win_music & lose_music, string, change to adjust musics.
###bkg, int, this is background picture, don't change unless there is an alternative one.
###total_question, don't change because the game process is designed with 6 questions, less or more will cause unpredictable problems.
###mainPageUrl, string, when click back button, the page will open this link. We haven't test it under the real environment.
{
    "config":{
        "langVersion":"zh", 
        "character" : 0,
        "pet" : 0,  
        "monster": 0,    
        "question_time": 10,  
        "correct_point": 200, 
        "incorrect_point": 100,  
        "bgm" : "bgm.mp3",     
        "win_music": "jingle_win.mp3",    
        "lose_music": "jingle_lose.mp3",
        "bkg": "0",       
        "total_question": 6, 
        "mainPageUrl" : "http://www.baidu.com"
    },
    "questions":[
        {"question":"以下哪个是名词？", "answer":["森林", "报名", "跳跃", "赶紧"], "correct":0},
        {"question":"以下哪个是动词？", "answer":["鲜", "跑", "嫩", "快"], "correct":1},
        {"question":"以下哪个是名词？", "answer":["一早", "长长", "勤奋", "邻居"], "correct":3},
        {"question":"以下哪个是动词？", "answer":["小心", "美丽", "举行", "花纹"], "correct":2},
        {"question":"以下哪个是名词？", "answer":["斑马", "找到", "果然", "最后"], "correct":0},
        {"question":"以下哪个是形容词？", "answer":["跑", "青", "找", "笑"], "correct":1}
    ]
}