import React from 'react'
import { useSelector } from 'react-redux'
import SettingsModal from '../../../components/widgets/settings/SettingsModal'
import { ModalName } from '../../../sagas/modals/modals.types'
import { useModal } from '../../hooks'
import { communities, identity } from '@quiet/state-manager'

const SettingsModalContainer = () => {
  const modal = useModal(ModalName.accountSettingsModal)

  const user = useSelector(identity.selectors.currentIdentity)?.nickname || 'Settings'
  const community = useSelector(communities.selectors.currentCommunity)
  const owner = Boolean(community?.CA)

  return <SettingsModal title={'Settings'} owner={owner} {...modal} />
}

export default SettingsModalContainer
