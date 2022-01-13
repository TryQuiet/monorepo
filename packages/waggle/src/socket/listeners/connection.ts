import { SocketActionTypes } from '@zbayapp/nectar'
import { CertsData, IChannelInfo, IMessage } from '../../common/types'
import IOProxy from '../IOProxy'
import PeerId from 'peer-id'
import logger from '../../logger'

const log = logger('socket')

export const connections = (io, ioProxy: IOProxy) => {
  io.on(SocketActionTypes.CONNECTION, socket => {
    log('websocket connected')
    socket.on(SocketActionTypes.CLOSE, async () => {
      await ioProxy.closeAll()
    })
    socket.on(
      SocketActionTypes.SUBSCRIBE_TO_TOPIC,
      async (peerId: string, channelData: IChannelInfo) => {
        await ioProxy.subscribeToTopic(peerId, channelData)
      }
    )
    socket.on(
      SocketActionTypes.SEND_MESSAGE,
      async (
        peerId: string,
        { channelAddress, message }: { channelAddress: string; message: IMessage }
      ) => {
        await ioProxy.sendMessage(peerId, channelAddress, message)
      }
    )
    socket.on(
      SocketActionTypes.FETCH_ALL_MESSAGES,
      async (peerId: string, channelAddress: string) => {
        await ioProxy.loadAllMessages(peerId, channelAddress)
      }
    )
    socket.on(
      SocketActionTypes.ADD_USER,
      async (peerId: string, { publicKey, halfKey }: { publicKey: string; halfKey: string }) => {
        await ioProxy.addUser(peerId, publicKey, halfKey)
      }
    )
    socket.on(SocketActionTypes.GET_AVAILABLE_USERS, async (peerId: string) => {
      await ioProxy.getAvailableUsers(peerId)
    })
    socket.on(
      SocketActionTypes.INITIALIZE_CONVERSATION,
      async (
        peerId: string,
        { address, encryptedPhrase }: { address: string; encryptedPhrase: string }
      ) => {
        await ioProxy.initializeConversation(peerId, address, encryptedPhrase)
      }
    )
    socket.on(SocketActionTypes.GET_PRIVATE_CONVERSATIONS, async (peerId: string) => {
      await ioProxy.getPrivateConversations(peerId)
    })
    socket.on(
      SocketActionTypes.SEND_DIRECT_MESSAGE,
      async (
        peerId: string,
        { channelAddress, message }: { channelAddress: string; message: string }
      ) => {
        await ioProxy.sendDirectMessage(peerId, channelAddress, message)
      }
    )
    socket.on(
      SocketActionTypes.SUBSCRIBE_FOR_DIRECT_MESSAGE_THREAD,
      async (peerId: string, channelAddress: string) => {
        await ioProxy.subscribeToDirectMessageThread(peerId, channelAddress)
      }
    )
    socket.on(
      SocketActionTypes.SUBSCRIBE_FOR_ALL_CONVERSATIONS,
      async (peerId: string, conversations: string[]) => {
        await ioProxy.subscribeToAllConversations(peerId, conversations)
      }
    )
    socket.on(
      SocketActionTypes.ASK_FOR_MESSAGES,
      async ({
        peerId,
        channelAddress,
        ids,
        communityId
      }: {
        peerId: string
        channelAddress: string
        ids: string[]
        communityId: string
      }) => {
        await ioProxy.askForMessages(peerId, channelAddress, ids, communityId)
      }
    )
    socket.on(
      SocketActionTypes.REGISTER_USER_CERTIFICATE,
      async (serviceAddress: string, userCsr: string, id: string) => {
        log(`Registering user certificate (${id}) on ${serviceAddress}`)
        await ioProxy.registerUserCertificate(serviceAddress, userCsr, id)
      }
    )
    socket.on(
      SocketActionTypes.REGISTER_OWNER_CERTIFICATE,
      async (
        communityId: string,
        userCsr: string,
        dataFromPerms: {
          certificate: string
          privKey: string
        }
      ) => {
        log(`Registering owner certificate (${communityId})`)
        await ioProxy.registerOwnerCertificate(communityId, userCsr, dataFromPerms)
      }
    )
    socket.on(SocketActionTypes.SAVE_CERTIFICATE, async (peerId: string, certificate: string) => {
      log(`Saving user certificate (${peerId})`)
      await ioProxy.saveCertificate(peerId, certificate)
    })
    socket.on(
      SocketActionTypes.SAVE_OWNER_CERTIFICATE,
      async (
        communityId: string,
        peerId: string,
        certificate: string,
        dataFromPerms: {
          certificate: string
          privKey: string
        }
      ) => {
        log(`Saving owner certificate (${peerId}), community: ${communityId}`)
        await ioProxy.saveOwnerCertificate(peerId, certificate, dataFromPerms)
      }
    )
    socket.on(
      SocketActionTypes.CREATE_COMMUNITY,
      async (
        communityId: string,
        peerId: PeerId.JSONPeerId,
        hiddenService: { address: string; privateKey: string },
        certs: CertsData
      ) => {
        log(`Creating community ${communityId}`)
        await ioProxy.createCommunity(communityId, peerId, hiddenService, certs)
      }
    )

    socket.on(
      SocketActionTypes.LAUNCH_COMMUNITY,
      async (
        id: string,
        peerId: PeerId.JSONPeerId,
        hiddenServiceKey: { address: string; privateKey: string },
        peers: string[],
        certs: CertsData
      ) => {
        log(`Launching community ${id} for ${peerId.id}`)
        await ioProxy.launchCommunity(id, peerId, hiddenServiceKey, peers, certs)
      }
    )
    socket.on(
      SocketActionTypes.LAUNCH_REGISTRAR,
      async (
        id: string,
        peerId: string,
        rootCertString: string,
        rootKeyString: string,
        hiddenServicePrivKey?: string,
        port?: number
      ) => {
        log(`Launching registrar for community ${id}, user ${peerId}`)
        await ioProxy.launchRegistrar(
          id,
          peerId,
          rootCertString,
          rootKeyString,
          hiddenServicePrivKey,
          port
        )
      }
    )
    socket.on(SocketActionTypes.CREATE_NETWORK, async (communityId: string) => {
      log(`Creating network for community ${communityId}`)
      await ioProxy.createNetwork(communityId)
    })
  })
}
