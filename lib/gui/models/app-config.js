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

const angular = require('angular');
const MODULE_NAME = 'Etcher.Models.AppConfig';
const AppConfig = angular.module(MODULE_NAME, []);

AppConfig.service('AppConfigService', function() {

  /**
   * Where all the JSON file is hosted
   */
  this.PACKAGE_PATH = 'http://files.pine64.org/etcher/pine64';

  /**
   * Boards data
   *
   * api return as such:
   * {
   * 	"boards": [
   * 		{"name": "PINE A64+ (1GB/2GB)", "os": "pine_a64_1_2gb.json"},
   * 		{"name": "PINE A64 (512MB)", "os": "pine_a64_512mb.json"},
   * 		{"name": "SOPINE", "os": "sopine.json"},
   * 		{"name": "PINEBOOK", "os": "pinebook.json"}
   * 	]
   * }
   */
  this.BOARDS_DATA = this.PACKAGE_PATH + '/boards.json';

  /**
   * @summary Returning valid absolute path
   * @function
   * @public
   *
   * @param {String} path - relative path
   *
   * @returns {String} valid http path
   *
   * @example
   * const path = getBoardInfo('folder/file.ext');
   */
  this.getAbsolutePath = (path) => {
    if (!path) {
      return this.PACKAGE_PATH;
    }
    return this.PACKAGE_PATH + '/' + path;
  };

});

module.exports = MODULE_NAME;
