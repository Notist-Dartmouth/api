import chai, { expect } from 'chai'
import * as types from '../common/constants'
import reducer from '../common/routes/CardList/reducer'

// Remove this
import fakeDB from '../server/fakeDB.js'

describe('CardList Reducer', () => {
  const initialState = {
    lastFetched: null,
    isLoading: false,
    error: null,
    data: []
  }

  it('should return default state if action is undefined', () => {
    const nextState = reducer(initialState, 'BLAH')
    expect(nextState).to.deep.equal(initialState)
  })

  it('should handle LOAD_CARDS_REQUEST', () => {
    const action = {
      type: types.LOAD_CARDS_REQUEST
    }

    const expectedNextState = {
      lastFetched: null,
      isLoading: true,
      error: null,
      data: []
    }

    const nextState = reducer(initialState, action)
    expect(nextState).to.deep.equal(expectedNextState)
  })

  it('should handle LOAD_CARDS_SUCCESS', () => {
    const currentTime = Date.now()

    const action = {
      type: types.LOAD_CARDS_SUCCESS,
      payload: fakeDB,
      meta: {
        lastFetched: currentTime
      }
    }

    const expectedNextState = {
      lastFetched: currentTime,
      isLoading: false,
      error: null,
      data: fakeDB
    }

    const nextState = reducer(initialState, action)
    expect(nextState).to.deep.equal(expectedNextState)
  })

  it('should handle LOAD_CARDS_FAILURE', () => {
    const error = new Error('Invalid request')
    const action = {
      type: types.LOAD_CARDS_FAILURE,
      payload: error,
      error: true
    }

    const expectedNextState = {
      lastFetched: null,
      isLoading: false,
      error: error,
      data: []
    }
    const nextState = reducer(initialState, action)
    expect(nextState).to.deep.equal(expectedNextState)
  })
})
