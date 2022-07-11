import { DisplayableMessage, MessageType } from '@quiet/state-manager'
import React from 'react'

import { renderComponent } from '../../../../testUtils/renderComponent'
import UploadedImage from './UploadedImage'

describe('UploadedFile', () => {
  let message: DisplayableMessage

  beforeEach(() => {
    message = {
      id: 'string',
      type: MessageType.Image,
      message: '',
      createdAt: 1636995488.44,
      date: 'string',
      nickname: 'bob',
      media: {
        path: null,
        name: 'test',
        ext: '.png',
        cid: 'abcd1234',
        width: 500,
        height: 600,
        message: {
          id: 'string',
          channelAddress: 'general'
        }
      }
    }
  })

  it('renders a placeholder if image is not finished downloading yet', () => {
    const result = renderComponent(<UploadedImage message={message} />)
    expect(result.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div
            class="makeStyles-placeholderWrapper-3"
            data-testid="abcd1234-imagePlaceholder"
          >
            <p
              class="makeStyles-fileName-6"
            >
              test.png
            </p>
            <div
              class="makeStyles-placeholder-4"
              style="width: 400px;"
            >
              <img
                class="makeStyles-placeholderIcon-5"
                src="test-file-stub"
              />
              <div
                class="MuiCircularProgress-root MuiCircularProgress-indeterminate"
                role="progressbar"
                style="width: 16px; height: 16px;"
              >
                <svg
                  class="MuiCircularProgress-svg"
                  viewBox="22 22 44 44"
                >
                  <circle
                    class="MuiCircularProgress-circle MuiCircularProgress-circleDisableShrink MuiCircularProgress-circleIndeterminate"
                    cx="44"
                    cy="44"
                    fill="none"
                    r="20.2"
                    stroke-width="3.6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </body>
    `)
  })
  it('renders image if image is downloaded', () => {
    message.media.path = 'path/to/file/test.png'
    message.media.message = {
      id: 'string',
      channelAddress: 'general'
    }
    const result = renderComponent(<UploadedImage message={message} />)
    expect(result.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div
            class="makeStyles-container-20"
          >
            <div
              class="makeStyles-image-19"
              data-testid="abcd1234-imageVisual"
            >
              <p
                class="makeStyles-fileName-24"
              >
                test.png
              </p>
              <img
                class="makeStyles-image-19"
                src="path/to/file/test.png"
                style="width: 400px;"
              />
            </div>
          </div>
        </div>
      </body>
    `)
  })
})
