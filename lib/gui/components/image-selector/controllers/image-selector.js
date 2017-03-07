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
const _ = require('lodash');

module.exports = function(
  $http,
  $uibModalInstance,
  ErrorService,
  AppConfigService,
  OSDialogService
  ) {

  // ImageSelector controller
  this.boards = {};
  this.boardImages = null;

  this.selectedBoard = null;
  this.overrideVersion = null;

  this.getBoardList = () => {
    $http.get(AppConfigService.BOARDS_DATA)
      .then((payload) => {
        this.boards = payload.data.boards;
      }).catch(ErrorService.reportException);
  };

  this.getBoardImages = (board) => {
    this.selectedBoard = board;
    this.boardImages = null;
    $http.get(AppConfigService.getBoardInfo(board.os))
      .then((payload) => {
        this.boardImages = payload.data.os;
        for (let os in this.boardImages) {
          const length = _.random(3, 5);

          for (let i=0; i < length; i++) {
            this.boardImages[os].versions.push({
              version: _.random(100000, 99999999),
              images: []
            });
          }
        }
      }).catch(ErrorService.reportException);
  };

  this.getImageLogo = (imagePath) => {
    return AppConfigService.PACKAGE_PATH + '/' + imagePath;
  };

  this.setCurrentOnlineImage = (image) => {
    if (!this.isImageSelected(image)) {
      // assume selecting different os
      // override version
      this.overrideVersion = null;
    }
    this.selectedImage = image;
  };

  this.setCurrentImageVersion = (version) => {
    this.overrideVersion = version;
  };

  this.getCurrentImageVersion = (image) => {
    if (this.isImageSelected(image)) {
      return this.overrideVersion;
    }

    return;
  };

  this.isImageSelected = (image) => {
    if (!this.selectedImage) {
      return false;
    }

    return image.$$hashKey === this.selectedImage.$$hashKey;
  };

  this.init = () => {
    this.getBoardList();
  };

  this.init();

  /**
   * @summary Close the modal
   * @function
   * @public
   *
   * @example
   * ImageSelectorController.closeModal();
   */
  this.closeModal = () => {
    $uibModalInstance.close();
  };

  this.browseLocalImage = () => {
    OSDialogService.selectImage().then((image) => {
      console.log('select image', image);
    });
  };
};
