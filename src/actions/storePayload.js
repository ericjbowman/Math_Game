import types from '../types'

export const storePayload = (payload) => (dispatch) => {
  dispatch({
    type: types.STORE_PAYLOAD,
    payload, // obj
  })
}