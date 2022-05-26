import {combineReducers} from 'redux'
import userReducer from './userReducer'

const appReducer = combineReducers({
  userReducer: userReducer,
  /* additional reducers here */
})

const rootReducer = (state, action) => {
  if (action.type === 'CLEAR_STORE') {
    state = {
      ...state,
      userReducer: undefined,
    }
  }
  return appReducer(state, action)
}

export default rootReducer