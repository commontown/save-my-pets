import React, { Component } from 'react'

class Game extends Component {

  componentDidMount() {
    const { type } = this.props;
    this.game = type(this.el);
  }

  componentWillUnmount() {
    if (this.game && this.game.destroy) 
      this.game.destroy();
  }

  render() {
    return (
      <div>
        <div id="game-root" ref={el=>this.el=el} style={{width:'100vw', height:'100vh', background:'#000'}}/>
      </div>
    )
  }
}

export default Game;
