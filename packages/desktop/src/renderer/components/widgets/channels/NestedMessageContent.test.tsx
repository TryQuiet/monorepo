import { MessageType } from '@quiet/state-manager'
import React from 'react'

import { renderComponent } from '../../../testUtils/renderComponent'
import NestedMessageContent from './NestedMessageContent'

describe('NestedMessageContent', () => {
  it('renders message', () => {
    const message = {
      id: 'string',
      type: MessageType.Basic,
      message: 'Hi',
      createdAt: 1636995488.44,
      date: 'string',
      nickname: 'bob'
    }
    const result = renderComponent(<NestedMessageContent pending={false} message={message} />)
    expect(result.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div
            class="MuiGrid-root MuiGrid-item"
          >
            <span
              class="MuiTypography-root makeStyles-message-1 MuiTypography-body1"
              data-testid="messagesGroupContent-string"
            >
              Hi
            </span>
          </div>
        </div>
      </body>
    `)
  })

  it('renders pending message', () => {
    const message = {
      id: 'string',
      type: MessageType.Basic,
      message: 'Hi',
      createdAt: 1636995488.44,
      date: 'string',
      nickname: 'bob'
    }
    const result = renderComponent(<NestedMessageContent pending={true} message={message} />)
    expect(result.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div
            class="MuiGrid-root MuiGrid-item"
          >
            <span
              class="MuiTypography-root makeStyles-message-136 makeStyles-pending-137 MuiTypography-body1"
              data-testid="messagesGroupContent-string"
            >
              Hi
            </span>
          </div>
        </div>
      </body>
    `)
  })

  it('renders file', () => {
    const message = {
      id: 'string',
      type: MessageType.Image,
      message: '',
      createdAt: 1636995488.44,
      date: 'string',
      nickname: 'bob',
      media: {
        path: 'path/to/file/test.png',
        name: 'test',
        ext: '.png',
        cid: 'abcd1234',
        width: 500,
        height: 600,
        id: 'string',
        channelAddress: 'general'
      }
    }
    const result = renderComponent(<NestedMessageContent pending={false} message={message} />)
    expect(result.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div
            class="MuiGrid-root MuiGrid-item"
          >
            <div
              class="makeStyles-message-271"
              data-testid="messagesGroupContent-string"
            >
              <div
                class="makeStyles-container-377"
              >
                <div
                  class="makeStyles-image-376"
                  data-testid="abcd1234-imageVisual"
                >
                  <p
                    class="makeStyles-fileName-381"
                  >
                    test.png
                  </p>
                  <img
                    class="makeStyles-image-376"
                    src="path/to/file/test.png"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    `)
  })
})
