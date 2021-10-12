# Rose Game

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

## About Rose Game and Arcade Library
* Rose Game is a sample game created using [Arcade Library](https://github.com/commontown/arcade-library).
* It requires loading [Phaser library](https://phaser.io/) from the web (ie. phaser-arcade-physics.min.js) as well.
