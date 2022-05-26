import React, {useState, useEffect, useRef} from 'react'
import {connect} from 'react-redux'
import {storePayload} from '../actions/storePayload'

function Player(props) {
  // const playerPhysicsRef = useRef(props.playerPhysics)
  const playerRef = useRef()
  const setPlayerPhysics = (data) => {
    // playerPhysicsRef.current = data
    props.storePayload({
      playerPhysics: data,
    })
  }

  useEffect(() => {
    movePlayer()
  }, [props.playerPhysics])

  // function onKeyPress(e) {
  //   if (e.key === 'a') { // left
  //     setPlayerPhysics({
  //       ...playerPhysicsRef.current,
  //       left: true,
  //       right: false,
  //     })
  //   } else if (e.key === 'd') { // right
  //     setPlayerPhysics({
  //       ...playerPhysicsRef.current,
  //       left: false,
  //       right: true,
  //     })
  //   }
  // }

  // function onKeyUp(e) {
  //   if (e.key === 'a') { // left
  //     setPlayerPhysics({
  //       ...playerPhysicsRef.current,
  //       left: false,
  //     })
  //   } else if (e.key === 'd') { // right
  //     setPlayerPhysics({
  //       ...playerPhysicsRef.current,
  //       right: false,
  //     })
  //   }
  // }

  function movePlayer() {
    const isNotAtRightLimit =
      props.playerPhysicsRef.current.x < props.gameplayContainerRef.current.offsetWidth - props.playerStyle.width
    const isNotAtLeftLimit = props.playerPhysicsRef.current.x > 0
    if (props.playerPhysics.right && isNotAtRightLimit) {
      setPlayerPhysics({
        ...props.playerPhysicsRef.current,
        x: props.playerPhysicsRef.current.x + 1
      })
    } else if (props.playerPhysics.left && isNotAtLeftLimit) {
      setPlayerPhysics({
        ...props.playerPhysicsRef.current,
        x: props.playerPhysicsRef.current.x - 1
      })
    }
  }
  return (
    <div
      style={{
        transform: `translate(${props.playerPhysics.x}px, 0)`,
        width: `${props.playerStyle.width}px`,
        height: `${props.playerStyle.height}px`,
        // width: 0,
        // height: 0,
        // border: `${playerStyle.height / 2}px solid transparent`,
        // borderTop: 0,
        // borderBottom: `${playerStyle.height}px solid ${playerStyle.color}`,
      }}
      className="player"
      ref={playerRef}
    />
  )
}

const mapStateToProps = (state) => ({
  playerStyle: state.userReducer.playerStyle,
  playerPhysics: state.userReducer.playerPhysics,
})

export default connect(
    mapStateToProps,
    {storePayload},
)(Player)
