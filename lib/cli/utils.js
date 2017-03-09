/*
 * Copyright 2017 CloudMedia Sdn. Bhd.
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
const url = require('url');
const filenamify = require('filenamify');

/**
 * @summary Check is given string is downloadable content.
 * @function
 *
 * @param {String} str - any string
 *
 * @returns {Boolean}
 */
exports.isNetworkResource = (str) => {
  return _.startsWith(str, 'http');
};

/**
 * @summary Extract image name from URL
 * @function
 *
 * @param {String} urlString - URL
 *
 * @returns {String}
 */
exports.extractNameFromURL = (urlString) => {
  const name = filenamify(_.last(_.split(url.parse(urlString).pathname, '/')));
  if (_.isEmpty(name)) {
    throw new Error('no valid file name in url');
  }
  return name;
};

/** Class representing a progress. */
exports.Progress = class {
  /**
   * Create a point.
   * @param {Function} onProgress - on progress callback (percentage, eta, speed)
   * @param {Number} [totalSize=0] - total size.
   */
  constructor(onProgress, totalSize) {
    this.onProgress = onProgress;
    this.totalSize = _.isInteger(totalSize) ? totalSize : 0;
    this.updatedSize = 0;
    this.prevSize = 0;
    this.prevSeconds = -1;
  }

  /**
   * Update total size.
   * @param {Number} size - total size
   */
  setTotalSize(size) {
    this.totalSize = size;
  }

  /**
   * Update progress bar to new size.
   * @param {Number} size - size received / progressed / ...
   */
  update(size) {
    const currentSeconds = process.hrtime()[0];
    this.updatedSize += size;

    // Callback onProgress every seconds to prevent flooding UI with updates.
    if (this.prevSeconds !== currentSeconds) {
      const speed = this.updatedSize - this.prevSize;
      let percentage = this.updatedSize / this.totalSize * 100;
      let eta = Math.floor((this.totalSize - this.updatedSize) / speed);

      percentage = percentage > 100 ? -1 : _.clamp(percentage, 0, 99);
      eta = eta < 0 ? -1 : _.clamp(eta, 1, eta);

      this.prevSize = this.updatedSize;
      this.prevSeconds = currentSeconds;

      this.onProgress(percentage, eta, speed);
    }
  }

  /**
   * Complete this progress.
   */
  complete() {
    this.onProgress(100, 0, 0);
  }
};
