import fs from 'fs'
import path from 'path'
import PeerId from 'peer-id'
import { DirResult } from 'tmp'
import { Config } from '../constants'
import { createLibp2p, createTmpDir, tmpQuietDirPath, rootPermsData, createMinConnectionManager } from '../common/testUtils'
import { Storage } from './storage'
import * as utils from '../common/utils'
import { FactoryGirl } from 'factory-girl'
import {
  createUserCert,
  keyFromCertificate,
  parseCertificate
} from '@quiet/identity'
import {
  communities,
  Community,
  getFactory,
  identity,
  prepareStore,
  publicChannels,
  Store,
  Identity,
  ChannelMessage,
  PublicChannel,
  PublicChannelStorage,
  FileContent,
  FileMetadata
} from '@quiet/state-manager'
import { ConnectionsManager } from '../libp2p/connectionsManager'

jest.setTimeout(30_000)

let tmpDir: DirResult
let tmpAppDataPath: string
let tmpOrbitDbDir: string
let tmpIpfsPath: string
let connectionsManager: ConnectionsManager
let storage: Storage
let store: Store
let factory: FactoryGirl
let community: Community
let channel: PublicChannelStorage
let alice: Identity
let message: ChannelMessage
let channelio: PublicChannelStorage

beforeAll(async () => {
  store = prepareStore().store
  factory = await getFactory(store)

  community = await factory.create<
  ReturnType<typeof communities.actions.addNewCommunity>['payload']
  >('Community')

  channel = publicChannels.selectors.publicChannels(store.getState())[0]

  channelio = {
    ...channel
  }

  delete channelio.messages

  alice = await factory.create<ReturnType<typeof identity.actions.addNewIdentity>['payload']>(
    'Identity',
    { id: community.id, nickname: 'alice' }
  )

  message = (
    await factory.create<ReturnType<typeof publicChannels.actions.test_message>['payload']>(
      'Message',
      {
        identity: alice
      }
    )
  ).message
})

beforeEach(async () => {
  jest.clearAllMocks()
  tmpDir = createTmpDir()
  tmpAppDataPath = tmpQuietDirPath(tmpDir.name)
  tmpOrbitDbDir = path.join(tmpAppDataPath, Config.ORBIT_DB_DIR)
  tmpIpfsPath = path.join(tmpAppDataPath, Config.IPFS_REPO_PATH)
  const { controlPort } = await utils.getPorts()
  connectionsManager = createMinConnectionManager({ env: { appDataPath: tmpAppDataPath }, torControlPort: controlPort })
  storage = null
})

afterEach(async () => {
  try {
    storage && (await storage.stopOrbitDb())
  } catch (e) {
    console.error(e)
  }
  tmpDir.removeCallback()
})

describe('Storage', () => {
  it('creates paths by default', async () => {
    expect(fs.existsSync(tmpOrbitDbDir)).toBe(false)
    expect(fs.existsSync(tmpIpfsPath)).toBe(false)

    storage = new Storage(tmpAppDataPath, connectionsManager.ioProxy, 'communityId')

    const peerId = await PeerId.create()
    const libp2p = await createLibp2p(peerId)

    const createPathsSpy = jest.spyOn(utils, 'createPaths')

    await storage.init(libp2p, peerId)

    expect(createPathsSpy).toHaveBeenCalled()

    expect(fs.existsSync(tmpOrbitDbDir)).toBe(true)
    expect(fs.existsSync(tmpIpfsPath)).toBe(true)
  })

  it('should not create paths if createPaths is set to false', async () => {
    expect(fs.existsSync(tmpOrbitDbDir)).toBe(false)
    expect(fs.existsSync(tmpIpfsPath)).toBe(false)

    storage = new Storage(tmpAppDataPath, connectionsManager.ioProxy, 'communityId', { createPaths: false })

    const peerId = await PeerId.create()
    const libp2p = await createLibp2p(peerId)

    const createPathsSpy = jest.spyOn(utils, 'createPaths')

    await storage.init(libp2p, peerId)

    expect(createPathsSpy).not.toHaveBeenCalled()
  })
})

