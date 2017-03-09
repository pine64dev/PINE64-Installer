/*
 * Copyright 2017 CloudMedia Sdn. Bhd.
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
const _ = require('lodash');
const utils = require('../../lib/cli/utils');

describe('CLI: Utils', function() {

  describe('.isNetworkResource()', function() {

    it('should return true given ordinary http link', function() {
      m.chai.expect(utils.isNetworkResource('http://www.test.url/file.img')).to.be.true;
    });

    it('should return true given ordinary https link', function() {
      m.chai.expect(utils.isNetworkResource('https://www.test.url/file.img')).to.be.true;
    });

    it('should return false given empty string', function() {
      m.chai.expect(utils.isNetworkResource('')).to.be.false;
    });

    it('should return false given a valid file path', function() {
      m.chai.expect(utils.isNetworkResource('/tmp/file.txt')).to.be.false;
    });

    it('should return false given undefined value', function() {
      m.chai.expect(utils.isNetworkResource(undefined)).to.be.false;
    });

    it('should return false given object with "startsWith" returns true', function() {
      m.chai.expect(utils.isNetworkResource({
        startsWith: () => {
          return true;
        }
      })).to.be.false;
    });

  });


  describe('.extractNameFromURL()', function() {

    it('should extract name given ordinary http link with ext', function() {
      m.chai.expect(utils.extractNameFromURL('http://www.test.url/file.img')).to.equal('file.img');
    });

    it('should extract name given ordinary https link with ext', function() {
      m.chai.expect(utils.extractNameFromURL('https://www.test.url/file.img')).to.equal('file.img');
    });

    it('should extract name given ordinary https link without ext', function() {
      m.chai.expect(utils.extractNameFromURL('https://www.test.url/file')).to.equal('file');
    });

    it('should extract name given ordinary https link with query string', function() {
      m.chai.expect(utils.extractNameFromURL('https://www.test.url/file?args=123')).to.equal('file');
    });

    it('should extract name given ordinary https link with anchor string', function() {
      m.chai.expect(utils.extractNameFromURL('https://www.test.url/file.txt#args')).to.equal('file.txt');
    });

    it('should throw error for valid link without file name', function() {
      m.chai.expect(_.partial(utils.extractNameFromURL, 'https://www.test.url/')).to.throw(Error);
    });

    it('should throw error for valid link without file name and with query string', function() {
      m.chai.expect(_.partial(utils.extractNameFromURL, 'https://www.test.url/?args=123')).to.throw(Error);
    });

    it('should escape characters for invalid characters for file name', function() {
      m.chai.expect(utils.extractNameFromURL('https://www.test.url/.av.<>:"|*zip?args=123')).to.equal('av.%3C%3E!%22%7C!zip');
    });

  });

});
