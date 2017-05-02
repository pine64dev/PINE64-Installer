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

const _ = require('lodash');
const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const path = require('path');
const checksum = require('./checksum');
const downloader = require('./downloader');
const errors = require('./errors');
const utils = require('./utils');

/**
 * @summary Get image file size.
 * @function
 *
 * @param {String} imagePath - image path
 *
 * @returns {Promise} One argument (fileSize)
 */
exports.getImageFileSize = (imagePath) => {
  // Do not catch "no such file" error, propagates it instead.
  return fs.statAsync(imagePath)
    .then((stat) => {
      // Returns 0 if failed to retrieve the size.
      return Bluebird.resolve(_.get(stat, 'size', 0));
    });
};

/**
 * @summary Get final image path, will download the image from http into given directory if necessary.
 * @function
 * @public
 *
 * @param {String} image - image path or url
 * @param {Object} options - options
 * @param {String} [options.checksum] - checksum hash value
 * @param {String} [options.checksumType='md5'] - checksum type
 * @param {String} [options.downloadLocation] - location to store downloaded file
 * @param {Function} onProgress - callback for downloading progress (state)
 *
 * @returns {Promise} One argument (imagePath)
 */
exports.ensureLocalImage = (image, options, onProgress) => {
  const isImageURL = utils.isNetworkResource(image);
  const downloadLocation = _.get(options, 'downloadLocation', null);

  if (isImageURL && _.isEmpty(downloadLocation)) {
    return Bluebird.reject(Error('--downloadLocation is not specified'));
  }

  const imageName = utils.extractHostnameFromURL(image) + '_' + utils.extractNameFromURL(image);
  const imagePath = isImageURL ? path.join(downloadLocation, imageName) : image;
  const checksumValue = _.get(options, 'checksum', '');
  const checksumType = _.get(options, 'checksumType', 'md5');

  const onDownloadProgress = (percentage, eta, speed) => {
    onProgress({
      type: 'download',
      percentage: percentage,
      eta: eta,
      speed: speed
    });
  };

  const onChecksumProgress = (percentage, eta, speed) => {
    onProgress({
      type: 'checksum',
      percentage: percentage,
      eta: eta,
      speed: speed
    });
  };

  // Assert file exists, and verify checksum value if provided.
  const verifyImage = (imagePathToVerify) => {
    return exports.getImageFileSize(imagePathToVerify)
      .then((fileSize) => {
        if (_.isEmpty(checksumValue)) {
          return Bluebird.resolve(imagePathToVerify);
        }

        onChecksumProgress(0, -1, -1);

        const INITIAL_UPDATE_DELAY = 1000;
        const progress = new utils.Progress(onChecksumProgress,
                                            fileSize,
                                            INITIAL_UPDATE_DELAY);
        return checksum.verify(
          imagePathToVerify,
          checksumValue,
          checksumType,
          progress).then(() => {
            return Bluebird.resolve(imagePathToVerify);
          });
      });
  };

  const deleteAndReject = (imagePathToDelete, error) => {
    return fs.unlinkAsync(imagePathToDelete).finally(() => {
      return Bluebird.reject(error);
    });
  };

  return verifyImage(imagePath).catch(() => {
    if (!isImageURL) {
      return Bluebird.reject(errors.ChecksumError);
    }

    onDownloadProgress(0, -1, -1);
    return downloader.download(image,
                               imagePath,
                               new utils.Progress(onDownloadProgress))
      .then(() => {
        return verifyImage(imagePath)
          .catch(() => {
            deleteAndReject(errors.ChecksumError);
          });
      });
  });
};
