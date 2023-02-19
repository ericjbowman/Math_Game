import types from '../types'

const initialState = {
  defaultGame: {
    /* current level determines speed */
    currentLevel: 1,
    /* nextLevel is how many right answers player needs for next level */
    nextLevel: 3,
    /* Every level is faster by a factor of speedScaling */
    speedScaling: 0.1,
    /* player must beat x * levelScaling more levels to get to the next level */
    levelScaling: 2,
    /* Number of milliseconds it takes for wall to animate height of screen */
    wallSpeed: 5000,
    /* milliseconds until next player movement */
    frameRate: 16,
    /* pixels moved every frame */
    playerSpeed: 15,
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
  currentDifficulty: 0,
  difficultyData: {
    0: {
      label: 'Easy',
      choiceRange: 10,
      min: 0,
      max: 9,
    },
    1: {
      label: 'Medium',
      choiceRange: 8,
      min: 0,
      max: 15,
    },
    2: {
      label: 'Hard',
      choiceRange: 6,
      min: -10,
      max: 20,
    }
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