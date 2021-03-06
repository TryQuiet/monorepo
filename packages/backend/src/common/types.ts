import EventStore from 'orbit-db-eventstore'
import { ChannelMessage, PublicChannel } from '@quiet/state-manager'

export interface PublicChannelsRepo {
  db: EventStore<ChannelMessage>
  eventsAttached: boolean
}

export interface DirectMessagesRepo {
  db: EventStore<string>
  eventsAttached: boolean
}

export interface ChannelInfoResponse {
  [name: string]: PublicChannel
}

export class StorageOptions {
  orbitDbDir?: string
  ipfsDir?: string
  createPaths: boolean = true
  isEntryNode?: boolean = false
}

export interface IPublicKey {
  halfKey: string
}

export type IMessageThread = string

export class ConnectionsManagerOptions {
  env: {
    appDataPath?: string
    resourcesPath?: string
  } = {}

  bootstrapMultiaddrs?: string[] = []
  createPaths?: boolean = true
  isEntryNode?: boolean = false
  createSnapshot?: boolean = false
  useSnapshot?: boolean = false
  libp2pTransportClass?: any = null
  spawnTor?: boolean = true
  torControlPort: number
  torPassword?: string
  torAuthCookie?: string
  useLocalTorFiles?: boolean = false // Use tor binaries and their libs from backend
  wsType?: 'wss' | 'ws' = 'wss'
}

export interface IConstructor {
  host: string
  port: number
  agentPort?: number
  httpTunnelPort?: number
  agentHost?: string
  options?: Partial<ConnectionsManagerOptions>
  io: any
  storageClass?: any // TODO: what type?
}

export interface ILibp2pStatus {
  address: string
  peerId: string
}
