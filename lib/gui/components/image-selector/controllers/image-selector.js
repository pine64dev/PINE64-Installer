/*
 * Copyright 2017 Pine64
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
  $http,
  $uibModalInstance,
  ErrorService,
  AppConfigService,
  OSDialogService,
  SupportedFormatsModel,
  WarningModalService,
  OSOpenExternalService
  ) {

  /**
   * loading flag when retrieve info from online
   */
  this.isLoading = false;

  /**
   * list of supported image extension
   */
  this.supportedExtensions = SupportedFormatsModel.getAllExtensions();

  /**
   * boards list
   */
  this.boards = {};

  /**
   * list of OSes that available for selected board
   */
  this.os = null;

  /**
   * selected board
   */
  this.selectedBoard = null;

  /**
   * selected OS
   */
  this.selectedOS = null;

  /**
   * selected OS version (build).
   * if it is 'undefined' mean user desired to use latest version
   */
  this.overrideVersion = null;

  /**
   * selected image file
   */
  this.selectedImageFile = null;

  /**
   * @summary Getting board list online
   * @function
   * @private
   *
   * @example
   * ImageSelectorController.getBoardList();
   */
  this.getBoardList = () => {
    this.isLoading = true;
    $http.get(AppConfigService.BOARDS_DATA + '?d=' + new Date().getTime())
      .then((payload) => {
        this.boards = payload.data.boards;
        this.isLoading = false;

        if (!this.selectedBoard) {
          // initially, select the first board
          this.getBoardOSes(this.boards[0]);
        }
      }).catch(this.handleFetchError);
  };

  /**
   * @summary Getting selected board's OS list online
   * @function
   * @private
   *
   * @param {Object} board object from getBoardList
   *
   * @example
   * ImageSelectorController.getBoardOSes(board);
   */
  this.getBoardOSes = (board) => {
    this.isLoading = true;

    this.selectedBoard = board;
    this.os = null;

    // reset selected os and version
    this.resetSelectedOS();

    $http.get(AppConfigService.getAbsolutePath(board.os) + '?d=' + new Date().getTime())
      .then((payload) => {
        this.os = payload.data.os;
        this.isLoading = false;
      }).catch(this.handleFetchError);
  };

  /**
   * @summary Prompt user on HTTP error and handle after error.
   * @function
   * @private
   *
   * @param {Object} error - $http error json
   *
   * @example
   * ImageSelectorController.resetSelectedOS();
   */
  this.handleFetchError = (error) => {
    OSDialogService.showError('Unable to fetch data from internet',
      'Please try again later. [HTTP status ' + error.status + ': ' + error.statusText + ']');

    this.isLoading = false;

    this.closeModal();
  };

  /**
   * @summary Reset all user selection on OS and version
   * @function
   * @private
   *
   * @example
   * ImageSelectorController.resetSelectedOS();
   */
  this.resetSelectedOS = () => {
    this.selectedOS = null;
    this.overrideVersion = null;
  };

  /**
   * @summary Obtain correct path to OS's logo from getBoardOSes
   * @function
   * @private
   *
   * @param {String} imagePath logo path
   *
   * @returns {String} correct absolute logo path
   *
   * @example
   * ImageSelectorController.getOSLogo(os.logo);
   */
  this.getOSLogo = (imagePath) => {
    return AppConfigService.getAbsolutePath(imagePath);
  };

  /**
   * @summary User selected an OS
   * @function
   * @private
   *
   * @param {Object} os - data from getBoardOSes
   *
   * @example
   * ImageSelectorController.setCurrentOS(os);
   */
  this.setCurrentOS = (os) => {
    this.resetSelectedImageFile();

    if (!this.isOSSelected(os)) {
      // assume selecting different os
      // override version
      this.overrideVersion = null;
    }
    this.selectedOS = os;
  };

  /**
   * @summary User selected a specific version of the selected OS
   * @function
   * @private
   *
   * @param {Object} version - data from getBoardOSes's specific OS.
   * it has version/build number and list of images related to the version
   *
   * @example
   * ImageSelectorController.setCurrentOSVersion(version);
   */
  this.setCurrentOSVersion = (version) => {
    this.overrideVersion = version;
  };

  /**
   * @summary Obtain current version of the selected OS
   * @function
   * @private
   *
   * @param {Object} os - OS data from getBoardOSes
   *
   * @returns {Object} current selected version data, return null if os is not current selected
   *
   * @example
   * const version = ImageSelectorController.getCurrentOSVersion(os);
   */
  this.getCurrentOSVersion = (os) => {
    if (this.isOSSelected(os)) {
      return this.overrideVersion;
    }

    return;
  };

  /**
   * @summary Check if OS data is current selected
   * @function
   * @private
   *
   * @param {Object} os - OS data from getBoardOSes
   *
   * @returns {Boolean} true if OS data is currently selected
   *
   * @example
   * const isCurrentOS = ImageSelectorController.isOSSelected(os);
   */
  this.isOSSelected = (os) => {
    if (!this.selectedOS) {
      return false;
    }

    return os.$$hashKey === this.selectedOS.$$hashKey;
  };

  /**
   * @summary Check if local image file has being set
   * @function
   * @private
   *
   * @returns {Boolean} true if local image file has being set
   *
   * @example
   * const isCurrentOS = ImageSelectorController.hasCurrentSelectedImageFile(os);
   */
  this.hasCurrentSelectedImageFile = () => {
    return this.selectedImageFile !== null;
  };

  /**
   * @summary Controller initialization
   * @function
   * @private
   */
  this.init = () => {
    this.getBoardList();
  };

  /**
   * @summary Close the modal
   * @function
   * @public
   *
   * @param {Object} option - pass this controller back if user wanted to confirm the selection
   *
   * @example
   * ImageSelectorController.closeModal();
   */
  this.closeModal = (option) => {
    let result = null;

    if (option) {
      if (option.hasCurrentSelectedImageFile()) {
        result = {
          localImage: option.selectedImageFile
        };
      } else if (option.selectedOS !== null) {
        console.log('selected os', option.selectedOS);

        // prompt user on extra instructions
        if (option.selectedOS.instructions
            && option.selectedOS.instructionsUrl) {

          // prompt user about extra steps
          WarningModalService.display({
            confirmationLabel: 'Visit the site',
            rejectionLabel: 'Continue',
            description: option.selectedOS.instructions
          }).then((answer) => {
            if (answer) {
              OSOpenExternalService.open(option.selectedOS.instructionsUrl);
            }
          });
        } else {
          result = {
            selectedOS: option.selectedOS,
            selectedVersion: option.overrideVersion || option.selectedOS.versions[0]
          };
        }
      }
    }

    $uibModalInstance.close(result);
  };

  /**
   * @summary Trigger file browser for use to select local image file
   * @function
   * @private
   *
   * @example
   * ImageSelectorController.browseLocalImage();
   */
  this.browseLocalImage = () => {
    OSDialogService.selectImage().then((image) => {
      if (!image) {
        return;
      }

      // assume user selected an image
      this.selectLocalImage(image);
    });
  };

   /**
   * @summary Register local image
   * @function
   * @private
   *
   * @param {Object} image - local image file data
   *
   * @example
   * ImageSelectorController.browseLocalImage();
   */
  this.selectLocalImage = (image) => {
    // validate image file
    if (!SupportedFormatsModel.isSupportedImage(image.path)) {
      OSDialogService.showError('Invalid image', messages.error.invalidImage({
        image: image
      }));

      return;
    }

    this.resetSelectedOS();
    this.selectedImageFile = image;
  };

  /**
   * @summary Reset current selected image file
   * @function
   * @private
   *
   * @example
   * ImageSelectorController.resetSelectedImageFile();
   */
  this.resetSelectedImageFile = () => {
    this.selectedImageFile = null;
  };

  /**
   * @summary Determine if OK Button to be disabled. Only one of selectedOS or currentImageFile has being set.
   * @function
   * @private
   *
   * @returns {Boolean} OK Button to be disabled
   *
   * @example
   * ImageSelectorController.resetSelectedImageFile();
   */
  this.shouldOKButtonDisabled = () => {
    return this.selectedOS === null && !this.hasCurrentSelectedImageFile();
  };
};
