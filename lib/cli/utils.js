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

    this.isUpdateStarted = false;
    this.isCompleted = false;

    this.averageSpeed = 0;
    this.lastSize = 0;
    this.smoothingFactor = 0.0005;
  }

  /**
   * Update total size, must be called before update.
   * @param {Number} size - total size
   */
  setTotalSize(size) {
    if (this.isUpdateStarted) {
      throw new Error('too late to set total size');
    }
    this.totalSize = size;
  }

  /**
   * Update total size, must be called before update.
   * @param {Number} size - total size
   */
  setStartSize(size) {
    if (this.isUpdateStarted) {
      throw new Error('too late to set start size');
    }
    this.updatedSize = this.lastSize = size;
  }

  /**
   * Update progress bar to new size.
   * @param {Number} size - size received / progressed / ...
   */
  update(size) {
    this.updatedSize += size;

    if (!this.isUpdateStarted) {
      this.isUpdateStarted = true;

      // initialize progress with unknown etimated time
      this.onProgress(this.percentage, -1, size);

      // gives 2 seconds so that average speed is more accurate
      setTimeout(() => {
        this.lastSize = this.averageSpeed = (this.updatedSize - this.lastSize) / 2;
        this.updateProgressInfo();
      }, 2000);
    }
  }

  /**
   * Update progress bar info, must be called every 1 seconds.
   */
  updateProgressInfo() {
    const lastSpeed = this.updatedSize - this.lastSize;

    const current = this.smoothingFactor * lastSpeed;
    const average = (1 - this.smoothingFactor) * this.averageSpeed;
    this.averageSpeed = current + average;

    this.lastSize = this.updatedSize;

    let eta = -1;

    // average speed cannot be lower than 0
    if (this.averageSpeed > 0) {
      const pendingSize = this.totalSize - this.updatedSize;
      eta = pendingSize >= 0 ? Math.floor(pendingSize / this.averageSpeed) : -1;
    }

    if (!this.isCompleted) {
      // make sure eta is not lower than 1 seconds, only `complete` can have eta of 0
      this.onProgress(this.percentage, _.clamp(eta, 1, eta), lastSpeed);

      setTimeout(() => {
        this.updateProgressInfo();
      }, 1000);
    }
  }

  /**
   * Get current progress in percentage.
   * @returns {Number} percentage
   */
  get percentage() {
    // unable to calculate if total size is <= 0
    if (this.totalSize <= 0) {
      return -1;
    }

    const percentage = this.updatedSize / this.totalSize * 100;

    // check if percentage < 0, in case updated size becomes larger than expected total size
    return percentage < 0 ? -1 : _.clamp(percentage, percentage, 99);
  }

  /**
   * Abort this progress.
   */
  abort() {
    this.isCompleted = true;
  }

  /**
   * Complete this progress.
   */
  complete() {
    this.isCompleted = true;
    this.onProgress(100, 0, 0);
  }
};
