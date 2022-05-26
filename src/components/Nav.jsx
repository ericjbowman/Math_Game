import React from 'react'
import {connect} from 'react-redux'

/* Renders player level, score, and math problem */
function Nav(props) {
  return (
    <nav>
      <div className='level-container'>
        <p>Level</p>
        <p className="score">{props.playerStats.currentLevel}</p>
      </div>
      <div className="problem">
        {props.mathProblem.problemString}
      </div>
      <div className="score-container">
        <p>Score</p>
        <p className="score">{props.playerStats.right}</p>
      </div>
    </nav>
  )
}

const mapStateToProps = (state) => ({
  mathProblem: state.userReducer.mathProblem,
  playerStats: state.userReducer.playerStats,
})

export default connect(
    mapStateToProps,
)(Nav)
