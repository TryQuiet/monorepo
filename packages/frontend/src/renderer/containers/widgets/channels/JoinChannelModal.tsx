import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { publicChannels, PublicChannel } from '@quiet/nectar'
import JoinChannelModalComponent from '../../../components/widgets/channels/JoinChannelModal'
import { ModalName } from '../../../sagas/modals/modals.types'
import { useModal } from '../../hooks'

const useJoinChannelData = () => {
  const modalName = 'joinChannel'
  const data = {
    publicChannels: useSelector(publicChannels.selectors.publicChannels),
    users: {},
    modalName
  }
  return data
}

export const useJoinChannelActions = () => {
  const dispatch = useDispatch()
  const actions = {
    joinChannel: (channel: PublicChannel) => {}
  }
  return actions
}

export const JoinChannelModal = () => {
  const { publicChannels, users } = useJoinChannelData()
  const { joinChannel } = useJoinChannelActions()

  const modal = useModal(ModalName.joinChannel)

  return (
    <JoinChannelModalComponent
      publicChannels={publicChannels}
      joinChannel={joinChannel}
      // showNotification={showNotification}
      open={modal.open}
      users={users}
      handleClose={modal.handleClose}
    />
  )
}

export default JoinChannelModal
