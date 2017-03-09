/*
 * Copyright 2017 cloud media
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
  SupportedFormatsModel
  ) {

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
    $http.get(AppConfigService.BOARDS_DATA)
      .then((payload) => {
        this.boards = payload.data.boards;
      }).catch(ErrorService.reportException);
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
    this.selectedBoard = board;
    this.os = null;

    // reset selected os and version
    this.resetSelectedOS();

    $http.get(AppConfigService.getAbsolutePath(board.os))
      .then((payload) => {
        this.os = payload.data.os;
      }).catch(ErrorService.reportException);
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
   * @example
   * ImageSelectorController.closeModal();
   */
  this.closeModal = () => {
    let result = null;
    if (this.hasCurrentSelectedImageFile()) {
      result = {
        localImage: this.selectedImageFile
      };
    } else if (this.selectedOS !== null) {
      result = {
        selectedOS: this.selectedOS,
        selectedVersion: this.overrideVersion || this.selectedOS.versions[0]
      };
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

      // validate image file
      if (!SupportedFormatsModel.isSupportedImage(image.path)) {
        OSDialogService.showError('Invalid image', messages.error.invalidImage({
          image: image
        }));

        return;
      }

      this.resetSelectedOS();
      this.selectedImageFile = image;
    });
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