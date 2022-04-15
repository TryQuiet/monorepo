import React, { FC, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { View } from 'react-native'
import { initActions } from '../../store/init/init.slice'
import { ScreenNames } from '../../const/ScreenNames.enum'
import { Chat } from '../../components/Chat/Chat.component'

import { identity, messages, publicChannels } from '@quiet/nectar'

export const MainScreen: FC = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initActions.setCurrentScreen(ScreenNames.MainScreen))
  })

  const currentIdentity = useSelector(identity.selectors.currentIdentity)
  const currentChannel = useSelector(publicChannels.selectors.currentChannel)

  const channelMessagesCount = useSelector(
    publicChannels.selectors.currentChannelMessagesCount
  )

  const channelMessages = useSelector(
    publicChannels.selectors.currentChannelMessagesMergedBySender
  )

  const sendMessageAction = useCallback(
    (message: string) => {
      dispatch(messages.actions.sendMessage({ message }))
    },
    [dispatch]
  )

  return (
    <View style={{ flex: 1 }}>
      {currentChannel && (
        <Chat
          sendMessageAction={sendMessageAction}
          channel={currentChannel}
          user={currentIdentity.nickname}
          messages={{
            count: channelMessagesCount,
            groups: channelMessages
          }}
        />
      )}
    </View>
  )
}
