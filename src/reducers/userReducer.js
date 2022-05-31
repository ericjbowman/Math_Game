import types from '../types'

const initialState = {
  defaultGame: {
    /* current level determines speed */
    currentLevel: 1,
    /* nextLevel is how many right answers player needs for next level */
    nextLevel: 3,
    /* Every level is faster by a factor of speedScaling */
    speedScaling: 0.3,
    /* player must beat x * levelScaling more levels to get to the next level */
    levelScaling: 2,
    /* Number of milliseconds it takes for wall to animate height of screen */
    wallSpeed: 5000,
    /* milliseconds until next player movement */
    frameRate: 10,
    /* pixels moved every frame */
    playerSpeed: 10,
  },
  mathProblem: {
    problemString: '0 + 0 = ?',
    answer: 0,
    choices: [0, 0, 0, 0],
  },
  playerStats: {
    right: 0,
    wrong: 0,
    currentLevel: 1,
    nextLevel: 3,
  },
  playerPhysics: {
    x: 0,
    y: 0,
    left: false,
    right: false,
  }
}

export default function(state = initialState, action) {
  switch (action.type) {
    case types.STORE_PAYLOAD:
      return {
        ...state,
        ...action.payload,
      }
    default:
      return state
  }
}