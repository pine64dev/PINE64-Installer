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
const crypto = require('crypto');
const FastDownload = require('fast-download');
const fs = Bluebird.promisifyAll(require('fs'));
const path = require('path');
const url = require('url');
const errors = require('./errors');
const utils = require('./utils');
const requestModules = {
  'http:': require('http'),
  'https:': require('https')
};

/**
 * @summary Download file from internet to local directory.
 * @function
 *
 * @param {String} imageUrl - image URL
 * @param {String} imagePath - local path to store the downloaded image as
 * @param {utils.Progress} progress - progress object
 *
 * @example
 * downloadImage('http://.../image.iso', '/folder/image.iso', (state) => {
 *     console.log(state);
 *   });
 *
 * @returns {Promise} No argument.
 */
exports.downloadImage = (imageUrl, imagePath, progress) => {
  const urlObject = url.parse(imageUrl);
  const requestModule = _.get(requestModules, urlObject.protocol, null);
  if (_.isNull(requestModule)) {
    return Bluebird.reject(Error('unsupported network protocol'));
  }

  return new Bluebird((resolve, reject) => {
    const imageWriter = fs.createWriteStream(imagePath);
    const abortAndReject = (error) => {
      progress.abort();
      reject(error);
    };

    imageWriter.on('open', () => {
      const request = requestModule.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          return abortAndReject(new Error('status code !== 200'));
        }

        // `percentage` and `eta` will becomes -1 if 'content-length' is 0;
        // and that is the behavior we want.
        progress.setTotalSize(_.get(response.headers, 'content-length', 0));

        response.on('data', (chunk) => {
          imageWriter.write(chunk);
          progress.update(chunk.length);
        });
        response.on('end', () => {
          imageWriter.end(() => {
            progress.complete();
            resolve();
          });
        });
      });
      request.on('error', abortAndReject);
      request.setTimeout(30000, abortAndReject);
    });
    imageWriter.on('error', abortAndReject);
  });
};

/**
 * @summary Download file from internet to local directory, same to
 *   downloadImage except that this module uses multiple connections for download.
 * @function
 *
 * @param {String} imageUrl - image URL
 * @param {String} imagePath - local path to store the downloaded image as
 * @param {utils.Progress} progress - progress object
 *
 * @returns {Promise} No argument.
 */
exports.fastDownloadImage = (imageUrl, imagePath, progress) => {
  return new Bluebird((resolve, reject) => {
    const dl = new FastDownload(imageUrl, {
      destFile: imagePath,
      resumeFile: true,
      chunksAtOnce: 7,
      timeout: 30000
    });

    dl.on('start', () => {
      progress.setTotalSize(dl.file_size);
      progress.setStartSize(_.get(dl, '_options').start);
    });

    dl.on('data', (chunk) => {
      progress.update(chunk.length);
    });

    dl.on('end', () => {
      progress.complete();
      resolve();
    });

    dl.on('error', (error) => {
      progress.abort();
      reject(error);
    });
  });
};

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
 * @summary Assert image file exists, and verify the checksum if given.
 * @function
 *
 * @param {String} imagePath - image path
 * @param {String} checksum - checksum hash value
 * @param {String} checksumType - checksum type
 * @param {utils.Progress} progress - progress object
 *
 * @returns {Promise} One argument (imagePath)
 */
exports.verifyChecksum = (imagePath, checksum, checksumType, progress) => {
  // `checksum` is not given, check for file existance is enough.
  return new Bluebird((resolve, reject) => {
    const imageReader = fs.createReadStream(imagePath);
    const hash = crypto.createHash(checksumType);
    const abortProgress = (error) => {
      progress.abort();
      reject(error);
    };

    imageReader.on('error', abortProgress);

    imageReader.on('data', (chunk) => {
      hash.update(chunk);
      progress.update(chunk.length);
    });

    imageReader.on('end', () => {
      if (hash.digest('hex') === checksum.toLowerCase()) {
        progress.complete();
        resolve(imagePath);
      } else {
        abortProgress(new Error('checksum failed'));
      }
    });
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

  const imageName = utils.extractNameFromURL(image);
  const imagePath = isImageURL ? path.join(downloadLocation, imageName) : image;
  const checksum = _.get(options, 'checksum', '');
  const checksumType = _.get(options, 'checksumType', 'md5');

  // Verify file exists, and verify checksum if provided.
  const verifyImage = (imagePathToVerify) => {
    return exports.getImageFileSize(imagePathToVerify).then((fileSize) => {
      if (_.isEmpty(checksum)) {
        return Bluebird.resolve(imagePathToVerify);
      }

      return exports.verifyChecksum(
        imagePathToVerify,
        checksum,
        checksumType,
        new utils.Progress(
          (percentage, eta, speed) => {
            onProgress({
              type: 'checksum',
              percentage: percentage,
              eta: eta,
              speed: speed
            });
          },
          fileSize));
    });
  };

  const renameAndResolve = (oldPath, newPath) => {
    return fs.renameAsync(oldPath, newPath).then(() => {
      return Bluebird.resolve(imagePath);
    });
  };

  const deleteAndReject = (imagePathToDelete, error) => {
    return fs.unlinkAsync(imagePathToDelete).finally(() => {
      return Bluebird.reject(error);
    });
  };

  // create new progress object for download
  const newDownloadProgress = () => {
    return new utils.Progress((percentage, eta, speed) => {
      onProgress({
        type: 'download',
        percentage: percentage,
        eta: eta,
        speed: speed
      });
    });
  };

  return verifyImage(imagePath).catch(() => {
    if (!isImageURL) {
      return Bluebird.reject(errors.ChecksumError);
    }

    const downloadPath = imagePath + '.download';

    return exports.fastDownloadImage(image, downloadPath, newDownloadProgress())
      .then(() => {
        return verifyImage(downloadPath)
          .then(_.partial(renameAndResolve, downloadPath, imagePath))
          .catch(() => {
            deleteAndReject(errors.ChecksumError);
          });
      })
      .catch((error) => {
        // fast-download connection/read error: do not fall back to normal download
        if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
          return Bluebird.reject(errors.ConnInterruptError);
        }

        // fast-download failed: fall back to use normal download
        return exports.downloadImage(image, downloadPath, newDownloadProgress())
          .then(() => {
            return verifyImage(downloadPath)
              .then(_.partial(renameAndResolve, downloadPath, imagePath))
              .catch(() => {
                deleteAndReject(errors.ChecksumError);
              });
          })
          .catch(() => {
            deleteAndReject(errors.ConnInterruptError);
          });
      });
  });

};
