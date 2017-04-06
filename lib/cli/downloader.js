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

/**
 * @summary Check is network connection error.
 * @function
 * @private
 *
 * @param {Object} error - error object.
 *
 * @returns {Promise} No argument.
 */
exports.isConnError = (error) => {
  if (error.code === 'ETIMEDOUT'
      || error.code === 'ESOCKETTIMEDOUT'

      // raised on Linux when internet is down when downloading starts
      || error.code === 'EAI_AGAIN'

      // raised on Windows when internet is down when downloading starts
      || error.code === 'ENOTFOUND'

      // raised on Windows when internet connection is unstable
      || error.code === 'ECONNRESET') {
    return true;
  }
  return false;
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
    const onNext = () => {
      return;
    };
    const onError = (error) => {
      reject(error);
    };
    const onCompleted = () => {
      resolve();
    };

    // eslint-disable-next-line new-cap
    mtd.CreateMTDFile({
      url: url,
      path: path,
      timeout: timeout
    }).subscribe(onNext, onError, onCompleted);
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
    // empty function that does nothing
    const placeholder = () => {
      return;
    };

    const resolveTask = () => {
      progress.complete();
      resolve();
    };
    const rejectTask = (error) => {
      progress.abort();
      reject(error);
    };

    const calculateDownloaded = (meta) => {
      const values = _.zipWith(meta.threads, meta.offsets, _.concat);
      return _.reduce(values, (accumulator, value) => {
        return accumulator + (value[2] - value[0]);
      }, 0);
    };

    // eslint-disable-next-line new-cap
    const dl$ = mtd.DownloadFromMTDFile(path);

    // eslint-disable-next-line array-bracket-spacing, object-curly-newline
    const [{ meta$, fdR$ }] = demux(dl$, 'meta$', 'fdR$');

    let currentDownloaded = 0;

    dl$.subscribeOnError(rejectTask);

    meta$.take(1).subscribe((meta) => {
      currentDownloaded = calculateDownloaded(meta);
      progress.setTotalSize(meta.totalBytes);
      progress.setStartSize(currentDownloaded);
      progress.startUpdate();
    });

    meta$.skip(1).throttle(500).subscribe((meta) => {
      const downloaded = calculateDownloaded(meta);
      progress.update(downloaded - currentDownloaded);
      currentDownloaded = downloaded;
    }, rejectTask, placeholder);

    // eslint-disable-next-line new-cap
    mtd.FinalizeDownload({
      fd$: fdR$,
      meta$: meta$.last()
    }).subscribe(placeholder, rejectTask, resolveTask);
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

  const downloadWrapper = () => {
    return exports.downloadFromMTDFile(mtdPath, progress)
      .catch((error) => {
        if (exports.isConnError(error)) {
          error = errors.ConnInterruptError;
        }
        return Bluebird.reject(error);
      });
  };

  return fs.statAsync(mtdPath)
    .then(() => {
      return downloadWrapper();
    }, () => {
      return exports.createMTDFile(url, path)
        .then(() => {
          return downloadWrapper();
        }, (error) => {
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
    });
};
