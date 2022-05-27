import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { INPUT_STATE } from './InputState.enum'

import { ChannelInputComponent, ChannelInputProps } from './ChannelInput'
import { withTheme } from '../../../../storybook/decorators'

const Template: ComponentStory<typeof ChannelInputComponent> = args => {
  return (
    <div style={{ height: '400px', position: 'relative' }}>
      <ChannelInputComponent {...args} />
    </div>
  )
}

export const Component = Template.bind({})
export const Disabled = Template.bind({})

const args: ChannelInputProps = {
  channelAddress: 'channelAddress',
  channelParticipants: [{ nickname: 'john' }, { nickname: 'emily' }],
  inputPlaceholder: '#general as @alice',
  onChange: function (_arg: string): void {},
  onKeyPress: function (input: string): void {
    console.log('send message', input)
  },
  infoClass: '',
  setInfoClass: function (_arg: string): void {},
  unsupportedFileModal: {
    open: false,
    handleOpen: function (_args?: any): any {},
    handleClose: function (): any {},
    unsupportedFiles: [],
    title: '',
    sendOtherContent: '',
    textContent: '',
    tryZipContent: ''
  }
}

const argsDisabledInput: ChannelInputProps = {
  channelAddress: 'channelAddress',
  channelParticipants: [{ nickname: 'john' }, { nickname: 'emily' }],
  inputPlaceholder: '#general as @alice',
  onChange: function (_arg: string): void {},
  onKeyPress: function (input: string): void {
    console.log('send message', input)
  },
  infoClass: '',
  setInfoClass: function (_arg: string): void {},
  inputState: INPUT_STATE.NOT_CONNECTED,
  unsupportedFileModal: {
    open: false,
    handleOpen: function (_args?: any): any {},
    handleClose: function (): any {},
    unsupportedFiles: [],
    title: '',
    sendOtherContent: '',
    textContent: '',
    tryZipContent: ''
  }
}

Component.args = args
Disabled.args = argsDisabledInput

const component: ComponentMeta<typeof ChannelInputComponent> = {
  title: 'Components/ChannelInput',
  decorators: [withTheme],
  component: ChannelInputComponent
}

export default component
