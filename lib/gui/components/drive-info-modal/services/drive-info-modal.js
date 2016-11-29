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

module.exports = function(ModalService) {

  /**
   * @summary Display the drive info modal
   * @function
   * @public
   *
   * @param {Object} options - options
   * @param {String} options.description - danger message
   * @param {String} options.confirmationLabel - confirmation button text
   * @param {String} options.rejectionLabel - rejection button text
   * @fulfil {Boolean} - whether the user accepted or rejected the warning
   * @returns {Promise}
   *
   * @example
   * WarningModalService.display({
   *   description: 'Don\'t do this!',
   *   confirmationLabel: 'Yes, continue!'
   * });
   */
  this.display = (options = {}) => {
    return ModalService.open({
      template: './components/drive-info-modal/templates/drive-info-modal.tpl.html',
      controller: 'DriveInfoModalController as modal',
      size: 'drive-info-modal',
      resolve: {
        options: _.constant(options)
      }
    }).result;
  };

};