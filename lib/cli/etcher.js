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

const _ = require('lodash');
const Bluebird = require('bluebird');
const isElevated = Bluebird.promisify(require('is-elevated'));
const visuals = require('resin-cli-visuals');
const form = require('resin-cli-form');
const drivelist = Bluebird.promisifyAll(require('drivelist'));
const writer = require('./writer');
const errors = require('./errors');
const image = require('./image');
const options = require('./options');
const robot = require('../shared/robot');
const messages = require('../shared/messages');
const EXIT_CODES = require('../shared/exit-codes');

isElevated().then((elevated) => {
  if (!elevated) {
    throw new Error(messages.error.elevationRequired());
  }

  return form.run([
    {
      message: 'Select drive',
      type: 'drive',
      name: 'drive'
    },
    {
      message: 'This will erase the selected drive. Are you sure?',
      type: 'confirm',
      name: 'yes',
      default: false
    }
  ], {
    override: {
      drive: options.drive,

      // If `options.yes` is `false`, pass `undefined`,
      // otherwise the question will not be asked because
      // `false` is a defined value.
      yes: robot.isEnabled(process.env) || options.yes || undefined

    }
  });
}).then((answers) => {
  if (!answers.yes) {
    throw new Error('Aborted');
  }

  const progressBars = {
    download: new visuals.Progress('Downloading'),
    checksum: new visuals.Progress('Checking'),
    write: new visuals.Progress('Flashing'),
    check: new visuals.Progress('Validating')
  };

  return drivelist.listAsync().then((drives) => {
    const selectedDrive = _.find(drives, {
      device: answers.drive
    });

    if (!selectedDrive) {
      throw new Error(`Drive not found: ${answers.drive}`);
    }

    const onProgress = (state) => {
      if (robot.isEnabled(process.env)) {
        robot.printMessage('progress', {
          type: state.type,
          percentage: Math.floor(state.percentage),
          eta: state.eta,
          speed: Math.floor(state.speed)
        });
      } else {
        progressBars[state.type].update(state);
      }
    };

    return image.ensureLocalImage(options._[0], {
      checksum: options.checksum,
      checksumType: options.checksumType,
      downloadLocation: options.downloadLocation
    }, onProgress)
      .then((imagePath) => {
        // Signal flashing/writing state started.
        onProgress({
          type: 'write',
          percentage: 0,
          eta: -1,
          speed: -1
        });

        return writer.writeImage(imagePath, selectedDrive, {
          unmountOnSuccess: options.unmount,
          validateWriteOnSuccess: options.check
        }, onProgress);
      });
  });
}).then((results) => {

  return Bluebird.try(() => {
    if (robot.isEnabled(process.env)) {
      return robot.printMessage('done', {
        sourceChecksum: results.sourceChecksum
      });
    }

    console.log(messages.info.flashComplete());

    if (results.sourceChecksum) {
      console.log(`Checksum: ${results.sourceChecksum}`);
    }

  }).then(() => {
    process.exit(EXIT_CODES.SUCCESS);
  });

}).catch((error) => {

  return Bluebird.try(() => {
    if (robot.isEnabled(process.env)) {
      return robot.printError(error);
    }

    errors.print(error);
  }).then(() => {
    if (error.code === 'EVALIDATION') {
      process.exit(EXIT_CODES.VALIDATION_ERROR);
    }

    process.exit(EXIT_CODES.GENERAL_ERROR);
  });

});
