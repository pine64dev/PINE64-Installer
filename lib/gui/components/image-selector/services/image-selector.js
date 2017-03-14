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

module.exports = function(ModalService, $q) {
  let modal = null;

  /**
   * @summary Open ImageSelector modal
   * @function
   * @public
   *
   * @returns {Promise}
   *
   * @example
   * ImageSelectorService.open();
   */
  this.open = () => {
    modal = ModalService.open({
      template: './components/image-selector/templates/image-selector-modal.tpl.html',
      controller: 'ImageSelectorController as modal',
      size: 'image-selector-modal'
    });

    return modal.result;
  };

  /**
   * @summary Close ImageSelector modal
   * @function
   * @public
   *
   * @returns {Promise}
   *
   * @example
   * ImageSelectorService.close();
   */
  this.close = () => {
    if (modal) {
      return modal.close();
    }

    return $q.resolve();
  };
};

