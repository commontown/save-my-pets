import React from 'react';
import './App.css';
import Game  from './games/Game';
import SaveMyPets from './games/SaveMyPets';

function App() {
  const { search } = document.location;
  const games = {
    ro:SaveMyPets,
  };
  const gid = search.replace(/^.*g=(.\w+).*$/,'$1');
  const game = games[gid] || SaveMyPets;
  const comp = (game && <Game type={game}/>);
  return (
    <div className="App">
      {comp}
    </div>
  );
}

export default App;
