import { Web } from './vendor/buttercup'
import React from 'react'
import { render } from 'react-dom'
import { ipcRenderer } from 'electron'

import Root from './Root'
import store from './store'
import nodeHandlers from './store/handlers/node'
import appHandlers from './store/handlers/app'
import updateHandlers from './store/handlers/update'
import invitationHandlers from './store/handlers/invitation'
import importChannelHandlers from './store/handlers/importedChannel'
import coordinatorHandlers from './store/handlers/coordinator'
import waggleHandlers from './store/handlers/waggle'
import publicChannelsHandlers from './store/handlers/publicChannels'
import directMessagesHandlers from './store/handlers/directMessages'
import nodeSelectors from './store/selectors/node'
import coordinatorSelectors from './store/selectors/coordinator'
import identityHandlers from './store/handlers/identity'

import { errorNotification, successNotification } from './store/handlers/utils'
import notificationsHandlers from './store/handlers/notifications'
import appSelectors from './store/selectors/app'
import { socketsActions } from './sagas/socket/socket.saga.reducer'
import debug from 'debug'

const log = Object.assign(debug('zbay:renderer'), {
  error: debug('zbay:renderer:err')
})

if (window) {
  window.localStorage.setItem('debug', process.env.DEBUG)
}

Web.HashingTools.patchCorePBKDF()

ipcRenderer.on('bootstrappingNode', (event, { bootstrapping, message }) => {
  store.dispatch(nodeHandlers.actions.setBootstrapping(bootstrapping))
  store.dispatch(nodeHandlers.actions.setBootstrappingMessage(message))
})

ipcRenderer.on('fetchingStatus', (event, { sizeLeft, part, status, speed, eta, rescannedBlock, isFetching }) => {
  if (sizeLeft) {
    store.dispatch(nodeHandlers.actions.setFetchingSizeLeft(sizeLeft))
  }
  if (part) {
    store.dispatch(nodeHandlers.actions.setFetchingPart(part))
  }
  if (status) {
    store.dispatch(nodeHandlers.actions.setFetchingStatus(status))
  }
  if (speed) {
    store.dispatch(nodeHandlers.actions.setFetchingSpeed(speed))
  }
  if (eta) {
    store.dispatch(nodeHandlers.actions.setFetchingEndTime(eta))
  }
  if (rescannedBlock) {
    store.dispatch(nodeHandlers.actions.setRescanningProgress(rescannedBlock))
  }
  if (isFetching === 'IN_PROGRESS') {
    store.dispatch(nodeHandlers.actions.setConnectionStatus(true))
  }
  if (isFetching === 'INTERRUPTED') {
    store.dispatch(nodeHandlers.actions.setConnectionStatus(false))
  }
})

ipcRenderer.on('newUpdateAvailable', event => {
  store.dispatch(updateHandlers.epics.checkForUpdate())
})

ipcRenderer.on('onionAddress', (_, address) => {
  store.dispatch(identityHandlers.actions.setOnionAddress(address))
})

ipcRenderer.on('askForUsingDefaultBlockchainLocation', event => {
  store.dispatch(appHandlers.epics.askForBlockchainLocation())
})

ipcRenderer.on('checkDiskSpace', (event, msg) => {
  store.dispatch(notificationsHandlers.actions.enqueueSnackbar(errorNotification({ message: msg })))
})

ipcRenderer.on('successMessage', (event, msg) => {
  store.dispatch(
    notificationsHandlers.actions.enqueueSnackbar(successNotification({ message: msg }))
  )
})

ipcRenderer.on('newInvitation', (event, { invitation }) => {
  const handleInvitation = (params) => {
    if (nodeSelectors.status(store.getState()) === 'healthy') {
      store.dispatch(invitationHandlers.epics.handleInvitation(params))
    } else {
      setTimeout(() => {
        handleInvitation(params)
      }, 60000)
    }
  }
  handleInvitation(invitation)
  if (nodeSelectors.status(store.getState()) !== 'healthy') {
    store.dispatch(
      notificationsHandlers.actions.enqueueSnackbar(
        successNotification({ message: 'Please wait your invitation will be processed soon' })
      )
    )
  }
})

ipcRenderer.on('toggleCoordinator', () => {
  if (coordinatorSelectors.running(store.getState()) === true) {
    store.dispatch(coordinatorHandlers.actions.stopCoordinator())
    log('coordinator stopped')
  } else {
    store.dispatch(coordinatorHandlers.actions.startCoordinator())
    log('coordinator started')
  }
})

ipcRenderer.on('checkNodeStatus', (event, { status }) => {
  store.dispatch(nodeHandlers.epics.checkNodeStatus(status))
})

ipcRenderer.on('connectToWebsocket', (event) => {
  log('connecting to websocket')
  store.dispatch(socketsActions.connect())
})

ipcRenderer.on('waggleInitialized', (event) => {
  log('waggle Initialized')
  store.dispatch(waggleHandlers.actions.setIsWaggleConnected(true))
  store.dispatch(publicChannelsHandlers.epics.loadPublicChannels())
  store.dispatch(publicChannelsHandlers.epics.subscribeForPublicChannels())
  store.dispatch(directMessagesHandlers.epics.getAvailableUsers())
  store.dispatch(directMessagesHandlers.epics.getPrivateConversations())
  store.dispatch(directMessagesHandlers.epics.subscribeForAllConversations())
})

ipcRenderer.on('newChannel', (event, { channelParams }) => {
  const handleImport = (params) => {
    if (appSelectors.isInitialLoadFinished(store.getState()) === true) {
      store.dispatch(
        importChannelHandlers.epics.decodeChannel(
          `${params}`
        )
      )
    } else {
      store.dispatch(
        notificationsHandlers.actions.enqueueSnackbar(
          successNotification({ message: 'Please wait your channel will be imported soon' })
        )
      )
      setTimeout(() => {
        handleImport(params)
      }, 60000)
    }
  }
  handleImport(channelParams)
})

window.jdenticon_config = {
  lightness: {
    color: [0.31, 0.44],
    grayscale: [0.52, 0.57]
  },
  saturation: {
    color: 0.82,
    grayscale: 0.84
  },
  backColor: '#f3f0f6ff'
}

render(<Root />, document.getElementById('root'))

if (module.hot) {
  module.hot.accept()
}
