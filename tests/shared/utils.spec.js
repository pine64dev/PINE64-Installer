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

const m = require('mochainon');
const utils = require('../../lib/shared/utils');

describe('Shared: Utils', function() {

  describe('.makeFlatStartCaseObject(object)', function() {

    it('should return undefined if given undefined', function() {
      m.chai.expect(utils.makeFlatStartCaseObject(undefined)).to.be.undefined;
    });

    it('should return flat object with start case keys if given nested object', function() {
      const object = {
        person: {
          firstName: 'John',
          lastName: 'Doe',
          address: {
            streetNumber: 13,
            streetName: 'Elm'
          }
        }
      };

      m.chai.expect(utils.makeFlatStartCaseObject(object)).to.deep.equal({
        'Person First Name': 'John',
        'Person Last Name': 'Doe',
        'Person Address Street Number': 13,
        'Person Address Street Name': 'Elm'
      });

    });

  });

});
