import React from 'react'
import { act } from 'react-dom/test-utils'
import '@testing-library/jest-dom/extend-expect'
import { apply, fork, take } from 'typed-redux-saga'
import { renderComponent } from '../renderer/testUtils/renderComponent'
import { prepareStore } from '../renderer/testUtils/prepareStore'
import MockedSocket from 'socket.io-mock'
import { ioMock } from '../shared/setupTests'
import { socketEventData } from '../renderer/testUtils/socket'
import {
  identity,
  publicChannels,
  getFactory,
  SocketActionTypes,
  PublicChannel
} from '@zbayapp/nectar'
import Channel from '../renderer/containers/pages/Channel'

describe('General channel', () => {
  let socket: MockedSocket
  let communityId: string

  beforeEach(() => {
    socket = new MockedSocket()
    ioMock.mockImplementation(() => socket)
  })

  it('create automatically along with creating community', async () => {
    const { store, runSaga } = await prepareStore(
      {},
      socket // Fork Nectar's sagas
    )

    renderComponent(
      <>
        <Channel />
      </>,
      store
    )

    const factory = await getFactory(store)

    await factory.create<
    ReturnType<typeof identity.actions.addNewIdentity>['payload']
    >('Identity', { zbayNickname: 'alice' })

    jest
      .spyOn(socket, 'emit')
      .mockImplementation(async (action: SocketActionTypes, ...input: any[]) => {
        if (action === SocketActionTypes.SUBSCRIBE_TO_TOPIC) {
          const data = input as socketEventData<[string, PublicChannel]>
          const channel = data[1]
          expect(channel.name).toEqual('general')
        }
      })

    await act(async () => {
      await runSaga(testCreateGeneralChannelSaga).toPromise()
    })

    function* mockNewCommunityEvent(): Generator {
      yield* apply(socket.socketClient, socket.socketClient.emit, [
        SocketActionTypes.NEW_COMMUNITY,
        {
          id: communityId
        }
      ])
    }

    function* testCreateGeneralChannelSaga(): Generator {
      yield* fork(mockNewCommunityEvent)
      yield* take(publicChannels.actions.createChannel)
      yield* take(publicChannels.actions.setCurrentChannel)
    }
  })
})
