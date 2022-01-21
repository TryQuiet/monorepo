import AccessController from 'orbit-db-access-controllers/src/access-controller-interface'
import { getCrypto } from 'pkijs'
import { stringToArrayBuffer } from 'pvutils'
import { ChannelMessage } from '@zbayapp/nectar'
import { keyObjectFromString, verifySignature } from '@zbayapp/identity'
import logger from '../logger'

const log = logger('accessController')

const type = 'messagesaccess'

export class MessagesAccessController extends AccessController {
  private crypto = getCrypto()
  
  private keyMapping: Map<string, CryptoKey> = new Map()

  static get type() {
    return type
  }

  async canAppend(entry) {
    const message: ChannelMessage = entry.payload.value

    const signature = stringToArrayBuffer(message.signature)

    let cryptoKey = this.keyMapping[message.pubKey]
    if (!cryptoKey) {
      cryptoKey = await keyObjectFromString(message.pubKey, this.crypto)
      this.keyMapping.set(message.pubKey, cryptoKey)
    }

    const verify = await verifySignature(signature, message.message, cryptoKey)
    return verify
  }

  async save() {
    // Return the manifest data
    return ''
  }

  static async create(_orbitdb, _options) {
    return new MessagesAccessController()
  }
}
