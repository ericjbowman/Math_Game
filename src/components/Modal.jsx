import React from 'react'
import {connect} from 'react-redux'
import {storePayload} from '../actions/storePayload.js'
import '../styles/Modal.css'

function Modal(props) {
  function onChangeDifficulty(e) {
    const currentDifficulty = parseInt(e.target.value)
    console.log('props', props)
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
    <div className="modal game-over-modal" ref={props.gameOverModalRef}>
      <p>Game Over</p>
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
      <button onClick={props.onClickPlayAgain} className='modal-btn'>
        Play Again
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
)(Modal)