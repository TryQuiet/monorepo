import { combineReducers } from 'redux-immutable'

import identityHandlers from './handlers/identity'
import notificationsHandlers from './handlers/notifications'
import importedChannelHandlers from './handlers/importedChannel'
import channelHandlers from './handlers/channel'
import channelsHandlers from './handlers/channels'
import nodeHandlers from './handlers/node'
import ratesHandlers from './handlers/rates'
import vaultHandlers from './handlers/vault'
import vaultUnlockerHandlers from './handlers/vaultUnlocker'
import modalsHandlers from './handlers/modals'
import operationsHandlers from './handlers/operations'
import pendingMessagesHandlers from './handlers/pendingMessages'
import criticalErrorHandlers from './handlers/criticalError'

export default combineReducers({
  operations: operationsHandlers.reducer,
  pendingMessages: pendingMessagesHandlers.reducer,
  modals: modalsHandlers.reducer,
  identity: identityHandlers.reducer,
  notifications: notificationsHandlers.reducer,
  importedChannel: importedChannelHandlers.reducer,
  rates: ratesHandlers.reducer,
  channel: channelHandlers.reducer,
  channels: channelsHandlers.reducer,
  node: nodeHandlers.reducer,
  vault: vaultHandlers.reducer,
  vaultUnlocker: vaultUnlockerHandlers.reducer,
  criticalError: criticalErrorHandlers.reducer
})
