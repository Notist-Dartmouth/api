import { LOAD_POSTS_REQUEST, LOAD_POSTS_SUCCESS, LOAD_POSTS_FAILURE } from '../../constants';

/* I'm being a bad dude and disabling some eslint rules on a per file basis -- Byrne */
/* eslint-disable import/prefer-default-export */

export function loadPosts() {
  return (dispatch, getState, { axios }) => {
    const { protocol, host } = getState().sourceRequest;
    dispatch({ type: LOAD_POSTS_REQUEST });
    return axios.get(`${protocol}://${host}/api/v0/posts`)
      .then((res) => {
        dispatch({
          type: LOAD_POSTS_SUCCESS,
          payload: res.data,
          meta: {
            lastFetched: Date.now(),
          },
        });
      })
      .catch((error) => {
        console.error(`Error in reducer that handles ${LOAD_POSTS_SUCCESS}: `, error);
        dispatch({
          type: LOAD_POSTS_FAILURE,
          payload: error,
          error: true,
        });
      });
  };
}
