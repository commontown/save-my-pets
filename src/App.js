import React from 'react';
import './App.css';
import Game  from './games/Game';
import RoseGame from './games/RoseGame';

function App() {
  const { search } = document.location;
  const games = {
    ro:RoseGame,
  };
  const gid = search.replace(/^.*g=(.\w+).*$/,'$1');
  const game = games[gid] || RoseGame;
  const comp = (game && <Game type={game}/>);
  return (
    <div className="App">
      {comp}
    </div>
  );
}

export default App;
