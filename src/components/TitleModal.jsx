import React from 'react'
import {connect} from 'react-redux'
import '../styles/Modal.css'
import {storePayload} from '../actions/storePayload'

function TitleModal(props) {
  function onChangeDifficulty(e) {
    const currentDifficulty = parseInt(e.target.value)
    props.storePayload({
      currentDifficulty,
      /* change how much faster wall gets each level based on difficulty */
      defaultGame: {
        ...props.defaultGame,
        speedScaling: props.defaultGame.speedScaling + (currentDifficulty / 10),
      }
    })
  }
  return (
    <div className="modal title-modal" ref={props.titleModalRef}>
    <p className="font-big">Welcome!</p>
    <p>Controls:</p>
    <p className="font-small">Left: A</p>
    <p className="font-small">Right: D</p>
    <p>How to play:</p>
    <p className="font-small">Move your ship to a lane with the correct answer to the math problem at the top of the screen</p>
    <p>Choose Your difficulty</p>
    <form id="difficulty-form" onChange={onChangeDifficulty}>
      {Object.keys(props.difficultyData).map((lvl, i) => {
        return (
          <div className="radio-btn-container" key={`difficulty-${i}`}>
            <label
              htmlFor={`difficulty-${i}`}
            >
              {props.difficultyData[i].label}
            </label>
            <input
              type="radio"
              id={`difficulty-${i}`}
              name="difficulty"
              value={i}
              checked={props.currentDifficulty == i}
            />
          </div>
        )
      })}
    </form>
    <button onClick={props.onClickPlay} className="modal-btn">
      Play
    </button>
  </div>
  )
}

const mapStateToProps = (state) => ({
  difficultyData: state.userReducer.difficultyData,
  currentDifficulty: state.userReducer.currentDifficulty,
  defaultGame: state.userReducer.defaultGame,
})

export default connect(
    mapStateToProps,
    {storePayload},
)(TitleModal)