import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { StoreKeys } from '@quiet/nectar'
import { Socket } from 'socket.io-client'
import { FixedTask } from 'typed-redux-saga'

export class SocketState {
  public isConnected: boolean = false
}

export interface WebsocketConnectionPayload {
  dataPort: number
}

export interface CloseConnectionPayload {
  task: FixedTask<Generator>
}

export interface SetConnectedPayload {
  socket: Socket
}

export const socketSlice = createSlice({
  initialState: { ...new SocketState() },
  name: StoreKeys.Socket,
  reducers: {
    startConnection: (state, _action: PayloadAction<WebsocketConnectionPayload>) => state,
    suspendConnection: state => {
      state.isConnected = false
    },
    setConnected: state => {
      state.isConnected = true
    }
  }
})

export const socketActions = socketSlice.actions
export const socketReducer = socketSlice.reducer
