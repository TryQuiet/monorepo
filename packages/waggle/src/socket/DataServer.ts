import express from 'express'
import { createServer, Server } from 'http'
import SocketIO from 'socket.io'
import logger from '../logger'
import cors from 'cors'

// eslint-disable-next-line
const socketio = require('socket.io')
const log = logger('socket')

export class DataServer {
  public PORT: number
  private readonly _app: express.Application
  private readonly server: Server
  public io: SocketIO.Server
  constructor(port?: number) {
    this.PORT = port || 4677
    this._app = express()
    this._app.use(cors())
    this.server = createServer(this._app)
    this.initSocket()
  }

  private get cors() {
    if (process.env.TEST_MODE === 'true' && process.env.E2E_TEST === 'true') {
      log('Development/test env. Getting cors')
      return {
        origin: '*',
        methods: ['GET', 'POST']
      }
    }
    return false
  }

  private readonly initSocket = (): void => {
    this.io = socketio(this.server, {
      cors: this.cors,
      pingInterval: 1000_000,
      pingTimeout: 1000_000
    })
  }

  public listen = async (): Promise<void> => {
    return await new Promise(resolve => {
      this.server.listen(this.PORT, () => {
        log(`Data server running on port ${this.PORT}`)
        resolve()
      })
    })
  }

  public close = async (): Promise<void> => {
    log(`Closing data server on port ${this.PORT}`)
    return await new Promise(resolve => {
      this.server.close()
      resolve()
    })
  }
}