describe('Certificate', () => {
  it('is saved to db if passed verification', async () => {
    const userCertificate = await createUserCert(
      rootPermsData.certificate,
      rootPermsData.privKey,
      alice.userCsr.userCsr,
      new Date(),
      new Date(2030, 1, 1)
    )

    storage = new Storage(tmpAppDataPath, connectionsManager.ioProxy, 'communityId', { createPaths: false })

    const peerId = await PeerId.create()
    const libp2p = await createLibp2p(peerId)

    await storage.init(libp2p, peerId)

    await storage.initDatabases()

    const result = await storage.saveCertificate({ certificate: userCertificate.userCertString, rootPermsData })

    expect(result).toBe(true)
  })

  it('is not saved to db if did not pass verification', async () => {
    const oldUserCertificate = await createUserCert(
      rootPermsData.certificate,
      rootPermsData.privKey,
      alice.userCsr.userCsr,
      new Date(2021, 1, 1),
      new Date(2021, 1, 2)
    )

    storage = new Storage(tmpAppDataPath, connectionsManager.ioProxy, community.id, { createPaths: false })

    const peerId = await PeerId.create()
    const libp2p = await createLibp2p(peerId)

    await storage.init(libp2p, peerId)

    await storage.initDatabases()

    const result = await storage.saveCertificate({ certificate: oldUserCertificate.userCertString, rootPermsData })

    expect(result).toBe(false)
  })

  it('is not saved to db if empty', async () => {
    storage = new Storage(tmpAppDataPath, connectionsManager.ioProxy, community.id, { createPaths: false })

    const peerId = await PeerId.create()
    const libp2p = await createLibp2p(peerId)

    await storage.init(libp2p, peerId)

    await storage.initDatabases()

    for (const empty of [null, '', undefined]) {
      const result = await storage.saveCertificate({ certificate: empty, rootPermsData })
      expect(result).toBe(false)
    }
  })

  it('username check fails if username is already in use', async () => {
    const userCertificate = await createUserCert(rootPermsData.certificate, rootPermsData.privKey, alice.userCsr.userCsr, new Date(), new Date(2030, 1, 1))

    storage = new Storage(tmpAppDataPath, connectionsManager.ioProxy, 'communityId', { createPaths: false })

    const peerId = await PeerId.create()
    const libp2p = await createLibp2p(peerId)

    await storage.init(libp2p, peerId)

    await storage.initDatabases()

    await storage.saveCertificate({ certificate: userCertificate.userCertString, rootPermsData })

    for (const username of ['alice', 'Alice', 'Ąlice']) {
      const usernameCert = storage.usernameCert(username)
      expect(usernameCert).toEqual(userCertificate.userCertString)
    }
  })

  it('username check passes if username is not found in certificates', async () => {
    storage = new Storage(tmpAppDataPath, connectionsManager.ioProxy, community.id, { createPaths: false })

    const peerId = await PeerId.create()
    const libp2p = await createLibp2p(peerId)

    await storage.init(libp2p, peerId)

    await storage.initDatabases()

    const usernameCert = storage.usernameCert('alice')

    expect(usernameCert).toBeNull()
  })
})

describe('Message', () => {
  it('is saved to db if passed signature verification', async () => {
    storage = new Storage(tmpAppDataPath, connectionsManager.ioProxy, community.id, { createPaths: false })

    const peerId = await PeerId.create()
    const libp2p = await createLibp2p(peerId)

    await storage.init(libp2p, peerId)

    await storage.initDatabases()

    await storage.subscribeToChannel(channelio)

    const spy = jest.spyOn(storage.publicChannelsRepos.get(message.channelAddress).db, 'add')

    await storage.sendMessage(message)

    // Confirm message has passed orbitdb validator (check signature verification only)
    expect(spy).toHaveBeenCalled()
  })

  // TODO: Message signature verification doesn't work, our theory is that our AccessController performs check after message is added to db.
  xit('is not saved to db if did not pass signature verification', async () => {
    const john = await factory.create<
    ReturnType<typeof identity.actions.addNewIdentity>['payload']
    >('Identity', { id: community.id, nickname: 'john' })

    const aliceMessage = await factory.create<
    ReturnType<typeof publicChannels.actions.test_message>['payload']
    >('Message', {
      identity: alice
    })

    const johnPublicKey = keyFromCertificate(parseCertificate(john.userCertificate))

    const spoofedMessage = {
      ...aliceMessage.message,
      channelAddress: channel.address,
      pubKey: johnPublicKey
    }

    storage = new Storage(tmpAppDataPath, connectionsManager.ioProxy, community.id, { createPaths: false })

    const peerId = await PeerId.create()
    const libp2p = await createLibp2p(peerId)

    await storage.init(libp2p, peerId)

    await storage.initDatabases()

    await storage.subscribeToChannel(channelio)

    const spy = jest.spyOn(storage.publicChannelsRepos.get(spoofedMessage.channelAddress).db, 'add')

    await storage.sendMessage(spoofedMessage)

    // Confirm message has passed orbitdb validator (check signature verification only)
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('Files', () => {
  it('is uploaded to IPFS then can be downloaded', async () => {
    storage = new Storage(tmpAppDataPath, connectionsManager.ioProxy, community.id, { createPaths: false })

    const peerId = await PeerId.create()
    const libp2p = await createLibp2p(peerId)

    await storage.init(libp2p, peerId)

    await storage.initDatabases()

    // Uploading
    const uploadSpy = jest.spyOn(storage.io, 'uploadedFile')

    const buffer = fs.readFileSync(path.join(__dirname, '/testUtils/test-image.png')).toString()

    const fileContent: FileContent = {
      path: 'temp/image.png',
      name: 'image',
      ext: 'png'
    }

    await storage.uploadFile(fileContent)

    expect(uploadSpy).toHaveBeenCalled()

    // Downloading
    const downloadSpy = jest.spyOn(storage.io, 'downloadedFile')

    const uploadMetadata = uploadSpy.mock.calls[0][0]

    await storage.downloadFile(uploadMetadata)

    expect(downloadSpy).toHaveBeenCalled()
  })
})
