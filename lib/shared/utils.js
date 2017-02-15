/*
 * Copyright 2017 resin.io
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
const flatten = require('flat').flatten;

/**
 * @summary Create a flattened copy of the object with all keys transformed in start case
 *
 * @param {Object} object - object to transform
 * @return {Object}
 *
 * @example
 * makeFlatStartCaseObject({
 *   image: {
 *     size: 10000000000,
 *     recommendedSize: 10000000000
 *   }
 * }) === {
 *   'Image Size': 10000000000,
 *   'Image Recommended Size: 10000000000
 * }
 */
exports.makeFlatStartCaseObject = (object) => {
  const flattened = object ? flatten(object, {
    delimiter: ' ',
    safe: true
  }) : undefined;

  const startCaseFlattened = flattened ? _.mapKeys(flattened, (value, key) => {
    return _.startCase(key);
  }) : undefined;

  return startCaseFlattened;
};
