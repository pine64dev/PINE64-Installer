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

module.exports = function(
  $http,
  $uibModalInstance,
  ErrorService,
  AppConfigService,
  OSDialogService
  ) {

  // ImageSelector controller
  this.boards = {};
  this.os = null;

  this.selectedBoard = null;
  this.overrideVersion = null;

  this.getBoardList = () => {
    $http.get(AppConfigService.BOARDS_DATA)
      .then((payload) => {
        this.boards = payload.data.boards;
      }).catch(ErrorService.reportException);
  };

  this.getBoardOSes = (board) => {
    this.selectedBoard = board;
    this.os = null;
    $http.get(AppConfigService.getBoardInfo(board.os))
      .then((payload) => {
        this.os = payload.data.os;
      }).catch(ErrorService.reportException);
  };

  this.getImageLogo = (imagePath) => {
    return AppConfigService.PACKAGE_PATH + '/' + imagePath;
  };

  this.setCurrentOS = (os) => {
    if (!this.isOSSelected(os)) {
      // assume selecting different os
      // override version
      this.overrideVersion = null;
    }
    this.selectedOS = os;
  };

  this.setCurrentOSVersion = (version) => {
    this.overrideVersion = version;
  };

  this.getCurrentOSVersion = (os) => {
    if (this.isOSSelected(os)) {
      return this.overrideVersion;
    }

    return;
  };

  this.isOSSelected = (os) => {
    if (!this.selectedOS) {
      return false;
    }

    return os.$$hashKey === this.selectedOS.$$hashKey;
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
