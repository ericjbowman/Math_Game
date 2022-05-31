import React from 'react'
import {connect} from 'react-redux'

function Player(props) {
  return (
    <div
      style={{
        transform: `translate(${props.playerPhysics.x}px, 0)`,
        width: `${props.playerStyle.width}px`,
        height: `${props.playerStyle.height}px`,
      }}
      className="player"
      ref={props.playerRef}
    />
  )
}

const mapStateToProps = (state) => ({
  playerStats: state.userReducer.playerStats,
  playerStyle: state.userReducer.playerStyle,
  playerPhysics: state.userReducer.playerPhysics,
  playerStyle: state.userReducer.playerStyle,
  playerLane: state.userReducer.playerLane,
})

export default connect(
    mapStateToProps,
)(Player)
