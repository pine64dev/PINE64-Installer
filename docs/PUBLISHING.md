Publishing PINE64 Installer
===========================

This is a small guide to package and publish PINE64 Installer to all supported
operating systems.

**Make sure you have all the pre-requisites listed above the [RUNNING-LOCALLY](https://github.com/pine64dev/PINE64-Installer/blob/master/docs/RUNNING-LOCALLY.md) installed in your system.**

Signing
-------

### OS X

1. Get Apple Developer ID certificate for signing applications distributed
outside the Mac App Store from the Apple account.

2. Install the Developer ID certificate to your Mac's Keychain by double
clicking on the certificate file.

3. Add `CODE_SIGN_IDENTITY = [certificate id from keychain get info]` on the beginning of `Makefile`.

The application will be signed automatically using this certificate when
packaging for OS X.

### Windows

1. Get access to our code signing certificate and decryption key
from the relevant people.

2. Place the certificate (e.g. www.pine64.org_code_sign.pfx) in the root of the Etcher repository and optionally renaming it to `certificate.p12`.

3. Add `CODE_SIGN_CERTIFICATE = certificate.p12` and `CODE_SIGN_CERTIFICATE_PASSWORD = [PASSWORD]` on the beginning of `Makefile`. Remember to escape the string values (e.g. # to \\#, $ to $$).

Changing Info
-------------

### package.json

1. Change "version".

2. Change "builder" / "win" / "version".

### npm-shrinkwrap.json

1. Double check "drivelist" -> "resolved".

2. Double check "etcher-image-write" -> "resolved".

3. Double check "progress-stream" -> "resolved".

Packaging
---------

### OS X

Run the following command:

```sh
npm install bootstrap-sass
npm run build-css
make electron-develop
make electron-installer-dmg
make electron-installer-app-zip  (optional)
```

The resulting installers will be saved to `release/out`.

### GNU/Linux

Run the following command:

```sh
npm install bootstrap-sass
npm run build-css
make electron-develop
make electron-installer-appimage
make electron-installer-debian  (optional)
```

The resulting installers will be saved to `release/out`.

### Windows

Run the following command:

Note that, the rm -rf is very slow on Windows. You rather want to use Windows Explorer to manually delete the project's node_modules first before running make electron-develop.

```sh
npm install bootstrap-sass
npm run build-css
make electron-develop
make electron-installer-nsis
make electron-installer-zip  (optional)
```

The resulting installers will be saved to `release/out`.

Publishing to Bintray
---------------------

We publish GNU/Linux Debian packages to [Bintray][bintray].

Make sure you set the following environment variables:

- `BINTRAY_USER`
- `BINTRAY_API_KEY`

Run the following command:

```sh
make publish-bintray-debian RELEASE_TYPE=<production|snapshot>
```

Publishing to S3
----------------

- [AWS CLI][aws-cli]

Make sure you have the [AWS CLI tool][aws-cli] installed and configured to
access resin.io's production downloads S3 bucket.

> The publishing script only runs on UNIX based operating systems for now. You
> can use something like [Cygwin][cygwin] to run it on Windows.

Run the following command to publish a specific file:

```sh
./scripts/publish/aws-s3.sh -f <file> -b <bucket> -v <version> -t <production|snapshot>
```

Or run the following command to publish all files for the current combination
of _platform_ and _arch_ (building them if necessary) :

```sh
make publish-aws-s3 RELEASE_TYPE=<production|snapshot>
```

Also add links to each AWS S3 file in [GitHub Releases][github-releases]. See
[`v1.0.0-beta.17`](https://github.com/resin-io/etcher/releases/tag/v1.0.0-beta.17)
as an example.

Publishing to Homebrew Cask
---------------------------

1. Update [`Casks/etcher.rb`][etcher-cask-file] with the new version and
   `sha256`

2. Send a PR with the changes above to
   [`caskroom/homebrew-cask`][homebrew-cask]

Announcing
----------

Post messages to the [Etcher forum][resin-forum-etcher] and
[Etcher gitter channel][gitter-etcher] announcing the new version
of Etcher, and including the relevant section of the Changelog.

[aws-cli]: https://aws.amazon.com/cli
[cygwin]: https://cygwin.com
[bintray]: https://bintray.com
[etcher-cask-file]: https://github.com/caskroom/homebrew-cask/blob/master/Casks/etcher.rb
[homebrew-cask]: https://github.com/caskroom/homebrew-cask
[resin-forum-etcher]: https://talk.resin.io/c/etcher/annoucements
[gitter-etcher]: https://gitter.im/resin-io/etcher
[github-releases]: https://github.com/resin-io/etcher/releases
