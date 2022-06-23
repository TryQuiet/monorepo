import { PayloadAction } from '@reduxjs/toolkit'
import { select, put } from 'typed-redux-saga'
import { messagesSelectors } from '../../messages/messages.selectors'
import { messagesActions } from '../../messages/messages.slice'

export function* downloadedFileSaga(
  action: PayloadAction<ReturnType<typeof messagesActions.downloadedFile>['payload']>
): Generator {
  const { id, channelAddress } = action.payload.message

  const messagesBase = yield* select(messagesSelectors.publicChannelsMessagesBase)

  const channelMessages = messagesBase[channelAddress]
  const messages = Object.values(channelMessages.messages.entities)

  let message = messages.find(message => message.id === id)
  message = {
    ...message,
    media: action.payload
  }

  yield* put(
    messagesActions.incomingMessages({
      messages: [message]
    })
  )
}
