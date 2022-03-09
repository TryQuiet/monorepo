import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { act } from 'react-dom/test-utils'
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { take } from 'typed-redux-saga'
import { renderComponent } from '../renderer/testUtils/renderComponent'
import { prepareStore } from '../renderer/testUtils/prepareStore'
import { modalsActions } from '../renderer/sagas/modals/modals.slice'
import JoinCommunity from '../renderer/components/CreateJoinCommunity/JoinCommunity/JoinCommunity'
import CreateUsername from '../renderer/components/CreateUsername/CreateUsername'
import LoadingPanel from '../renderer/containers/widgets/loadingPanel/loadingPanel'
import { ModalName } from '../renderer/sagas/modals/modals.types'
import { JoinCommunityDictionary } from '../renderer/components/CreateJoinCommunity/community.dictionary'
import MockedSocket from 'socket.io-mock'
import { ioMock } from '../shared/setupTests'
import { socketEventData } from '../renderer/testUtils/socket'
import {
  identity,
  communities,
  SocketActionTypes,
  RegisterUserCertificatePayload,
  InitCommunityPayload,
  Community,
  createUserCertificateTestHelper,
  ErrorCodes,
  ErrorMessages,
  getFactory
} from '@quiet/nectar'
import Channel from '../renderer/components/Channel/Channel'

jest.setTimeout(20_000)

