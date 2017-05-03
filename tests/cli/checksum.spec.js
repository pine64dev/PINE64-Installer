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

const path = require('path');
const checksum = require('../../lib/cli/checksum');
const utils = require('../../lib/cli/utils');
const DATA_PATH = path.join(__dirname, 'data');
const FILES_PATH = path.join(DATA_PATH, 'files');

describe('CLI: Checksum', function() {

  describe('.verify()', function() {

    it('should pass on success verification', function(done) {
      const imagePath = path.join(FILES_PATH, 'raspberrypi.img');
      const correctChecksum = 'df252f4323d637c05490f46faa2f3eae';
      const progress = new utils.Progress(() => {
        return null;
      });

      checksum.verify(imagePath, correctChecksum, 'MD5', progress)
        .then(done);

    });

    it('should throw error when invalid image path is given', function(done) {
      const invalidImagePath = path.join(FILES_PATH, 'invalid_path.img');
      const correctChecksum = 'df252f4323d637c05490f46faa2f3eae';
      const progress = new utils.Progress(() => {
        return null;
      });

      checksum.verify(invalidImagePath, correctChecksum, 'MD5', progress).catch(() => {
        done();
      });
    });

    it('should throw error when invalid checksum type is given', function(done) {
      const imagePath = path.join(FILES_PATH, 'raspberrypi.img');
      const correctChecksum = 'df252f4323d637c05490f46faa2f3eae';
      const progress = new utils.Progress(() => {
        return null;
      });

      checksum.verify(imagePath, correctChecksum, 'ABC', progress).catch(() => {
        done();
      });
    });

    it('should throw error when checksum value does not match', function(done) {
      const imagePath = path.join(FILES_PATH, 'raspberrypi.img');
      const wrongChecksum = 'df252f4323d637c05490f46faa2f3abc';
      const progress = new utils.Progress(() => {
        return null;
      });

      checksum.verify(imagePath, wrongChecksum, 'MD5', progress).catch(() => {
        done();
      });
    });

  });

});
