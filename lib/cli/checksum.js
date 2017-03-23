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

const Bluebird = require('bluebird');
const crypto = require('crypto');
const fs = Bluebird.promisifyAll(require('fs'));

/**
 * @summary Verify checksum of the file..
 * @function
 *
 * @param {String} path - file path
 * @param {String} checksumValue - checksum hash value
 * @param {String} checksumType - checksum type
 * @param {utils.Progress} progress - progress object
 *
 * @returns {Promise} No arguments.
 */
exports.verify = (path, checksumValue, checksumType, progress) => {
  const task = (resolve, reject) => {
    const imageReader = fs.createReadStream(path);
    const hash = crypto.createHash(checksumType);
    const abortProgress = (error) => {
      progress.abort();
      reject(error);
    };

    imageReader.on('data', (chunk) => {
      hash.update(chunk);
      progress.update(chunk.length);
    });

    imageReader.on('error', abortProgress);

    imageReader.on('end', () => {
      if (hash.digest('hex') === checksumValue.toLowerCase()) {
        progress.complete();
        resolve();
      } else {
        abortProgress(new Error('checksum failed'));
      }
    });
  };

  return new Bluebird(task);
};
