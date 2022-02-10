import React from 'react'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import { useModal } from '../../../containers/hooks'
import { PublicChannel } from '@quiet/nectar'
import SidebarHeader from '../../ui/Sidebar/SidebarHeader'
import ChannelsListItem from './ChannelsListItem'

export interface ChannelsPanelProps {
  channels: PublicChannel[]
  unreadChannels: string[]
  setCurrentChannel: (address: string) => void
  currentChannel: string
  createChannelModal: ReturnType<typeof useModal>
  joinChannelModal: ReturnType<typeof useModal>
}

const ChannelsPanel: React.FC<ChannelsPanelProps> = ({
  channels,
  unreadChannels,
  setCurrentChannel,
  currentChannel,
  createChannelModal,
  joinChannelModal
}) => {
  return (
    <Grid container item xs direction='column'>
      <Grid item>
        <SidebarHeader
          title={'Channels'}
          action={createChannelModal.handleOpen}
          actionTitle={joinChannelModal.handleOpen}
          tooltipText='Create new channel'
        />
      </Grid>
      <Grid item>
        <List disablePadding>
          {channels.map(channel => {
            const unread = unreadChannels.some(address => address === channel.address)
            const selected = currentChannel === channel.address
            return (
              <ChannelsListItem
                channel={channel}
                unread={unread}
                selected={selected}
                setCurrentChannel={setCurrentChannel}
                key={channel.address}
              />
            )
          })}
        </List>
      </Grid>
      {/* <Grid item>
        <QuickActionButton
          text='Find Channel'
          action={}
          icon={<Icon src={SearchIcon} />}
        />
      </Grid> */}
    </Grid>
  )
}
export default ChannelsPanel
