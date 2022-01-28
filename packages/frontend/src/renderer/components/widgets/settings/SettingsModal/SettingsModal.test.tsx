/* eslint import/first: 0 */
import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import store from '../../../../store'
import { renderComponent } from '../../../../testUtils/renderComponent'
import { SettingsModal } from './SettingsModal'

describe('SettingsModal', () => {
  it('renders component', () => {
    const result = renderComponent(
      <Provider store={store}>
        <SettingsModal user='string' owner={false} open handleClose={jest.fn()} />
      </Provider>
    )
    expect(result.baseElement).toMatchInlineSnapshot(`
      <body
        style="overflow: hidden; padding-right: 0px;"
      >
        <div
          aria-hidden="true"
        />
        <div
          class="makeStyles-root-9"
          role="presentation"
          style="position: fixed; z-index: 1300; right: 0px; bottom: 0px; top: 0px; left: 0px;"
        >
          <div
            aria-hidden="true"
            style="z-index: -1; position: fixed; right: 0px; bottom: 0px; top: 0px; left: 0px; background-color: rgba(0, 0, 0, 0.5);"
          />
          <div
            data-test="sentinelStart"
            tabindex="0"
          />
          <div
            class="MuiGrid-root makeStyles-centered-16 makeStyles-window-17 MuiGrid-container MuiGrid-direction-xs-column MuiGrid-justify-xs-center"
            tabindex="-1"
          >
            <div
              class="MuiGrid-root makeStyles-header-11 makeStyles-headerBorder-12 MuiGrid-container MuiGrid-item MuiGrid-align-items-xs-center"
            >
              <div
                class="MuiGrid-root MuiGrid-container MuiGrid-item MuiGrid-align-items-xs-center MuiGrid-justify-xs-center MuiGrid-grid-xs-true"
              >
                <div
                  class="MuiGrid-root MuiGrid-item MuiGrid-grid-xs-true"
                >
                  <h6
                    class="MuiTypography-root makeStyles-title-10 makeStyles-bold-18 MuiTypography-subtitle1 MuiTypography-alignCenter"
                    style="margin-left: 36px;"
                  >
                    string
                  </h6>
                </div>
                <div
                  class="MuiGrid-root MuiGrid-item"
                >
                  <div
                    class="MuiGrid-root makeStyles-actions-13 MuiGrid-container MuiGrid-item MuiGrid-justify-xs-flex-end"
                    data-testid="ModalActions"
                  >
                    <button
                      class="MuiButtonBase-root MuiIconButton-root makeStyles-root-152"
                      tabindex="0"
                      type="button"
                    >
                      <span
                        class="MuiIconButton-label"
                      >
                        <svg
                          aria-hidden="true"
                          class="MuiSvgIcon-root"
                          focusable="false"
                          role="presentation"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                          />
                        </svg>
                      </span>
                      <span
                        class="MuiTouchRipple-root"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="MuiGrid-root makeStyles-fullPage-15 MuiGrid-container MuiGrid-item MuiGrid-justify-xs-center"
            >
              <div
                class="MuiGrid-root makeStyles-content-14 MuiGrid-container MuiGrid-item"
                style="width: 100%;"
              >
                <div
                  class="MuiGrid-root makeStyles-root-1 MuiGrid-container"
                >
                  <div
                    class="MuiGrid-root makeStyles-tabsDiv-5 MuiGrid-item"
                    style="margin-left: 0px;"
                  >
                    <header
                      class="MuiPaper-root MuiPaper-elevation4 MuiAppBar-root MuiAppBar-positionStatic makeStyles-appbar-4 MuiAppBar-colorPrimary"
                    >
                      <div
                        class="MuiTabs-root makeStyles-tabs-2 MuiTabs-vertical"
                      >
                        <div
                          class="MuiTabs-scroller MuiTabs-fixed"
                          style="overflow: hidden;"
                        >
                          <div
                            class="MuiTabs-flexContainer MuiTabs-flexContainerVertical"
                            role="tablist"
                          >
                            <button
                              aria-selected="true"
                              class="MuiButtonBase-root MuiTab-root MuiTab-textColorInherit Mui-selected makeStyles-selected-6"
                              role="tab"
                              tabindex="0"
                              type="button"
                            >
                              <span
                                class="MuiTab-wrapper"
                              >
                                Notifications
                              </span>
                              <span
                                class="MuiTouchRipple-root"
                              />
                            </button>
                          </div>
                          <span
                            class="PrivateTabIndicator-root-234 PrivateTabIndicator-colorSecondary-236 MuiTabs-indicator makeStyles-indicator-3 PrivateTabIndicator-vertical-237"
                            style="top: 0px; height: 0px;"
                          />
                        </div>
                      </div>
                    </header>
                  </div>
                  <div
                    class="MuiGrid-root MuiGrid-item MuiGrid-grid-xs-true"
                  >
                    <div
                      style="overflow: visible; height: 0px; width: 0px;"
                    >
                      <div
                        class="rc-scrollbars-container"
                        style="position: relative; overflow: hidden; width: 0px; height: 0px;"
                      >
                        <div
                          class="rc-scrollbars-view"
                          style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; overflow: scroll; margin-right: 0px; margin-bottom: 0px;"
                        >
                          <div
                            class="MuiGrid-root makeStyles-content-8 MuiGrid-item"
                            style="padding-right: 0px;"
                          >
                            <div
                              class="MuiGrid-root MuiGrid-container MuiGrid-direction-xs-column"
                            >
                              <div
                                class="MuiGrid-root makeStyles-titleDiv-239 MuiGrid-container MuiGrid-item MuiGrid-align-items-xs-center MuiGrid-justify-xs-space-between"
                              >
                                <div
                                  class="MuiGrid-root makeStyles-title-238 MuiGrid-item"
                                >
                                  <h3
                                    class="MuiTypography-root MuiTypography-h3"
                                  >
                                    Notifications
                                  </h3>
                                </div>
                              </div>
                              <div
                                class="MuiGrid-root MuiGrid-item"
                              >
                                <h5
                                  class="MuiTypography-root makeStyles-subtitle-240 MuiTypography-h5"
                                >
                                  Notify me about...
                                </h5>
                              </div>
                              <div
                                class="MuiGrid-root makeStyles-radioDiv-241 MuiGrid-container MuiGrid-item MuiGrid-direction-xs-column"
                              >
                                <div
                                  class="MuiGrid-root makeStyles-spacing-246 MuiGrid-item"
                                >
                                  <label
                                    class="MuiFormControlLabel-root makeStyles-radioIcon-243"
                                  >
                                    <span
                                      aria-disabled="false"
                                      class="MuiButtonBase-root MuiIconButton-root PrivateSwitchBase-root-263 MuiCheckbox-root MuiCheckbox-colorSecondary PrivateSwitchBase-checked-264 Mui-checked MuiIconButton-colorSecondary"
                                    >
                                      <span
                                        class="MuiIconButton-label"
                                      >
                                        <input
                                          checked=""
                                          class="PrivateSwitchBase-input-266"
                                          data-indeterminate="false"
                                          type="checkbox"
                                          value=""
                                        />
                                        <img
                                          src="test-file-stub"
                                        />
                                      </span>
                                      <span
                                        class="MuiTouchRipple-root"
                                      />
                                    </span>
                                    <span
                                      class="MuiTypography-root MuiFormControlLabel-label MuiTypography-body1"
                                    >
                                      <div
                                        class="MuiGrid-root makeStyles-offset-245 MuiGrid-container MuiGrid-direction-xs-column"
                                      >
                                        <div
                                          class="MuiGrid-root MuiGrid-item"
                                        >
                                          <span
                                            class="makeStyles-bold-244"
                                          >
                                            Every new message
                                          </span>
                                        </div>
                                        <div
                                          class="MuiGrid-root MuiGrid-item"
                                        >
                                          <span>
                                            You’ll be notified for every new message
                                          </span>
                                        </div>
                                      </div>
                                    </span>
                                  </label>
                                   
                                </div>
                                <div
                                  class="MuiGrid-root makeStyles-spacing-246 MuiGrid-item"
                                >
                                  <label
                                    class="MuiFormControlLabel-root makeStyles-radioIcon-243"
                                  >
                                    <span
                                      aria-disabled="false"
                                      class="MuiButtonBase-root MuiIconButton-root PrivateSwitchBase-root-263 MuiCheckbox-root MuiCheckbox-colorSecondary MuiIconButton-colorSecondary"
                                    >
                                      <span
                                        class="MuiIconButton-label"
                                      >
                                        <input
                                          class="PrivateSwitchBase-input-266"
                                          data-indeterminate="false"
                                          type="checkbox"
                                          value=""
                                        />
                                        <img
                                          src="test-file-stub"
                                        />
                                      </span>
                                      <span
                                        class="MuiTouchRipple-root"
                                      />
                                    </span>
                                    <span
                                      class="MuiTypography-root MuiFormControlLabel-label MuiTypography-body1"
                                    >
                                      <div
                                        class="MuiGrid-root makeStyles-offset-245 MuiGrid-container MuiGrid-direction-xs-column"
                                      >
                                        <div
                                          class="MuiGrid-root MuiGrid-item"
                                        >
                                          <span
                                            class="makeStyles-bold-244"
                                          >
                                            Direct messages, mentions & keywords
                                          </span>
                                        </div>
                                        <div
                                          class="MuiGrid-root MuiGrid-item"
                                        >
                                          <span>
                                            You’ll be notified when someone mentions you or sends you a direct message.
                                          </span>
                                        </div>
                                      </div>
                                    </span>
                                  </label>
                                </div>
                                <div
                                  class="MuiGrid-root makeStyles-spacing-246 MuiGrid-item"
                                >
                                  <label
                                    class="MuiFormControlLabel-root makeStyles-radioIcon-243"
                                  >
                                    <span
                                      aria-disabled="false"
                                      class="MuiButtonBase-root MuiIconButton-root PrivateSwitchBase-root-263 MuiCheckbox-root MuiCheckbox-colorSecondary MuiIconButton-colorSecondary"
                                    >
                                      <span
                                        class="MuiIconButton-label"
                                      >
                                        <input
                                          class="PrivateSwitchBase-input-266"
                                          data-indeterminate="false"
                                          type="checkbox"
                                          value=""
                                        />
                                        <img
                                          src="test-file-stub"
                                        />
                                      </span>
                                      <span
                                        class="MuiTouchRipple-root"
                                      />
                                    </span>
                                    <span
                                      class="MuiTypography-root MuiFormControlLabel-label MuiTypography-body1"
                                    >
                                      <div
                                        class="MuiGrid-root makeStyles-offset-245 MuiGrid-container MuiGrid-direction-xs-column"
                                      >
                                        <div
                                          class="MuiGrid-root MuiGrid-item"
                                        >
                                          <span
                                            class="makeStyles-bold-244"
                                          >
                                            Nothing
                                          </span>
                                        </div>
                                        <div
                                          class="MuiGrid-root MuiGrid-item"
                                        >
                                          <span>
                                            You won’t receive notificaitons from Quiet.
                                          </span>
                                        </div>
                                      </div>
                                    </span>
                                  </label>
                                </div>
                                <div
                                  class="MuiGrid-root makeStyles-subtitleSoundDiv-248 MuiGrid-item"
                                >
                                  <h5
                                    class="MuiTypography-root makeStyles-subtitle-240 MuiTypography-h5"
                                  >
                                    Sounds
                                  </h5>
                                </div>
                                <div
                                  class="MuiGrid-root makeStyles-radioSoundDiv-242 MuiGrid-container MuiGrid-item MuiGrid-direction-xs-column"
                                >
                                  <div
                                    class="MuiGrid-root MuiGrid-item"
                                  >
                                    <label
                                      class="MuiFormControlLabel-root"
                                    >
                                      <span
                                        aria-disabled="false"
                                        class="MuiButtonBase-root MuiIconButton-root PrivateSwitchBase-root-263 MuiCheckbox-root"
                                      >
                                        <span
                                          class="MuiIconButton-label"
                                        >
                                          <input
                                            class="PrivateSwitchBase-input-266"
                                            data-indeterminate="false"
                                            type="checkbox"
                                            value=""
                                          />
                                          <svg
                                            aria-hidden="true"
                                            class="MuiSvgIcon-root"
                                            focusable="false"
                                            role="presentation"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                                            />
                                          </svg>
                                        </span>
                                        <span
                                          class="MuiTouchRipple-root"
                                        />
                                      </span>
                                      <span
                                        class="MuiTypography-root MuiFormControlLabel-label MuiTypography-body1"
                                      >
                                        <p
                                          class="MuiTypography-root makeStyles-label-249 MuiTypography-body2"
                                        >
                                          Play a sound when receiving a notification
                                        </p>
                                      </span>
                                    </label>
                                  </div>
                                  <div
                                    class="MuiGrid-root makeStyles-spacingSound-250 MuiGrid-item"
                                  >
                                    <label
                                      class="MuiFormControlLabel-root makeStyles-radioSound-247"
                                    >
                                      <span
                                        aria-disabled="false"
                                        class="MuiButtonBase-root MuiIconButton-root PrivateSwitchBase-root-263 MuiCheckbox-root MuiCheckbox-colorSecondary MuiIconButton-colorSecondary"
                                      >
                                        <span
                                          class="MuiIconButton-label"
                                        >
                                          <input
                                            class="PrivateSwitchBase-input-266"
                                            data-indeterminate="false"
                                            type="checkbox"
                                            value=""
                                          />
                                          <img
                                            src="test-file-stub"
                                          />
                                        </span>
                                        <span
                                          class="MuiTouchRipple-root"
                                        />
                                      </span>
                                      <span
                                        class="MuiTypography-root MuiFormControlLabel-label MuiTypography-body1"
                                      >
                                        Pow
                                      </span>
                                    </label>
                                  </div>
                                  <div
                                    class="MuiGrid-root makeStyles-spacingSound-250 MuiGrid-item"
                                  >
                                    <label
                                      class="MuiFormControlLabel-root makeStyles-radioSound-247"
                                    >
                                      <span
                                        aria-disabled="false"
                                        class="MuiButtonBase-root MuiIconButton-root PrivateSwitchBase-root-263 MuiCheckbox-root MuiCheckbox-colorSecondary MuiIconButton-colorSecondary"
                                      >
                                        <span
                                          class="MuiIconButton-label"
                                        >
                                          <input
                                            class="PrivateSwitchBase-input-266"
                                            data-indeterminate="false"
                                            type="checkbox"
                                            value=""
                                          />
                                          <img
                                            src="test-file-stub"
                                          />
                                        </span>
                                        <span
                                          class="MuiTouchRipple-root"
                                        />
                                      </span>
                                      <span
                                        class="MuiTypography-root MuiFormControlLabel-label MuiTypography-body1"
                                      >
                                        Bang
                                      </span>
                                    </label>
                                  </div>
                                  <div
                                    class="MuiGrid-root makeStyles-spacingSound-250 MuiGrid-item"
                                  >
                                    <label
                                      class="MuiFormControlLabel-root makeStyles-radioSound-247"
                                    >
                                      <span
                                        aria-disabled="false"
                                        class="MuiButtonBase-root MuiIconButton-root PrivateSwitchBase-root-263 MuiCheckbox-root MuiCheckbox-colorSecondary MuiIconButton-colorSecondary"
                                      >
                                        <span
                                          class="MuiIconButton-label"
                                        >
                                          <input
                                            class="PrivateSwitchBase-input-266"
                                            data-indeterminate="false"
                                            type="checkbox"
                                            value=""
                                          />
                                          <img
                                            src="test-file-stub"
                                          />
                                        </span>
                                        <span
                                          class="MuiTouchRipple-root"
                                        />
                                      </span>
                                      <span
                                        class="MuiTypography-root MuiFormControlLabel-label MuiTypography-body1"
                                      >
                                        Splat
                                      </span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          class="rc-scrollbars-track rc-scrollbars-track-h"
                          style="position: absolute; right: 2px; bottom: 2px; z-index: 100; border-radius: 3px; left: 2px; height: 6px; display: none;"
                        >
                          <div
                            class="rc-scrollbars-thumb rc-scrollbars-thumb-h"
                            style="position: relative; display: block; height: 100%; cursor: pointer; border-radius: inherit; background-color: rgba(0, 0, 0, 0.2);"
                          />
                        </div>
                        <div
                          class="rc-scrollbars-track rc-scrollbars-track-v"
                          style="position: absolute; right: 2px; bottom: 2px; z-index: 100; border-radius: 3px; top: 2px; width: 6px; display: none;"
                        >
                          <div
                            class="rc-scrollbars-thumb rc-scrollbars-thumb-v"
                            style="position: relative; display: block; height: 100%; cursor: pointer; border-radius: inherit; background-color: rgba(0, 0, 0, 0.2);"
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      class="resize-triggers"
                    >
                      <div
                        class="expand-trigger"
                      >
                        <div
                          style="width: 1px; height: 1px;"
                        />
                      </div>
                      <div
                        class="contract-trigger"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            data-test="sentinelEnd"
            tabindex="0"
          />
        </div>
      </body>
    `)
  })

  it('displays "Add members" tab for community owner', async () => {
    renderComponent(<SettingsModal user='string' owner={true} open handleClose={jest.fn()} />)
    expect(screen.queryByRole('tab', { name: /Notifications/i })).not.toBeNull()
    expect(screen.queryByRole('tab', { name: /Add members/i })).not.toBeNull()
  })

  it('does not display "Add members" tab if user is not a community owner', async () => {
    renderComponent(<SettingsModal user='string' owner={false} open handleClose={jest.fn()} />)
    expect(screen.queryByRole('tab', { name: /Notifications/i })).not.toBeNull()
    expect(screen.queryByRole('tab', { name: /Add members/i })).toBeNull()
  })
})
