import { combineReducers } from '@reduxjs/toolkit'
import { StoreKeys } from './store.keys'
import { initReducer } from './init/init.slice'
import nectarReducers from '@quiet/nectar'

export const reducers = {
  ...nectarReducers.reducers,
  [StoreKeys.Init]: initReducer
}

export const rootReducer = combineReducers(reducers)
