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
 * @module Etcher.Modules.Analytics
 */

const _ = require('lodash');
const angular = require('angular');

const MODULE_NAME = 'Etcher.Modules.Analytics';
const analytics = angular.module(MODULE_NAME, [
  require('../models/settings')
]);

analytics.run(() => {

  // Don't configure TrackJS when
  // running inside the test suite
  if (window.mocha) {
    return;
  }
});

analytics.service('AnalyticsService', function($log) {

  /**
   * @summary Log a debug message
   * @function
   * @public
   *
   * @description
   * This function sends the debug message to TrackJS only.
   *
   * @param {String} message - message
   *
   * @example
   * AnalyticsService.log('Hello World');
   */
  this.logDebug = (message) => {
    message = new Date() + ' ' + message;

    $log.debug(message);
  };

  /**
   * @summary Log an event
   * @function
   * @public
   *
   * @description
   * This function sends the debug message to TrackJS and Mixpanel.
   *
   * @param {String} message - message
   * @param {Object} [data] - event data
   *
   * @example
   * AnalyticsService.logEvent('Select image', {
   *   image: '/dev/disk2'
   * });
   */
  this.logEvent = (message, data) => {

    if (data) {
      message += ` (${JSON.stringify(data)})`;
    }

    this.logDebug(message);
  };

  /**
   * @summary Check whether an error should be reported to TrackJS
   * @function
   * @private
   *
   * @description
   * In order to determine whether the error should be reported, we
   * check a property called `report`. For backwards compatibility, and
   * to properly handle errors that we don't control, an error without
   * this property is reported automatically.
   *
   * @param {Error} error - error
   * @returns {Boolean} whether the error should be reported
   *
   * @example
   * if (AnalyticsService.shouldReportError(new Error('foo'))) {
   *   console.log('We should report this error');
   * }
   */
  this.shouldReportError = (error) => {
    return !_.has(error, 'report') || Boolean(error.report);
  };

  /**
   * @summary Log an exception
   * @function
   * @public
   *
   * @description
   * This function logs an exception in TrackJS.
   *
   * @param {Error} exception - exception
   *
   * @example
   * AnalyticsService.logException(new Error('Something happened'));
   */
  this.logException = (exception) => {
    $log.error(exception);
  };

});

module.exports = MODULE_NAME;
