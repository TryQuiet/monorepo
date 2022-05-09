import { displayMessageNotificationSaga } from './notifications'
import { expectSaga } from 'redux-saga-test-plan'
import { communities, connection, getFactory, identity, IncomingMessages, messages, NotificationsOptions, NotificationsSounds, prepareStore, publicChannels, settings, StoreKeys, users } from '@quiet/nectar'
import { combineReducers } from '@reduxjs/toolkit'
import { keyFromCertificate, parseCertificate, setupCrypto } from '@quiet/identity'
import { soundTypeToAudio } from '../../../shared/sounds'

const originalNotification = window.Notification
const mockNotification = jest.fn()
const notification = jest.fn().mockImplementation(() => { return mockNotification })
// @ts-expect-error
window.Notification = notification

const mockShow = jest.fn()
const mockIsFocused = jest.fn()

jest.mock('@electron/remote', () => {
  return {
    BrowserWindow: {
      getAllWindows: () => {
        return [
          {
            isFocused: mockIsFocused,
            show: mockShow
          }
        ]
      }
    }
  }
})

jest.mock('../../../shared/sounds', () => ({
  // @ts-expect-error
  ...jest.requireActual('../../../shared/sounds'),
  soundTypeToAudio: {
    pow: {
      play: jest.fn()
    },
    bang: {
      play: jest.fn()
    },
    splat: {
      play: jest.fn()
    }
  }
}))

let incomingMessages: IncomingMessages
let store
let publicChannel2
let community1
let identity1
let userPubKey
const lastConnectedTime = 1000000

beforeAll(async () => {
  setupCrypto()
  store = await prepareStore()
  const factory = await getFactory(store.store)

  community1 = await factory.create<
  ReturnType<typeof communities.actions.addNewCommunity>['payload']
  >('Community')

  publicChannel2 = await factory.create<
  ReturnType<typeof publicChannels.actions.addChannel>['payload']
  >('PublicChannel', { communityId: community1.id })

  identity1 = await factory.create<
  ReturnType<typeof identity.actions.addNewIdentity>['payload']
  >('Identity', { id: community1.id, nickname: 'alice' })

  const parsedCert = parseCertificate(identity1.userCertificate)
  userPubKey = await keyFromCertificate(parsedCert)

  const senderPubKey = Object.keys(users.selectors.certificatesMapping(store.store.getState()))
    .find((pubKey) => pubKey !== userPubKey)

  store.store.dispatch(connection.actions.setLastConnectedTime(lastConnectedTime))

  incomingMessages = {
    messages: [{
      id: 'id',
      type: 1,
      message: 'message',
      createdAt: lastConnectedTime + 1,
      channelAddress: publicChannel2.channel.address,
      signature: 'signature',
      pubKey: senderPubKey
    }],
    communityId: community1.id
  }
})

afterAll(() => {
  window.Notification = originalNotification
})

afterEach(() => {
  notification.mockClear()
  mockShow.mockClear()
  mockIsFocused.mockClear()
  jest.resetAllMocks()
})

