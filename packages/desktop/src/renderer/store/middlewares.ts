import { useModal } from '../containers/hooks'
import { ModalName } from '../sagas/modals/modals.types'
import { modalsActions, OpenModalPayload } from '../sagas/modals/modals.slice'

const isPromise = value =>
  value !== null && typeof value === 'object' && typeof value.then === 'function'

const _dispatchError = (store, err) => {
  const criticalError = {
    message: err.message,
    traceback: err.stack
  }
  store.dispatch(modalsActions.openModal({
    name: ModalName.criticalError,
    args: criticalError
  }))
}

export const errorsMiddleware = store => next => action => {
  if (!action) return
  if (action?.meta?.ignoreError) {
    return next(action)
  }
  // Handle action with Promise payload
  if (isPromise(action?.payload)) {
    return next(action).catch(error => {
      _dispatchError(store, error)
      throw error
    })
  } else {
    let result
    // Handle throws from regular actions
    try {
      result = next(action)

      // If next didn't throw check if the action is an async thunk and add error handling
      if (isPromise(result)) {
        result.catch(error => {
          _dispatchError(store, error)
          throw error
        })
      }
    } catch (err) {
      _dispatchError(store, err)
      throw err
    }

    // If no errors simply return result of action
    return result
  }
}
