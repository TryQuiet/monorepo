import { Socket } from 'socket.io-client'
import { PayloadAction } from '@reduxjs/toolkit'
import { keyFromCertificate, parseCertificate, sign, loadPrivateKey } from '@quiet/identity'
import { call, select, apply, put } from 'typed-redux-saga'
import { arrayBufferToString } from 'pvutils'
import { config } from '../../users/const/certFieldTypes'
import { SocketActionTypes } from '../../socket/const/actionTypes'
import { identitySelectors } from '../../identity/identity.selectors'
import { publicChannelsSelectors } from '../../publicChannels/publicChannels.selectors'
import { messagesActions } from '../messages.slice'
import { generateMessageId, getCurrentTime } from '../utils/message.utils'
import { Identity } from '../../identity/identity.types'
import { ChannelMessage } from '../../publicChannels/publicChannels.types'
import { MessageType, SendingStatus } from '../messages.types'
import { FileMetadata } from '../../files/files.types'

export function* sendMessageSaga(
  socket: Socket,
  action: PayloadAction<ReturnType<typeof messagesActions.sendMessage>['payload']>
): Generator {
  const identity: Identity = yield* select(identitySelectors.currentIdentity)

  const certificate = identity.userCertificate

  const parsedCertificate = yield* call(parseCertificate, certificate)
  const pubKey = yield* call(keyFromCertificate, parsedCertificate)
  const keyObject = yield* call(loadPrivateKey, identity.userCsr.userKey, config.signAlg)

  const signatureArrayBuffer = yield* call(sign, action.payload.message, keyObject)
  const signature = yield* call(arrayBufferToString, signatureArrayBuffer)

  const currentChannel = yield* select(publicChannelsSelectors.currentChannelAddress)

  const id = yield* call(generateMessageId)
  const createdAt = yield* call(getCurrentTime)

  const channelAddress = action.payload.channelAddress || currentChannel

  let media: FileMetadata | undefined
  if (action.payload.media) {
    media = {
      ...action.payload.media,
      path: null,
      message: {
        id: id,
        channelAddress: channelAddress
      }
    }
  }

  const message: ChannelMessage = {
    id: id,
    type: action.payload.type || MessageType.Basic,
    message: action.payload.message,
    media,
    createdAt,
    channelAddress,
    signature,
    pubKey
  }

  yield* apply(socket, socket.emit, [
    SocketActionTypes.SEND_MESSAGE,
    {
      peerId: identity.peerId.id,
      message: message
    }
  ])

  // Grey out message until saved in db
  yield* put(
    messagesActions.addMessagesSendingStatus({
      id: message.id,
      status: SendingStatus.Pending
    })
  )

  // Mark own message as properly signed
  yield* put(
    messagesActions.addMessageVerificationStatus({
      publicKey: message.pubKey,
      signature: message.signature,
      verified: true
    })
  )

  // Display sent message immediately, to improve user experience
  yield* put(
    messagesActions.incomingMessages({
      messages: [message],
      communityId: identity.id
    })
  )
}
