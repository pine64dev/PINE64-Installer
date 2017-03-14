/*
 * Copyright 2016 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const messages = require('../../../../shared/messages');

module.exports = function(
  $state,
  FlashStateModel,
  SettingsModel,
  DriveScannerService,
  ImageWriterService,
  AnalyticsService,
  FlashErrorModalService,
  ErrorService,
  OSNotificationService,
  OSWindowProgressService
) {

  /**
   * @summary Flash image to a drive
   * @function
   * @public
   *
   * @param {String} image - image
   * @param {Object} drive - drive
   *
   * @example
   * FlashController.flashImageToDrive('rpi.img', {
   *   device: '/dev/disk2',
   *   description: 'Foo',
   *   size: 99999,
   *   mountpoint: '/mnt/foo',
   *   system: false
   * });
   */
  this.flashImageToDrive = (image, drive) => {
    if (FlashStateModel.isFlashing()) {
      return;
    }

    // Stop scanning drives when flashing
    // otherwise Windows throws EPERM
    DriveScannerService.stop();

    AnalyticsService.logEvent('Flash', {
      image: image,
      device: drive.device
    });

    ImageWriterService.flash(image, drive).then(() => {
      if (FlashStateModel.wasLastFlashCancelled()) {
        return;
      }

      OSNotificationService.send('Success!', messages.info.flashComplete());
      AnalyticsService.logEvent('Done');
      $state.go('success');
    })
    .catch((error) => {
      OSNotificationService.send('Oops!', messages.error.flashFailure());

      if (error.code === 'EVALIDATION') {
        FlashErrorModalService.show(messages.error.validation());
        AnalyticsService.logEvent('Validation error');
      } else if (error.code === 'ENOSPC') {
        FlashErrorModalService.show(messages.error.notEnoughSpaceInDrive());
        AnalyticsService.logEvent('Out of space');
      } else if (error.code === 'ECONNINTERRUPT') {
        FlashErrorModalService.show(messages.error.downloadTimeout());
      } else if (error.code === 'ECHECKSUM') {
        FlashErrorModalService.show(messages.error.checksumFail());
      } else {
        FlashErrorModalService.show(messages.error.genericFlashError());
        ErrorService.reportException(error);
        AnalyticsService.logEvent('Flash error');
      }

    })
    .finally(() => {
      OSWindowProgressService.clear();
      DriveScannerService.start();
    });
  };

  /**
   * @summary Get progress button label
   * @function
   * @public
   *
   * @returns {String} progress button label
   *
   * @example
   * const label = FlashController.getProgressButtonLabel();
   */
  this.getProgressButtonLabel = () => {
    const flashState = FlashStateModel.getFlashState();

    let label = 'Flash!';
    if (FlashStateModel.isFlashing()) {
      switch (flashState.type) {
        default: {
          label = 'Starting';
          break;
        }

        case 'download': {
          label = `${flashState.percentage}% Downloading...`;
          break;
        }

        case 'checksum': {
          label = `${flashState.percentage}% Checking...`;
          break;
        }

        case 'write': {
          label = `${flashState.percentage}% Flashing...`;
          break;
        }

        case 'check': {
          if (flashState.percentage === 100 && SettingsModel.get('unmountOnSuccess')) {
            label = 'Unmounting...';
          } else {
            label = `${flashState.percentage}% Validating...`;
          }
          break;
        }
      }
    }

    return label;
  };

};
