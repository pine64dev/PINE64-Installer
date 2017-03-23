'use strict';

const m = require('mochainon');
const _ = require('lodash');
const angular = require('angular');
require('angular-mocks');

/**
 * spec changes and why
 * - 100% doesn't mean finishing. 100% done mean completing a single process and there
 * might have other process after finish.
 */
describe('Browser: MainPage', function() {

  beforeEach(angular.mock.module(
    require('../../../lib/gui/pages/main/main')
  ));

  describe('MainController', function() {

    let $controller;
    let SelectionStateModel;
    let DrivesModel;

    beforeEach(angular.mock.inject(function(_$controller_, _SelectionStateModel_, _DrivesModel_) {
      $controller = _$controller_;
      SelectionStateModel = _SelectionStateModel_;
      DrivesModel = _DrivesModel_;
    }));

    describe('.shouldDriveStepBeDisabled()', function() {

      it('should return true if there is no drive', function() {
        const controller = $controller('MainController', {
          $scope: {}
        });

        SelectionStateModel.clear();

        m.chai.expect(controller.shouldDriveStepBeDisabled()).to.be.true;
      });

      it('should return false if there is a drive', function() {
        const controller = $controller('MainController', {
          $scope: {}
        });

        SelectionStateModel.setImage({
          path: 'rpi.img',
          size: 99999
        });

        m.chai.expect(controller.shouldDriveStepBeDisabled()).to.be.false;
      });

    });

    describe('.shouldFlashStepBeDisabled()', function() {

      it('should return true if there is no selected drive nor image', function() {
        const controller = $controller('MainController', {
          $scope: {}
        });

        SelectionStateModel.clear();

        m.chai.expect(controller.shouldFlashStepBeDisabled()).to.be.true;
      });

      it('should return true if there is a selected image but no drive', function() {
        const controller = $controller('MainController', {
          $scope: {}
        });

        SelectionStateModel.clear();
        SelectionStateModel.setImage({
          path: 'rpi.img',
          size: 99999
        });

        m.chai.expect(controller.shouldFlashStepBeDisabled()).to.be.true;
      });

      it('should return true if there is a selected drive but no image', function() {
        const controller = $controller('MainController', {
          $scope: {}
        });

        DrivesModel.setDrives([
          {
            device: '/dev/disk2',
            description: 'Foo',
            size: 99999,
            mountpoint: '/mnt/foo',
            system: false
          }
        ]);

        SelectionStateModel.clear();
        SelectionStateModel.setDrive('/dev/disk2');

        m.chai.expect(controller.shouldFlashStepBeDisabled()).to.be.true;
      });

      it('should return false if there is a selected drive and a selected image', function() {
        const controller = $controller('MainController', {
          $scope: {}
        });

        DrivesModel.setDrives([
          {
            device: '/dev/disk2',
            description: 'Foo',
            size: 99999,
            mountpoint: '/mnt/foo',
            system: false
          }
        ]);

        SelectionStateModel.clear();
        SelectionStateModel.setDrive('/dev/disk2');

        SelectionStateModel.setImage({
          path: 'rpi.img',
          size: 99999
        });

        m.chai.expect(controller.shouldFlashStepBeDisabled()).to.be.false;
      });

      it('should return true when recommended OS image has being mapped to selected image', function() {
        const controller = $controller('MainController', {
          $scope: {}
        });

        SelectionStateModel.clear();

        // by pooling every second, available drives is given
        DrivesModel.setDrives([
          {
            device: '/dev/disk2',
            description: 'Foo',
            size: 99999,
            mountpoint: '/mnt/foo',
            system: false
          }
        ]);

        // single drive is selected automatically
        m.chai.expect(SelectionStateModel.hasDrive()).to.be.true;

        // user selected an OS
        SelectionStateModel.setOS({
          name: 'Custom Operation System',
          version: '1.0.0',
          images: [
            {
              checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
              checksumType: 'md5',
              recommendedDriveSize: 99999,
              url: 'http://path.to/os/4gb.os.tar.gz'
            }
          ],
          logo: 'http://path.to/image/logo'
        });

        // at this moment, recommended image is not mapped yet to every drive
        m.chai.expect(controller.shouldFlashStepBeDisabled()).to.be.true;

        // on the next second, available drives is given again
        DrivesModel.setDrives([
          {
            device: '/dev/disk2',
            description: 'Foo',
            size: 99999,
            mountpoint: '/mnt/foo',
            system: false
          }
        ]);

        // recommended image will be mapped on every drive
        // single drive is selected automatically
        m.chai.expect(SelectionStateModel.hasDrive()).to.be.true;

        m.chai.expect(SelectionStateModel.getDrive().recommendedImage).to.be.deep.equal({
          checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
          checksumType: 'md5',
          recommendedDriveSize: 99999,
          url: 'http://path.to/os/4gb.os.tar.gz'
        });

        // recommended image that has being mapped to the selected drive
        // will be registered to selected image automatically
        m.chai.expect(SelectionStateModel.getImage()).to.be.deep.equal({
          path: 'http://path.to/os/4gb.os.tar.gz',
          size: 99999,
          logo: 'http://path.to/image/logo',
          version: '1.0.0',
          downloadChecksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
          downloadChecksumType: 'md5'
        });

        // thus, flash step should be enable
        m.chai.expect(controller.shouldFlashStepBeDisabled()).to.be.false;
      });

    });

  });

  describe('ImageSelectionController', function() {

    let $controller;
    let SupportedFormatsModel;

    beforeEach(angular.mock.inject(function(_$controller_, _SupportedFormatsModel_) {
      $controller = _$controller_;
      SupportedFormatsModel = _SupportedFormatsModel_;
    }));

    it('should contain all available extensions in mainSupportedExtensions and extraSupportedExtensions', function() {
      const $scope = {};
      const controller = $controller('ImageSelectionController', {
        $scope
      });

      const extensions = controller.mainSupportedExtensions.concat(controller.extraSupportedExtensions);
      m.chai.expect(_.sortBy(extensions)).to.deep.equal(_.sortBy(SupportedFormatsModel.getAllExtensions()));
    });

  });

  describe('FlashController', function() {

    let $controller;
    let FlashStateModel;
    let SettingsModel;

    beforeEach(angular.mock.inject(function(_$controller_, _FlashStateModel_, _SettingsModel_) {
      $controller = _$controller_;
      FlashStateModel = _FlashStateModel_;
      SettingsModel = _SettingsModel_;
    }));

    describe('.getProgressButtonLabel()', function() {

      it('should return "Flash!" given a clean state', function() {
        const controller = $controller('FlashController', {
          $scope: {}
        });

        FlashStateModel.resetState();
        m.chai.expect(controller.getProgressButtonLabel()).to.equal('Flash!');
      });

      describe('given there is a flash in progress', function() {

        beforeEach(function() {
          FlashStateModel.setFlashingFlag();
          SettingsModel.set('unmountOnSuccess', true);
        });

        it('should report `Starting...` if type is other than `download`, `checksum`, `write` and `check`', function() {
          const controller = $controller('FlashController', {
            $scope: {}
          });

          FlashStateModel.setProgressState({
            type: 'unknown',
            percentage: 0,
            eta: 15,
            speed: 100000000000000
          });

          m.chai.expect(controller.getProgressButtonLabel()).to.equal('Please wait');
        });

        it('should report `0% Downloading...` if type = download and percentage = 0', function() {
          const controller = $controller('FlashController', {
            $scope: {}
          });

          FlashStateModel.setProgressState({
            type: 'download',
            percentage: 0,
            eta: 15,
            speed: 100000000000000
          });

          m.chai.expect(controller.getProgressButtonLabel()).to.equal('0% Downloading...');
        });

        it('should report `50% Downloading...` if type = download and percentage = 50', function() {
          const controller = $controller('FlashController', {
            $scope: {}
          });

          FlashStateModel.setProgressState({
            type: 'download',
            percentage: 50,
            eta: 15,
            speed: 100000000000000
          });

          m.chai.expect(controller.getProgressButtonLabel()).to.equal('50% Downloading...');
        });

        it('should report `0% Checking...` if type = checksum and percentage = 0', function() {
          const controller = $controller('FlashController', {
            $scope: {}
          });

          FlashStateModel.setProgressState({
            type: 'checksum',
            percentage: 0,
            eta: 15,
            speed: 100000000000000
          });

          m.chai.expect(controller.getProgressButtonLabel()).to.equal('0% Checking...');
        });

        it('should report `50% Checking...` if type = checksum and percentage = 50', function() {
          const controller = $controller('FlashController', {
            $scope: {}
          });

          FlashStateModel.setProgressState({
            type: 'checksum',
            percentage: 50,
            eta: 15,
            speed: 100000000000000
          });

          m.chai.expect(controller.getProgressButtonLabel()).to.equal('50% Checking...');
        });

        it('should report `50% Flashing...` if type = write and percentage = 50', function() {
          const controller = $controller('FlashController', {
            $scope: {}
          });

          FlashStateModel.setProgressState({
            type: 'write',
            percentage: 50,
            eta: 15,
            speed: 100000000000000
          });

          m.chai.expect(controller.getProgressButtonLabel()).to.equal('50% Flashing...');
        });

        it('should report `50% Validating...` if type = check and percentage = 50', function() {
          const controller = $controller('FlashController', {
            $scope: {}
          });

          FlashStateModel.setProgressState({
            type: 'check',
            percentage: 50,
            eta: 15,
            speed: 100000000000000
          });

          m.chai.expect(controller.getProgressButtonLabel()).to.equal('50% Validating...');
        });

        it('should report `Unmounting` if type = check, percentage = 100 and unmountOnSuccess = true', function() {
          const controller = $controller('FlashController', {
            $scope: {}
          });

          SettingsModel.set('unmountOnSuccess', true);

          FlashStateModel.setProgressState({
            type: 'check',
            percentage: 100,
            eta: 15,
            speed: 100000000000000
          });

          m.chai.expect(controller.getProgressButtonLabel()).to.equal('Unmounting...');
        });

      });

    });

  });

});
