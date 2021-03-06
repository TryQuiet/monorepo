import { combineReducers } from '@reduxjs/toolkit'
import { expectSaga } from 'redux-saga-test-plan'
import { StoreKeys } from '../../store.keys'
import { Socket } from 'socket.io-client'
import { SocketActionTypes } from '../../socket/const/actionTypes'

import { publicChannelsActions } from '../publicChannels.slice'
import {
  identityReducer,
  IdentityState
} from '../../identity/identity.slice'
import {
  Community,
  CommunitiesState,
  communitiesReducer
} from '../../communities/communities.slice'
import { communitiesAdapter } from '../../communities/communities.adapter'
import { identityAdapter } from '../../identity/identity.adapter'
import { createChannelSaga } from './createChannel.saga'
import { Identity } from '../../identity/identity.types'
import { PublicChannel } from '../publicChannels.types'

describe('createChannelSaga', () => {
  const socket = { emit: jest.fn(), on: jest.fn() } as unknown as Socket

  const channel: PublicChannel = {
    name: 'general',
    description: 'desc',
    owner: 'Howdy',
    timestamp: Date.now(),
    address: 'address'
  }

  const community: Community = {
    name: '',
    id: 'id',
    CA: null,
    rootCa: '',
    peerList: [],
    registrarUrl: 'registrarUrl',
    registrar: null,
    onionAddress: '',
    privateKey: '',
    port: 0,
    registrationAttempts: 0
  }

  const identity: Identity = {
    id: 'id',
    hiddenService: { onionAddress: 'onionAddress', privateKey: 'privateKey' },
    dmKeys: { publicKey: 'publicKey', privateKey: 'privateKey' },
    peerId: { id: 'peerId', pubKey: 'pubKey', privKey: 'privKey' },
    nickname: '',
    userCsr: undefined,
    userCertificate: ''
  }

  test('ask for missing messages', async () => {
    await expectSaga(
      createChannelSaga,
      socket,
      publicChannelsActions.createChannel({
        channel
      })
    )
      .withReducer(
        combineReducers({
          [StoreKeys.Identity]: identityReducer,
          [StoreKeys.Communities]: communitiesReducer
        }),
        {
          [StoreKeys.Identity]: {
            ...new IdentityState(),
            identities: identityAdapter.setAll(
              identityAdapter.getInitialState(),
              [identity]
            )
          },
          [StoreKeys.Communities]: {
            ...new CommunitiesState(),
            currentCommunity: 'id',
            communities: communitiesAdapter.setAll(
              communitiesAdapter.getInitialState(),
              [community]
            )
          }
        }
      )
      .apply(socket, socket.emit, [
        SocketActionTypes.SUBSCRIBE_TO_TOPIC,
        {
          peerId: identity.peerId.id,
          channel: channel
        }
      ])
      .run()
  })
})
