/*
 * Copyright 2016 resin.io
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

/**
 * @summary Convert bytes to gigabytes
 * @function
 * @public
 *
 * @param {Number} bytes - bytes
 * @returns {Number} gigabytes
 *
 * @example
 * const result = units.bytesToGigabytes(7801405440);
 */
exports.bytesToGigabytes = (bytes) => {
  return bytes / 1e+9;
};

/**
 * @summary Convert bytes to megabytes
 * @function
 * @public
 *
 * @param {Number} bytes - bytes
 * @returns {Number} megabytes
 *
 * @example
 * const result = units.bytesToMegabytes(7801405440);
 */
exports.bytesToMegabytes = (bytes) => {
  return bytes / 1e+6;
};

  /**
   * @summary Convert bytes to file size in (B, KB, MB, GB).
   * @function
   * @public
   *
   * @param {Number} bytes = bytes
   * @param {Number} decimal = decimal places
   *
   * @returns {String} bytes either in B, KB, MB, GB
   *
   * @example
   * FlashController.getBytesToSize();
   */
exports.bytesToSize = (bytes, decimal) => {
  if (!(bytes > 0)) {
    return '0 B';
  }

  const k = 1000;
  const dm = decimal || 2;
  const sizes = [ 'B', 'KB', 'MB', 'GB' ];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
