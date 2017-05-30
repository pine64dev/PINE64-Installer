'use strict';

const m = require('mochainon');
const path = require('path');
const angular = require('angular');
require('angular-mocks');
const _ = require('lodash');

describe('Browser: DrivesModel', function() {

  beforeEach(angular.mock.module(
    require('../../../lib/gui/models/drives'),
    require('../../../lib/gui/models/selection-state')
  ));

  describe('DrivesModel', function() {

    let DrivesModel;
    let SelectionStateModel;

    beforeEach(angular.mock.inject(function(_DrivesModel_, _SelectionStateModel_) {
      DrivesModel = _DrivesModel_;
      SelectionStateModel = _SelectionStateModel_;
    }));

    it('should have no drives by default', function() {
      m.chai.expect(DrivesModel.getDrives()).to.deep.equal([]);
    });

    describe('.setDrives()', function() {

      it('should throw if no drives', function() {
        m.chai.expect(function() {
          DrivesModel.setDrives();
        }).to.throw('Missing drives');
      });

      it('should throw if drives is not an array', function() {
        m.chai.expect(function() {
          DrivesModel.setDrives(123);
        }).to.throw('Invalid drives: 123');
      });

      it('should throw if drives is not an array of objects', function() {
        m.chai.expect(function() {
          DrivesModel.setDrives([
            123,
            123,
            123
          ]);
        }).to.throw('Invalid drives: 123,123,123');
      });

    });

    describe('given no drives', function() {

      describe('.hasAvailableDrives()', function() {

        it('should return false', function() {
          m.chai.expect(DrivesModel.hasAvailableDrives()).to.be.false;
        });

      });

      describe('.setDrives()', function() {

        it('should be able to set drives', function() {
          const drives = [
            {
              device: '/dev/sdb',
              description: 'Foo',
              size: '14G',
              mountpoint: '/mnt/foo',
              system: false
            }
          ];

          DrivesModel.setDrives(drives);
          m.chai.expect(DrivesModel.getDrives()).to.deep.equal(drives);
        });

        describe('given no selected image and no selected drive', function() {

          beforeEach(function() {
            SelectionStateModel.removeDrive();
            SelectionStateModel.removeImage();
          });

          it('should auto-select a single valid available drive', function() {
            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;

            DrivesModel.setDrives([
              {
                device: '/dev/sdb',
                name: 'Foo',
                size: 999999999,
                mountpoint: '/mnt/foo',
                system: false,
                protected: false
              }
            ]);

            m.chai.expect(SelectionStateModel.hasDrive()).to.be.true;
            m.chai.expect(SelectionStateModel.getDrive().device).to.equal('/dev/sdb');
          });

        });

        describe('given a selected image and no selected drive', function() {

          beforeEach(function() {
            if (process.platform === 'win32') {
              this.imagePath = 'E:\\bar\\foo.img';
            } else {
              this.imagePath = '/mnt/bar/foo.img';
            }

            SelectionStateModel.removeDrive();
            SelectionStateModel.setImage({
              path: this.imagePath,
              size: 999999999,
              recommendedDriveSize: 2000000000
            });
          });

          afterEach(function() {
            SelectionStateModel.removeImage();
          });

          it('should not auto-select when there are multiple valid available drives', function() {
            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;

            DrivesModel.setDrives([
              {
                device: '/dev/sdb',
                name: 'Foo',
                size: 999999999,
                mountpoint: '/mnt/foo',
                system: false,
                protected: false
              },
              {
                device: '/dev/sdc',
                name: 'Bar',
                size: 999999999,
                mountpoint: '/mnt/bar',
                system: false,
                protected: false
              }
            ]);

            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          });

          it('should auto-select a single valid available drive', function() {
            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;

            DrivesModel.setDrives([
              {
                device: '/dev/sdb',
                name: 'Foo',
                size: 2000000000,
                mountpoint: '/mnt/foo',
                system: false,
                protected: false
              }
            ]);

            m.chai.expect(SelectionStateModel.getDrive()).to.deep.equal({
              device: '/dev/sdb',
              name: 'Foo',
              size: 2000000000,
              mountpoint: '/mnt/foo',
              system: false,
              protected: false
            });
          });

          it('should not auto-select a single too small drive', function() {
            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;

            DrivesModel.setDrives([
              {
                device: '/dev/sdb',
                name: 'Foo',
                size: 99999999,
                mountpoint: '/mnt/foo',
                system: false,
                protected: false
              }
            ]);

            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          });

          it('should not auto-select a single drive that doesn\'t meet the recommended size', function() {
            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;

            DrivesModel.setDrives([
              {
                device: '/dev/sdb',
                name: 'Foo',
                size: 1500000000,
                mountpoint: '/mnt/foo',
                system: false,
                protected: false
              }
            ]);

            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          });

          it('should not auto-select a single protected drive', function() {
            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;

            DrivesModel.setDrives([
              {
                device: '/dev/sdb',
                name: 'Foo',
                size: 2000000000,
                mountpoint: '/mnt/foo',
                system: false,
                protected: true
              }
            ]);

            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          });

          it('should not auto-select a source drive', function() {
            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;

            DrivesModel.setDrives([
              {
                device: '/dev/sdb',
                name: 'Foo',
                size: 2000000000,
                mountpoints: [
                  {
                    path: path.dirname(this.imagePath)
                  }
                ],
                system: false,
                protected: false
              }
            ]);

            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          });

          it('should not auto-select a single system drive', function() {
            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;

            DrivesModel.setDrives([
              {
                device: '/dev/sdb',
                name: 'Foo',
                size: 2000000000,
                mountpoint: '/mnt/foo',
                system: true,
                protected: false
              }
            ]);

            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          });

        });

        describe('given a selected OS and no selected drive', function() {
          beforeEach(function() {
            SelectionStateModel.setOS({
              name: 'Custom Operation System',
              version: '1.0.0',
              images: [
                {
                  checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
                  checksumType: 'md5',
                  recommendedDriveSize: 4000000000,
                  url: 'http://path.to/os/4gb.os.tar.gz'
                },
                {
                  checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
                  checksumType: 'md5',
                  recommendedDriveSize: 5000000000,
                  url: 'http://path.to/os/5gb.os.tar.gz'
                },
                {
                  checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
                  checksumType: 'md5',
                  recommendedDriveSize: 8000000000,
                  url: 'http://path.to/os/8gb.os.tar.gz'
                },
                {
                  checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
                  checksumType: 'md5',
                  recommendedDriveSize: 10000000000,
                  url: 'http://path.to/os/10gb.os.tar.gz'
                }
              ],
              logo: 'http://path.to/image/logo'
            });

            SelectionStateModel.removeDrive();
          });

          afterEach(function() {
            SelectionStateModel.removeOS();
          });

          it('should not auto-select when there are multiple valid available drives', function() {
            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;

            DrivesModel.setDrives([
              {
                device: '/dev/sdb',
                name: 'Foo',
                size: 4000000000,
                mountpoint: '/mnt/foo',
                system: false,
                protected: false
              },
              {
                device: '/dev/sdc',
                name: 'Bar',
                size: 5000000000,
                mountpoint: '/mnt/bar',
                system: false,
                protected: false
              }
            ]);

            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          });

          it('should auto-select a single valid available drive', function() {
            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;

            DrivesModel.setDrives([
              {
                device: '/dev/sdb',
                name: 'Foo',
                size: 4000000000,
                mountpoint: '/mnt/foo',
                system: false,
                protected: false
              }
            ]);

            m.chai.expect(SelectionStateModel.getDrive()).to.deep.equal({
              device: '/dev/sdb',
              name: 'Foo',
              size: 4000000000,
              mountpoint: '/mnt/foo',
              system: false,
              protected: false,
              recommendedImage: {
                checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
                checksumType: 'md5',
                recommendedDriveSize: 4000000000,
                url: 'http://path.to/os/4gb.os.tar.gz'
              }
            });
          });

          it('should not auto-select a single too small drive', function() {
            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;

            DrivesModel.setDrives([
              {
                device: '/dev/sdb',
                name: 'Foo',
                size: 99,
                mountpoint: '/mnt/foo',
                system: false,
                protected: false
              }
            ]);

            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          });

          it('should not auto-select a single drive that doesn\'t meet the recommended size', function() {
            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;

            DrivesModel.setDrives([
              {
                device: '/dev/sdb',
                name: 'Foo',
                size: 3000000000,
                mountpoint: '/mnt/foo',
                system: false,
                protected: false
              }
            ]);

            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          });

          it('should not auto-select a single protected drive', function() {
            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;

            DrivesModel.setDrives([
              {
                device: '/dev/sdb',
                name: 'Foo',
                size: 4000000000,
                mountpoint: '/mnt/foo',
                system: false,
                protected: true
              }
            ]);

            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          });

          it('should not auto-select a source drive', function() {
            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;

            DrivesModel.setDrives([
              {
                device: '/dev/sdb',
                name: 'Foo',
                size: 8000000000,
                mountpoints: [
                  {
                    path: '/'
                  }
                ],
                system: false,
                protected: false
              }
            ]);

            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          });

          it('should not auto-select a single system drive', function() {
            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;

            DrivesModel.setDrives([
              {
                device: '/dev/sdb',
                name: 'Foo',
                size: 8000000000,
                mountpoint: '/mnt/foo',
                system: true,
                protected: false
              }
            ]);

            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          });

          it('should auto assign correct image size according to drive size', function() {
            DrivesModel.setDrives([
              {
                device: '/dev/sdb',
                name: 'Foo',
                size: 4000000000,
                mountpoint: '/mnt/foo',
                system: false,
                protected: false
              },
              {
                device: '/dev/sdc',
                name: 'Foo2',
                size: 6000000000,
                mountpoint: '/mnt/foo2',
                system: false,
                protected: false
              },
              {
                device: '/dev/sde',
                name: 'Foo3',
                size: 300000000,
                mountpoint: '/mnt/foo3',
                system: false,
                protected: false
              },
              {
                device: '/dev/sdf',
                name: 'Foo4',
                size: 12000000000,
                mountpoint: '/mnt/foo4',
                system: false,
                protected: false
              }
            ]);

            const findDrive = (drivePath) => {
              return _.find(DrivesModel.getDrives(), {
                device: drivePath
              });
            };

            m.chai.expect(findDrive('/dev/sdb').recommendedImage).to.be.deep.equal({
              checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
              checksumType: 'md5',
              recommendedDriveSize: 4000000000,
              url: 'http://path.to/os/4gb.os.tar.gz'
            });
            m.chai.expect(findDrive('/dev/sdc').recommendedImage).to.be.deep.equal({
              checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
              checksumType: 'md5',
              recommendedDriveSize: 5000000000,
              url: 'http://path.to/os/5gb.os.tar.gz'
            });
            m.chai.expect(findDrive('/dev/sde').recommendedImage).to.be.undefined;
            m.chai.expect(findDrive('/dev/sdf').recommendedImage).to.be.deep.equal({
              checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
              checksumType: 'md5',
              recommendedDriveSize: 10000000000,
              url: 'http://path.to/os/10gb.os.tar.gz'
            });
          });
        });

      });

    });

    describe('given drives', function() {

      beforeEach(function() {
        this.drives = [
          {
            device: '/dev/sdb',
            name: 'SD Card',
            size: 9999999,
            mountpoint: '/mnt/foo',
            system: false,
            protected: false
          },
          {
            device: '/dev/sdc',
            name: 'USB Drive',
            size: 9999999,
            mountpoint: '/mnt/bar',
            system: false,
            protected: false
          }
        ];

        DrivesModel.setDrives(this.drives);
      });

      /*
      // auto-select after image/os has being selected
      it('should automatically select one drive', () => {
        m.chai.expect(SelectionStateModel.hasDrive()).to.be.true;
      });
      */

      describe('given one of the drives was selected', function() {

        beforeEach(function() {
          DrivesModel.setDrives([
            {
              device: '/dev/sdc',
              name: 'USB Drive',
              size: 9999999,
              mountpoint: '/mnt/bar',
              system: false,
              protected: false
            }
          ]);

          SelectionStateModel.setDrive('/dev/sdc');
        });

        afterEach(function() {
          SelectionStateModel.removeDrive();
        });

        it('should be deleted if its not contained in the available drives anymore', function() {
          m.chai.expect(SelectionStateModel.hasDrive()).to.be.true;

          // We have to provide at least two drives, otherwise,
          // if we only provide one, the single drive will be
          // auto-selected.
          DrivesModel.setDrives([
            {
              device: '/dev/sda',
              name: 'USB Drive',
              size: 9999999,
              mountpoint: '/mnt/bar',
              system: false,
              protected: false
            },
            {
              device: '/dev/sdb',
              name: 'SD Card',
              size: 9999999,
              mountpoint: '/mnt/foo',
              system: false,
              protected: false
            }
          ]);

          m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
        });

      });

      describe('given a selected OS', function() {

        beforeEach(function() {
          SelectionStateModel.removeDrive();

          SelectionStateModel.setOS({
            name: 'Custom Operation System',
            version: '1.0.0',
            images: [
              {
                checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
                checksumType: 'md5',
                recommendedDriveSize: 4000000000,
                url: 'http://path.to/os/4gb.os.tar.gz'
              },
              {
                checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
                checksumType: 'md5',
                recommendedDriveSize: 5000000000,
                url: 'http://path.to/os/5gb.os.tar.gz'
              },
              {
                checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
                checksumType: 'md5',
                recommendedDriveSize: 8000000000,
                url: 'http://path.to/os/8gb.os.tar.gz'
              },
              {
                checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
                checksumType: 'md5',
                recommendedDriveSize: 10000000000,
                url: 'http://path.to/os/10gb.os.tar.gz'
              }
            ],
            logo: 'http://path.to/image/logo'
          });
        });

        afterEach(function() {
          SelectionStateModel.removeOS();
        });

        it('should deselect unmatched drive with selected OS', function() {
          m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
        });
      });

      describe('.hasAvailableDrives()', function() {

        it('should return true', function() {
          const hasDrives = DrivesModel.hasAvailableDrives();
          m.chai.expect(hasDrives).to.be.true;
        });

      });

      describe('.setDrives()', function() {

        it('should keep the same drives if equal', function() {
          DrivesModel.setDrives(this.drives);
          m.chai.expect(DrivesModel.getDrives()).to.deep.equal(this.drives);
        });

        it('should consider drives with different $$hashKey the same', function() {
          this.drives[0].$$haskey = 1234;
          DrivesModel.setDrives(this.drives);
          m.chai.expect(DrivesModel.getDrives()).to.deep.equal(this.drives);
        });

      });

    });

  });
});
