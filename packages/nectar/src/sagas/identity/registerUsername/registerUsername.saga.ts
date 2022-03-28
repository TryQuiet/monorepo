import { PayloadAction } from '@reduxjs/toolkit'
import { select, put, call } from 'typed-redux-saga'
import { createUserCsr } from '@quiet/identity'
import { identitySelectors } from '../identity.selectors'
import { identityActions } from '../identity.slice'
import { CreateUserCsrPayload, RegisterCertificatePayload } from '../identity.types'
import { config } from '../../users/const/certFieldTypes'
import { communitiesSelectors } from '../../communities/communities.selectors'

export function* registerUsernameSaga(action: PayloadAction<string>): Generator {
  const identity = yield* select(identitySelectors.currentIdentity)

  // Nickname can differ between saga calls
  const nickname = action.payload

  let userCsr = null

  // Reuse the same csr if nickname hasn't changed
  if (identity.nickname === nickname) {
    userCsr = identity.userCsr
  }

  if (userCsr === null) {
    try {
      const payload: CreateUserCsrPayload = {
        nickname: nickname,
        commonName: identity.hiddenService.onionAddress,
        peerId: identity.peerId.id,
        dmPublicKey: identity.dmKeys.publicKey,
        signAlg: config.signAlg,
        hashAlg: config.hashAlg
      }
      userCsr = yield* call(createUserCsr, payload)
    } catch (e) {
      console.error(e)
      return
    }
  }

  const currentCommunity = yield* select(communitiesSelectors.currentCommunity)

  const payload: RegisterCertificatePayload = {
    communityId: currentCommunity?.id,
    nickname: nickname,
    userCsr: userCsr
  }

  yield* put(identityActions.registerCertificate(payload))
}
