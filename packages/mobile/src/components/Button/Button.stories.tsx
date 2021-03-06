import { storiesOf } from '@storybook/react-native'
import React from 'react'
import { storybookLog } from '../../utils/functions/storybookLog/storybookLog.function'

import { Button } from './Button.component'

storiesOf('Button', module)
  .add('Default', () => (
    <Button title={'button'} onPress={storybookLog('Button clicked')} />
  ))
  .add('Loading', () => (
    <Button
      title={'button'}
      loading={true}
      onPress={storybookLog('Button clicked')}
    />
  ))
