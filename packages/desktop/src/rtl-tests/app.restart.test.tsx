import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { screen } from '@testing-library/dom'
import { renderComponent } from '../renderer/testUtils/renderComponent'
import { prepareStore } from '../renderer/testUtils/prepareStore'
import LoadingPanel, { LoadingPanelMessage } from '../renderer/components/LoadingPanel/LoadingPanel'
import JoinCommunity from '../renderer/components/CreateJoinCommunity/JoinCommunity/JoinCommunity'
import CreateCommunity from '../renderer/components/CreateJoinCommunity/CreateCommunity/CreateCommunity'
import Channel from '../renderer/components/Channel/Channel'
import {
  CreateCommunityDictionary,
  JoinCommunityDictionary
} from '../renderer/components/CreateJoinCommunity/community.dictionary'
import MockedSocket from 'socket.io-mock'
import { ioMock } from '../shared/setupTests'
import { communities, getFactory } from '@quiet/state-manager'

jest.setTimeout(20_000)

describe('Restart app works correctly', () => {
  let socket: MockedSocket

  beforeEach(() => {
    socket = new MockedSocket()
    ioMock.mockImplementation(() => socket)
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }))
  })

  it('Displays channel component, not displays join/create community component', async () => {
    const { store } = await prepareStore(
      {},
      socket // Fork state manager's sagas
    )

    const factory = await getFactory(store)

    await factory.create<
    ReturnType<typeof communities.actions.addNewCommunity>['payload']
    >('Community')

    window.HTMLElement.prototype.scrollTo = jest.fn()

    renderComponent(
      <>
        <LoadingPanel />
        <JoinCommunity />
        <CreateCommunity />
        <Channel />
      </>,
      store
    )

    const startAppLoadingText = screen.queryByText(LoadingPanelMessage.StartingApplication)
    expect(startAppLoadingText).toBeNull()

    const joinCommunityDictionary = JoinCommunityDictionary()
    const joinCommunityTitle = screen.queryByText(joinCommunityDictionary.header)
    expect(joinCommunityTitle).toBeNull()

    const createCommunityDictionary = CreateCommunityDictionary()
    const createCommunityTitle = screen.queryByText(createCommunityDictionary.header)
    expect(createCommunityTitle).toBeNull()

    const channelName = await screen.findByText('#general')
    expect(channelName).toBeVisible()
  })
})
