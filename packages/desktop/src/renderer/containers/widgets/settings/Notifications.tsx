import { NotificationsOptions, NotificationsSounds, settings } from '@quiet/state-manager'
import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import NotificationsComponent from '../../../components/widgets/settings/Notifications'

interface useNotificationsDataReturnType {
  notificationsOption: NotificationsOptions
  notificationsSound: NotificationsSounds
}

export const useNotificationsData = (): useNotificationsDataReturnType => {
  const data = {
    notificationsOption: useSelector(settings.selectors.getNotificationsOption),
    notificationsSound: useSelector(settings.selectors.getNotificationsSound)
  }
  return data
}

export const useNotificationsActions = (notificationsOption: NotificationsOptions, notificationsSound: NotificationsSounds) => {
  const dispatch = useDispatch()

  const setNotificationsOption = useCallback((option) => {
    dispatch(settings.actions.setNotificationsOption(option))
  }, [dispatch, notificationsOption])

  const setNotificationsSound = useCallback((sound) => {
    dispatch(settings.actions.setNotificationsSound(sound))
  }, [dispatch, notificationsSound])

  return { setNotificationsOption, setNotificationsSound }
}

export const Notifications = () => {
  const { notificationsOption, notificationsSound } = useNotificationsData()
  const { setNotificationsOption, setNotificationsSound } =
    useNotificationsActions(notificationsOption, notificationsSound)

  return (
    <NotificationsComponent
      notificationsOption={notificationsOption}
      notificationsSound={notificationsSound}
      setNotificationsOption={setNotificationsOption}
      setNotificationsSound={setNotificationsSound}
    />
  )
}

export default Notifications