describe('User', () => {
  let socket: MockedSocket

  beforeEach(() => {
    socket = new MockedSocket()
    ioMock.mockImplementation(() => socket)
  })

  it('joins community and registers username', async () => {
    const { store, runSaga } = await prepareStore(
      {},
      socket // Fork Nectar's sagas
    )

    store.dispatch(modalsActions.openModal({ name: ModalName.joinCommunityModal }))

    renderComponent(
      <>
        <JoinCommunity />
        <CreateUsername />
        <Channel />
      </>,
      store
    )

    const factory = await getFactory(store)

    jest
      .spyOn(socket, 'emit')
      .mockImplementation(async (action: SocketActionTypes, ...input: any[]) => {
        if (action === SocketActionTypes.CREATE_NETWORK) {
          const data = input as socketEventData<[Community]>
          const payload = data[0]
          return socket.socketClient.emit(SocketActionTypes.NETWORK, {
            community: payload,
            network: {
              hiddenService: {
                onionAddress: 'onionAddress',
                privKey: 'privKey'
              },
              peerId: {
                id: 'peerId'
              }
            }
          })
        }
        if (action === SocketActionTypes.REGISTER_USER_CERTIFICATE) {
          const data = input as socketEventData<[RegisterUserCertificatePayload]>
          const payload = data[0]
          const user = identity.selectors.currentIdentity(store.getState())
          // This community serves only as a mocked object for generating valid crytpo data (certificate, rootCA)
          const communityHelper = (
            await factory.build<typeof communities.actions.addNewCommunity>('Community', {
              id: data[0]
            })
          ).payload
          const certificateHelper = await createUserCertificateTestHelper(
            {
              nickname: user.nickname,
              commonName: communityHelper.registrarUrl,
              peerId: user.peerId.id
            },
            communityHelper.CA
          )
          const certificate = certificateHelper.userCert.userCertObject.certificate
          const rootCa = communityHelper.CA.rootCertString
          return socket.socketClient.emit(SocketActionTypes.SEND_USER_CERTIFICATE, {
            id: payload.communityId,
            payload: {
              certificate: certificate,
              rootCa: rootCa
            }
          })
        }
        if (action === SocketActionTypes.LAUNCH_COMMUNITY) {
          const data = input as socketEventData<[InitCommunityPayload]>
          const payload = data[0]
          const community = communities.selectors.currentCommunity(store.getState())
          expect(payload.id).toEqual(community.id)
          socket.socketClient.emit(SocketActionTypes.COMMUNITY, {
            id: payload.id
          })
          socket.socketClient.emit(SocketActionTypes.RESPONSE_GET_PUBLIC_CHANNELS, {
            communityId: community.id,
            channels: {
              general: {
                name: 'general',
                description: 'string',
                owner: 'owner',
                timestamp: 0,
                address: 'general'
              }
            }
          })
        }
      })

    // Log all the dispatched actions in order
    const actions = []
    runSaga(function* (): Generator {
      while (true) {
        const action = yield* take()
        actions.push(action.type)
      }
    })

    // Confirm proper modal title is displayed
    const dictionary = JoinCommunityDictionary()
    const joinCommunityTitle = screen.getByText(dictionary.header)
    expect(joinCommunityTitle).toBeVisible()

    // Enter community address and hit button
    const joinCommunityInput = screen.getByPlaceholderText(dictionary.placeholder)
    const joinCommunityButton = screen.getByText(dictionary.button)
    userEvent.type(joinCommunityInput, '3lyn5yjwwb74he5olv43eej7knt34folvrgrfsw6vzitvkxmc5wpe4yd')
    userEvent.click(joinCommunityButton)

    // Confirm user is being redirected to username registration
    const createUsernameTitle = await screen.findByText('Register a username')
    expect(createUsernameTitle).toBeVisible()

    // Enter username and hit button
    const createUsernameInput = screen.getByPlaceholderText('Enter a username')
    const createUsernameButton = screen.getByText('Register')
    userEvent.type(createUsernameInput, 'alice')
    userEvent.click(createUsernameButton)

    // Wait for the actions that updates the store
    await act(async () => {})

    // Check if join/username modals are gone
    expect(joinCommunityTitle).not.toBeVisible()
    expect(createUsernameTitle).not.toBeVisible()

    // Check if channel page is visible
    const channelPage = await screen.findByText('#general')
    expect(channelPage).toBeVisible()

    expect(actions).toMatchInlineSnapshot(`
      Array [
        "Communities/createNetwork",
        "Communities/responseCreateNetwork",
        "Communities/addNewCommunity",
        "Communities/setCurrentCommunity",
        "PublicChannels/addPublicChannelsList",
        "Identity/addNewIdentity",
        "Modals/closeModal",
        "Modals/openModal",
        "Identity/registerUsername",
        "Identity/registerCertificate",
        "Communities/storePeerList",
        "Identity/storeUserCertificate",
        "Modals/closeModal",
        "Communities/updateCommunity",
        "Communities/updateCommunityData",
        "Communities/launchCommunity",
        "Communities/launchRegistrar",
        "Connection/addInitializedCommunity",
        "PublicChannels/responseGetPublicChannels",
        "PublicChannels/subscribeToAllTopics",
        "PublicChannels/subscribeToTopic",
        "PublicChannels/addChannel",
        "PublicChannels/setChannelLoadingSlice",
      ]
    `)
  })

  it('sees proper registration error when trying to join with already taken username', async () => {
    const { store, runSaga } = await prepareStore(
      {},
      socket // Fork Nectar's sagas
    )

    store.dispatch(modalsActions.openModal({ name: ModalName.joinCommunityModal }))

    renderComponent(
      <>
        <LoadingPanel />
        <JoinCommunity />
        <CreateUsername />
        <Channel />
      </>,
      store
    )

    jest
      .spyOn(socket, 'emit')
      .mockImplementation(async (action: SocketActionTypes, ...input: any[]) => {
        if (action === SocketActionTypes.CREATE_NETWORK) {
          const data = input as socketEventData<[Community]>
          const payload = data[0]
          return socket.socketClient.emit(SocketActionTypes.NETWORK, {
            community: payload,
            network: {
              hiddenService: {
                onionAddress: 'onionAddress',
                privKey: 'privKey'
              },
              peerId: {
                id: 'peerId'
              }
            }
          })
        }
        if (action === SocketActionTypes.REGISTER_USER_CERTIFICATE) {
          const data = input as socketEventData<[RegisterUserCertificatePayload]>
          const payload = data[0]
          const community = communities.selectors.currentCommunity(store.getState())
          expect(payload.communityId).toEqual(community.id)
          socket.socketClient.emit(SocketActionTypes.ERROR, {
            type: SocketActionTypes.REGISTRAR,
            message: ErrorMessages.USERNAME_TAKEN,
            code: ErrorCodes.VALIDATION,
            community: community.id
          })
        }
        if (action === SocketActionTypes.LAUNCH_COMMUNITY) {
          const data = input as socketEventData<[InitCommunityPayload]>
          const payload = data[0]
          const community = communities.selectors.currentCommunity(store.getState())
          expect(payload.id).toEqual(community.id)
          socket.socketClient.emit(SocketActionTypes.COMMUNITY, {
            id: payload.id
          })
          socket.socketClient.emit(SocketActionTypes.RESPONSE_GET_PUBLIC_CHANNELS, {
            communityId: community.id,
            channels: {
              general: {
                name: 'general',
                description: 'string',
                owner: 'owner',
                timestamp: 0,
                address: 'general'
              }
            }
          })
        }
      })

    // Log all the dispatched actions in order
    const actions = []
    runSaga(function* (): Generator {
      while (true) {
        const action = yield* take()
        actions.push(action.type)
      }
    })

    // Confirm proper modal title is displayed
    const dictionary = JoinCommunityDictionary()
    const joinCommunityTitle = screen.getByText(dictionary.header)
    expect(joinCommunityTitle).toBeVisible()

    // Enter community address and hit button
    const joinCommunityInput = screen.getByPlaceholderText(dictionary.placeholder)
    const joinCommunityButton = screen.getByText(dictionary.button)
    userEvent.type(joinCommunityInput, '3lyn5yjwwb74he5olv43eej7knt34folvrgrfsw6vzitvkxmc5wpe4yd')
    userEvent.click(joinCommunityButton)

    // Confirm user is being redirected to username registration
    const createUsernameTitle = await screen.findByText('Register a username')
    expect(createUsernameTitle).toBeVisible()

    // Enter username and hit button
    const createUsernameInput = screen.getByPlaceholderText('Enter a username')
    const createUsernameButton = screen.getByText('Register')
    userEvent.type(createUsernameInput, 'bob')
    userEvent.click(createUsernameButton)

    // Wait for the actions that updates the store
    await act(async () => {})

    // Check if 'username taken' error message is visible
    expect(createUsernameTitle).toBeVisible()
    const usernameTakenErrorMessage = await screen.findByText(ErrorMessages.USERNAME_TAKEN)
    expect(usernameTakenErrorMessage).toBeVisible()

    expect(actions).toMatchInlineSnapshot(`
      Array [
        "Communities/createNetwork",
        "Communities/responseCreateNetwork",
        "Communities/addNewCommunity",
        "Communities/setCurrentCommunity",
        "PublicChannels/addPublicChannelsList",
        "Identity/addNewIdentity",
        "Modals/closeModal",
        "Modals/openModal",
        "Identity/registerUsername",
        "Identity/registerCertificate",
        "Errors/addError",
      ]
    `)
  })

  it.skip('retries joining community after receiving error', async () => {})
})