describe('displayNotificationsSaga', () => {
  test('display notification when the user is on a different channel and settings are set on show every notification', async () => {
    mockIsFocused.mockImplementationOnce(() => { return true })

    await expectSaga(
      displayMessageNotificationSaga,
      messages.actions.incomingMessages(incomingMessages))
      .withReducer(
        combineReducers({
          [StoreKeys.Identity]: identity.reducer,
          [StoreKeys.Settings]: settings.reducer,
          [StoreKeys.PublicChannels]: publicChannels.reducer,
          [StoreKeys.Users]: users.reducer,
          [StoreKeys.Communities]: communities.reducer

        }),
        store.store.getState()
      )
      .run()

    expect(notification).toBeCalledWith(
      'New message from user_1 in #public-channel-1', {
        body: incomingMessages.messages[0].message,
        icon: '../../build/icon.png',
        silent: true
      })
  })

  test('do not display notification when incoming message is from same user', async () => {
    mockIsFocused.mockImplementationOnce(() => { return true })

    const incomingMessagesWithUserPubKey: IncomingMessages = {
      ...incomingMessages,
      messages: [{
        ...incomingMessages.messages[0],
        pubKey: userPubKey
      }]
    }

    await expectSaga(
      displayMessageNotificationSaga,
      messages.actions.incomingMessages(incomingMessagesWithUserPubKey))
      .withReducer(
        combineReducers({
          [StoreKeys.Identity]: identity.reducer,
          [StoreKeys.Settings]: settings.reducer,
          [StoreKeys.PublicChannels]: publicChannels.reducer,
          [StoreKeys.Users]: users.reducer,
          [StoreKeys.Communities]: communities.reducer

        }),
        store.store.getState()
      )
      .run()
    expect(notification).not.toHaveBeenCalled()
  })

  test('clicking in notification foregrounds the app', async () => {
    mockIsFocused.mockImplementationOnce(() => { return false })

    await expectSaga(
      displayMessageNotificationSaga,
      messages.actions.incomingMessages(incomingMessages))
      .withReducer(
        combineReducers({
          [StoreKeys.Identity]: identity.reducer,
          [StoreKeys.Settings]: settings.reducer,
          [StoreKeys.PublicChannels]: publicChannels.reducer,
          [StoreKeys.Users]: users.reducer,
          [StoreKeys.Communities]: communities.reducer

        }),
        store.store.getState()
      )
      .run()

    // simulate click on notification
    // @ts-expect-error
    mockNotification.onclick()

    expect(mockShow).toHaveBeenCalled()
  })

  test('play a sound when the notification is displayed', async () => {
    mockIsFocused.mockImplementationOnce(() => { return true })

    await expectSaga(
      displayMessageNotificationSaga,
      messages.actions.incomingMessages(incomingMessages))
      .withReducer(
        combineReducers({
          [StoreKeys.Identity]: identity.reducer,
          [StoreKeys.Settings]: settings.reducer,
          [StoreKeys.PublicChannels]: publicChannels.reducer,
          [StoreKeys.Users]: users.reducer,
          [StoreKeys.Communities]: communities.reducer

        }),
        store.store.getState()
      )
      .run()
    expect(soundTypeToAudio.pow.play).toHaveBeenCalled()
  })

  test('do not play a sound when the notification is displayed and sounds setting is set on do not play sound ', async () => {
    mockIsFocused.mockImplementationOnce(() => { return true })

    const storeWithNotificationsSoundTurnedOff = {
      ...store.store.getState(),
      [StoreKeys.Settings]: {
        ...new settings.State(),
        notificationsSound: NotificationsSounds.none
      }
    }

    await expectSaga(
      displayMessageNotificationSaga,
      messages.actions.incomingMessages(incomingMessages))
      .withReducer(
        combineReducers({
          [StoreKeys.Identity]: identity.reducer,
          [StoreKeys.Settings]: settings.reducer,
          [StoreKeys.PublicChannels]: publicChannels.reducer,
          [StoreKeys.Users]: users.reducer,
          [StoreKeys.Communities]: communities.reducer

        }),
        storeWithNotificationsSoundTurnedOff
      )
      .run()

    expect(soundTypeToAudio.pow.play).not.toHaveBeenCalled()
    expect(soundTypeToAudio.bang.play).not.toHaveBeenCalled()
    expect(soundTypeToAudio.splat.play).not.toHaveBeenCalled()
  })

  test('do not display notification when settings are set on do not show notifications', async () => {
    mockIsFocused.mockImplementationOnce(() => { return true })

    const storeReducersWithDoNotShowNotificationsSetting = {
      ...store.store.getState(),
      [StoreKeys.Settings]: {
        ...new settings.State(),
        notificationsOption: NotificationsOptions.doNotNotifyOfAnyMessages
      }
    }

    await expectSaga(
      displayMessageNotificationSaga,
      messages.actions.incomingMessages(incomingMessages))
      .withReducer(
        combineReducers({
          [StoreKeys.Identity]: identity.reducer,
          [StoreKeys.Settings]: settings.reducer,
          [StoreKeys.PublicChannels]: publicChannels.reducer,
          [StoreKeys.Users]: users.reducer,
          [StoreKeys.Communities]: communities.reducer

        }),
        storeReducersWithDoNotShowNotificationsSetting
      )
      .run()
    expect(notification).not.toHaveBeenCalled()
  })

  test('do not display notification when the user is on a same channel', async () => {
    mockIsFocused.mockImplementationOnce(() => { return true })

    const storeReducersWithCurrentChannelFromMessage = {
      ...store.store.getState(),
      PublicChannels: {
        channels: {
          ...store.store.getState().PublicChannels.channels,
          entities: {
            [community1.id]: {
              ...store.store.getState().PublicChannels.channels.entities[community1.id],
              currentChannelAddress: publicChannel2.channel.address
            }
          }
        }
      }
    }

    await expectSaga(
      displayMessageNotificationSaga,
      messages.actions.incomingMessages(incomingMessages))
      .withReducer(
        combineReducers({
          [StoreKeys.Identity]: identity.reducer,
          [StoreKeys.Settings]: settings.reducer,
          [StoreKeys.PublicChannels]: publicChannels.reducer,
          [StoreKeys.Users]: users.reducer,
          [StoreKeys.Communities]: communities.reducer

        }),
        storeReducersWithCurrentChannelFromMessage
      )
      .run()

    expect(notification).not.toHaveBeenCalled()
  })

  test('notification shows for message in current channel when app window does not have focus', async () => {
    mockIsFocused.mockImplementationOnce(() => { return false })

    const storeReducersWithCurrentChannelFromMessage = {
      ...store.store.getState(),
      PublicChannels: {
        channels: {
          ...store.store.getState().PublicChannels.channels,
          entities: {
            [community1.id]: {
              ...store.store.getState().PublicChannels.channels.entities[community1.id],
              currentChannelAddress: publicChannel2.channel.address
            }
          }
        }
      }
    }

    await expectSaga(
      displayMessageNotificationSaga,
      messages.actions.incomingMessages(incomingMessages))
      .withReducer(
        combineReducers({
          [StoreKeys.Identity]: identity.reducer,
          [StoreKeys.Settings]: settings.reducer,
          [StoreKeys.PublicChannels]: publicChannels.reducer,
          [StoreKeys.Users]: users.reducer,
          [StoreKeys.Communities]: communities.reducer

        }),
        storeReducersWithCurrentChannelFromMessage
      )
      .run()

    expect(notification).toBeCalledWith(
      'New message from user_1 in #public-channel-1', {
        body: incomingMessages.messages[0].message,
        icon: '../../build/icon.png',
        silent: true
      })
  })

  test('do not display notification when the message was sent before last connection app time', async () => {
    mockIsFocused.mockImplementationOnce(() => { return true })

    const incomingMessagesWithTimeStampBeforeLastConnectedTime: IncomingMessages = {
      ...incomingMessages,
      messages: [{
        ...incomingMessages.messages[0],
        createdAt: lastConnectedTime - 1
      }]
    }

    await expectSaga(
      displayMessageNotificationSaga,
      messages.actions.incomingMessages(incomingMessagesWithTimeStampBeforeLastConnectedTime))
      .withReducer(
        combineReducers({
          [StoreKeys.Identity]: identity.reducer,
          [StoreKeys.Settings]: settings.reducer,
          [StoreKeys.PublicChannels]: publicChannels.reducer,
          [StoreKeys.Users]: users.reducer,
          [StoreKeys.Communities]: communities.reducer

        }),
        store.store.getState()
      )
      .run()

    expect(notification).not.toHaveBeenCalled()
  })

  test('do not display notification when there is no sender info', async () => {
    mockIsFocused.mockImplementationOnce(() => { return true })

    const incomingMessagesWithoutSender: IncomingMessages = {
      ...incomingMessages,
      messages: [{
        ...incomingMessages.messages[0],
        pubKey: 'notExistingPubKey'
      }]
    }

    await expectSaga(
      displayMessageNotificationSaga,
      messages.actions.incomingMessages(incomingMessagesWithoutSender))
      .withReducer(
        combineReducers({
          [StoreKeys.Identity]: identity.reducer,
          [StoreKeys.Settings]: settings.reducer,
          [StoreKeys.PublicChannels]: publicChannels.reducer,
          [StoreKeys.Users]: users.reducer,
          [StoreKeys.Communities]: communities.reducer

        }),
        store.store.getState()
      )
      .run()

    expect(notification).not.toHaveBeenCalled()
  })
})
