import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { renderComponent } from '../../../testUtils/renderComponent'
import { prepareStore } from '../../../testUtils/prepareStore'
import { StoreKeys } from '../../../store/store.keys'
import { socketActions, SocketState } from '../../../sagas/socket/socket.slice'
import { ModalName } from '../../../sagas/modals/modals.types'
import { modalsActions, ModalsInitialState } from '../../../sagas/modals/modals.slice'
import JoinCommunity from './JoinCommunity'
import CreateCommunity from '../CreateCommunity/CreateCommunity'
import { JoinCommunityDictionary, CreateCommunityDictionary } from '../community.dictionary'
import CreateUsername from '../../CreateUsername/CreateUsername'
import LoadingPanelModal from '../../../containers/widgets/loadingPanel/loadingPanel'
import { LoadingMessages } from '../../../containers/widgets/loadingPanel/loadingMessages'
import { identity, communities, getFactory, StoreKeys as NectarStoreKeys } from '@quiet/nectar'

describe('join community', () => {
  it('users switches from join to create', async () => {
    const { store } = await prepareStore({
      [StoreKeys.Socket]: {
        ...new SocketState(),
        isConnected: true
      },
      [StoreKeys.Modals]: {
        ...new ModalsInitialState(),
        [ModalName.joinCommunityModal]: { open: true }
      }
    })

    renderComponent(
      <>
        <JoinCommunity />
        <CreateCommunity />
      </>,
      store
    )

    // Confirm proper modal title is displayed
    const joinCommunityDictionary = JoinCommunityDictionary()
    const joinCommunityTitle = screen.getByText(joinCommunityDictionary.header)
    expect(joinCommunityTitle).toBeVisible()

    // Click redirecting link
    const link = screen.getByTestId('JoinCommunityLink')
    userEvent.click(link)

    // Confirm user is being redirected to create community
    const createCommunityDictionary = CreateCommunityDictionary()
    const createCommunityTitle = await screen.findByText(createCommunityDictionary.header)
    expect(createCommunityTitle).toBeVisible()
  })

  it('user goes form joning community to username registration, then comes back', async () => {
    const { store } = await prepareStore({
      [StoreKeys.Socket]: {
        ...new SocketState(),
        isConnected: true
      },
      [StoreKeys.Modals]: {
        ...new ModalsInitialState(),
        [ModalName.joinCommunityModal]: { open: true }
      }
    })

    renderComponent(
      <>
        <JoinCommunity />
        <CreateUsername />
      </>,
      store
    )

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

    // Close username registration modal
    const closeButton = await screen.findByTestId('createUsernameModalActions')
    userEvent.click(closeButton)
    expect(joinCommunityTitle).toBeVisible()
  })

  it('user rejoins to remembered community without user data', async () => {
    const { store } = await prepareStore({
      [StoreKeys.Socket]: {
        ...new SocketState(),
        isConnected: true
      },
      [StoreKeys.Modals]: {
        ...new ModalsInitialState(),
        [ModalName.joinCommunityModal]: { open: true }
      },
      [NectarStoreKeys.Communities]: {
        ...new communities.State()
      }
    })

    const factory = await getFactory(store)

    await factory.create<
    ReturnType<typeof communities.actions.addNewCommunity>['payload']
    >('Community')

    renderComponent(
      <>
        <JoinCommunity />
        <CreateUsername />
      </>,
      store
    )

    const createUsernameTitle = screen.getByText('Register a username')
    expect(createUsernameTitle).toBeVisible()
  })

  it('user rejoins to remembered community with user certificate', async () => {
    const store = (await prepareStore()).store
    const factory = await getFactory(store)

    const community = await factory.create<
    ReturnType<typeof communities.actions.addNewCommunity>['payload']
    >('Community')
    await factory.create<
    ReturnType<typeof identity.actions.addNewIdentity>['payload']
    >('Identity', { id: community.id, nickname: 'alice1' })

    store.dispatch(socketActions.setConnected())

    store.dispatch(modalsActions.openModal({
      name: ModalName.joinCommunityModal
    }))

    store.dispatch(identity.actions.storeUserCertificate({
      userCertificate: '',
      communityId: community.id
    }))

    const result1 = renderComponent(
      <>
        <JoinCommunity />
        <CreateUsername />
        <LoadingPanelModal />
      </>,
      store
    )
    const switchLink1 = result1.queryByText(LoadingMessages.CreateCommunity)
    expect(switchLink1).toBeInTheDocument()

    store.dispatch(identity.actions.storeUserCertificate({
      userCertificate: 'userCert',
      communityId: community.id
    }))

    const result2 = renderComponent(
      <>
        <JoinCommunity />
        <CreateUsername />
        <LoadingPanelModal />
      </>,
      store
    )

    const switchLink2 = result2.queryByText(LoadingMessages.CreateCommunity)
    expect(switchLink2).toBeNull()
  })
})
