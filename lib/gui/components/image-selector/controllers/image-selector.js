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
  ErrorService,
  AppConfigService
  ) {

  // ImageSelector controller
  this.boards = {};
  this.boardImages = null;

  this.selectedBoard = null;

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
      }).catch(ErrorService.reportException);
  };

  this.getImageLogo = (imagePath) => {
    return AppConfigService.PACKAGE_PATH + '/' + imagePath;
  };

  this.setCurrentOnlineImage = (image) => {
    this.selectedImage = image;
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
};
