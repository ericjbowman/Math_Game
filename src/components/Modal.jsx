import React from 'react'
import '../styles/Modal.css'

export default function Modal(props) {
  return (
    <div className="modal" ref={props.gameOverModalRef}>
    <p>Game Over</p>
    <button onClick={props.onClickPlayAgain} className='modal-btn'>
      Play Again
    </button>
  </div>
  )
}