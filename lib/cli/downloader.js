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
const demux = require('muxer').demux;
const fs = Bluebird.promisifyAll(require('fs'));
const mtd = require('mt-downloader');
const errors = require('./errors');

// Number of concurrent downloads.
const range = 1;

// Throttles the write frequency of meta data.
const metaWrite = 500;

/**
 * @summary Check is network connection error.
 * @function
 * @private
 *
 * @param {Object} error - error object.
 *
 * @returns {Boolean} True if error is caused by internet connection issue.
 */
exports.isConnError = (error) => {
  // EAI_AGAIN: (Linux) internet is down when downloading start.
  // ENOTFOUND: (Windows) internet is down when downloading starts.
  // ECONNRESET: (Windows) internet connection is unstable.
  return [ 'ETIMEDOUT', 'ESOCKETTIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND', 'ECONNRESET' ].indexOf(error.code) > -1;
};

/**
 * @summary Create download MTD file.
 * @function
 * @private
 *
 * @param {String} url - download URL.
 * @param {String} path - path to store downloaded file, `.mtd` extension will
 *  be appended.
 * @param {Number} [timeout=30000] - connection timeout value in milliseconds
 *
 * @returns {Promise} No argument.
 */
exports.createMTDFile = (url, path, timeout = 30000) => {
  const task = (resolve, reject) => {
    // eslint-disable-next-line new-cap
    mtd.CreateMTDFile({
      url: url,
      path: path,
      timeout: timeout,
      range: range,
      metaWrite: metaWrite
    })
    .subscribe(undefined, reject, resolve);
  };

  return new Bluebird(task);
};

/**
 * @summary Starts downloading from MTD file.
 * @function
 * @private
 *
 * @param {String} path - MTD file path.
 * @param {utils.Progress} progress - progress object
 *
 * @returns {Promise} No argument.
 */
exports.downloadFromMTDFile = (path, progress) => {

  const task = (resolve, reject) => {

    const calculateDownloaded = (meta) => {
      const values = _.zipWith(meta.threads, meta.offsets, _.concat);
      return _.reduce(values, (accumulator, value) => {
        return accumulator + (value[2] - value[0]);
      }, 0);
    };

    // eslint-disable-next-line new-cap
    const dl$ = mtd.DownloadFromMTDFile(path, {
      range: range,
      metaWrite: metaWrite
    });

    // eslint-disable-next-line array-bracket-spacing, object-curly-newline
    const [{ meta$, fdR$ }] = demux(dl$, 'meta$', 'fdR$');

    let currentDownloaded = null;

    meta$
    .catch((error) => {
      throw error;
    })
    .throttle(500)
    .subscribe((meta) => {
      const downloaded = calculateDownloaded(meta);
      if (!_.isNumber(downloaded)) {
        return;
      }
      if (_.isNull(currentDownloaded)) {
        currentDownloaded = downloaded;
        progress.setTotalSize(meta.totalBytes);
        progress.setStartSize(currentDownloaded);
        progress.startUpdate();
      } else {
        progress.update(downloaded - currentDownloaded);
        currentDownloaded = downloaded;
      }
    }, reject);

    const lastMeta$ = meta$
      .catch((error) => {
        throw error;
      })
      .last();

    // eslint-disable-next-line new-cap
    mtd.FinalizeDownload({
      fd$: fdR$,
      meta$: lastMeta$
    })
    .catch((error) => {
      throw error;
    })
    .subscribe(resolve, reject);

  };

  return new Bluebird(task);
};

/**
 * @summary Download file, resume downloading is supported.
 * @function
 * @public
 *
 * @param {String} url - download URL.
 * @param {String} path - path to store downloaded file.
 * @param {utils.Progress} progress - progress object
 *
 * @returns {Promise} No argument.
 */
exports.download = (url, path, progress) => {
  // eslint-disable-next-line new-cap
  const mtdPath = mtd.MTDPath(path);

  const startDownload = () => {
    return exports.downloadFromMTDFile(mtdPath, progress)
      .catch((error) => {
        if (exports.isConnError(error)) {
          error = errors.ConnInterruptError;
        }
        return Bluebird.reject(error);
      });
  };

  const createDownload = () => {
    return exports.createMTDFile(url, path)
      .catch((error) => {
        if (error.code === 'ENOSPC') {
          error = errors.DownloadNoSpaceError;
        } else if (exports.isConnError(error)) {
          error = errors.ConnInterruptError;
        }

        // clear partially created MTD file in case
        return fs.unlinkAsync(mtdPath)
          .finally(() => {
            return Bluebird.reject(error);
          });
      });
  };

  const createAndDownload = () => {
    return createDownload()
      .then(() => {
        return startDownload().then(
          () => {
            progress.complete();
            return Bluebird.resolve();
          },
          (error) => {
            progress.abort();
            return Bluebird.reject(error);
          });
      });
  };

  const resumeDownload = () => {
    return startDownload()
      .then(
        () => {
          progress.complete();
          return Bluebird.resolve();
        },
        (error) => {
          if (error !== errors.ConnInterruptError) {
            return createAndDownload();
          }
          progress.abort();
          return Bluebird.reject(error);
        });
  };

  return fs.statAsync(mtdPath).then(resumeDownload, createAndDownload);
};
