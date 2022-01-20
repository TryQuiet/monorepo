import { combineReducers } from '@reduxjs/toolkit'
import { expectSaga } from 'redux-saga-test-plan'
import { Socket } from 'socket.io-client'
import { identityAdapter } from '../../identity/identity.adapter'
import { identityReducer, IdentityState } from '../../identity/identity.slice'
import { Identity } from '../../identity/identity.types'
import { SocketActionTypes } from '../../socket/const/actionTypes'
import { StoreKeys } from '../../store.keys'
import { communitiesAdapter } from '../communities.adapter'
import {
  communitiesActions,
  communitiesReducer, CommunitiesState, Community
} from '../communities.slice'
import { InitCommunityPayload } from '../communities.types'
import { initCommunities, launchCommunitySaga } from './launchCommunity.saga'

describe('launchCommunity', () => {
  test('launch all remembered communities', async () => {
    const community1: Community = {
      name: '',
      id: 'id-1',
      registrarUrl: 'registrarUrl',
      CA: { rootCertString: 'certString', rootKeyString: 'keyString' },
      rootCa: '',
      peerList: [],
      registrar: null,
      onionAddress: '',
      privateKey: '',
      port: 0
    }

    const community2: Community = {
      name: '',
      id: 'id-2',
      registrarUrl: 'registrarUrl',
      CA: { rootCertString: 'certString', rootKeyString: 'keyString' },
      rootCa: '',
      peerList: [],
      registrar: null,
      onionAddress: '',
      privateKey: '',
      port: 0
    }

    const community3: Community = {
      name: '',
      id: 'id-3',
      registrarUrl: 'registrarUrl',
      CA: undefined,
      rootCa: '',
      peerList: [],
      registrar: null,
      onionAddress: '',
      privateKey: '',
      port: 0
    }

    await expectSaga(initCommunities)
      .withReducer(
        combineReducers({
          [StoreKeys.Communities]: communitiesReducer
        }),
        {
          [StoreKeys.Communities]: {
            ...new CommunitiesState(),
            currentCommunity: 'id',
            communities: communitiesAdapter.setAll(communitiesAdapter.getInitialState(), [
              community1,
              community2,
              community3
            ])
          }
        }
      )
      .put(communitiesActions.launchCommunity(community1.id))
      .put(communitiesActions.launchCommunity(community2.id))
      .put(communitiesActions.launchCommunity(community3.id))
      .run()
  })
  test('launch certain community instead of current community', async () => {
    const socket = { emit: jest.fn(), on: jest.fn() } as unknown as Socket

    const launchCommunityPayload: InitCommunityPayload = {
      id: 'id',
      peerId: { id: 'peerId', pubKey: 'pubKey', privKey: 'privKey' },
      hiddenService: { onionAddress: 'onionAddress', privateKey: 'privateKey' },
      certs: { certificate: 'userCert', key: 'userKey', CA: ['rootCert'] },
      peers: []
    }

    const community: Community = {
      name: '',
      id: 'id',
      registrarUrl: 'registrarUrl',
      CA: null,
      rootCa: 'rootCert',
      peerList: [],
      registrar: null,
      onionAddress: '',
      privateKey: '',
      port: 0
    }

    const userCsr = {
      userCsr: 'userCsr',
      userKey: 'userKey',
      pkcs10: {
        publicKey: jest.fn() as unknown,
        privateKey: jest.fn() as unknown,
        pkcs10: 'pkcs10'
      }
    }

    const identity: Identity = {
      id: 'id',
      hiddenService: { onionAddress: 'onionAddress', privateKey: 'privateKey' },
      dmKeys: { publicKey: 'publicKey', privateKey: 'privateKey' },
      peerId: { id: 'peerId', pubKey: 'pubKey', privKey: 'privKey' },
      zbayNickname: '',
      userCsr: userCsr,
      userCertificate: 'userCert'
    }

    await expectSaga(launchCommunitySaga, socket, communitiesActions.launchCommunity(community.id))
      .withReducer(
        combineReducers({
          [StoreKeys.Communities]: communitiesReducer,
          [StoreKeys.Identity]: identityReducer
        }),
        {
          [StoreKeys.Communities]: {
            ...new CommunitiesState(),
            currentCommunity: 'id-0',
            communities: communitiesAdapter.setAll(communitiesAdapter.getInitialState(), [
              community
            ])
          },
          [StoreKeys.Identity]: {
            ...new IdentityState(),
            identities: identityAdapter.setAll(identityAdapter.getInitialState(), [identity])
          }
        }
      )
      .apply(socket, socket.emit, [
        SocketActionTypes.LAUNCH_COMMUNITY,
        {
          id: launchCommunityPayload.id,
          peerId: launchCommunityPayload.peerId,
          hiddenService: launchCommunityPayload.hiddenService,
          certs: launchCommunityPayload.certs,
          peers: launchCommunityPayload.peers
        }
      ])
      .run()
  })
  test('launch current community', async () => {
    const socket = { emit: jest.fn(), on: jest.fn() } as unknown as Socket

    const launchCommunityPayload: InitCommunityPayload = {
      id: 'id',
      peerId: { id: 'peerId', pubKey: 'pubKey', privKey: 'privKey' },
      hiddenService: { onionAddress: 'onionAddress', privateKey: 'privateKey' },
      certs: { certificate: 'userCert', key: 'userKey', CA: ['rootCert'] },
      peers: []
    }

    const community: Community = {
      name: '',
      id: 'id',
      registrarUrl: 'registrarUrl',
      CA: null,
      rootCa: 'rootCert',
      peerList: [],
      registrar: null,
      onionAddress: '',
      privateKey: '',
      port: 0
    }

    const userCsr = {
      userCsr: 'userCsr',
      userKey: 'userKey',
      pkcs10: {
        publicKey: jest.fn() as unknown,
        privateKey: jest.fn() as unknown,
        pkcs10: 'pkcs10'
      }
    }

    const identity: Identity = {
      id: 'id',
      hiddenService: { onionAddress: 'onionAddress', privateKey: 'privateKey' },
      dmKeys: { publicKey: 'publicKey', privateKey: 'privateKey' },
      peerId: { id: 'peerId', pubKey: 'pubKey', privKey: 'privKey' },
      zbayNickname: '',
      userCsr: userCsr,
      userCertificate: 'userCert'
    }

    await expectSaga(launchCommunitySaga, socket, communitiesActions.launchCommunity())
      .withReducer(
        combineReducers({
          [StoreKeys.Communities]: communitiesReducer,
          [StoreKeys.Identity]: identityReducer
        }),
        {
          [StoreKeys.Communities]: {
            ...new CommunitiesState(),
            currentCommunity: 'id',
            communities: communitiesAdapter.setAll(communitiesAdapter.getInitialState(), [
              community
            ])
          },
          [StoreKeys.Identity]: {
            ...new IdentityState(),
            identities: identityAdapter.setAll(identityAdapter.getInitialState(), [identity])
          }
        }
      )
      .apply(socket, socket.emit, [
        SocketActionTypes.LAUNCH_COMMUNITY,
        {
          id: launchCommunityPayload.id,
          peerId: launchCommunityPayload.peerId,
          hiddenService: launchCommunityPayload.hiddenService,
          certs: launchCommunityPayload.certs,
          peers: launchCommunityPayload.peers
        }
      ])
      .run()
  })
})
