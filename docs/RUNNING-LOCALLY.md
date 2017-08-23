Running locally
===============

This document aims to serve as a guide to get PINE64 Installer running locally
on your development machine.

Prerequisites
-------------

Tested working on NodeJS v6.10.0, NPM v3.10.10. Note that, use `-g` on "node install -g [module]" to install node modules into global node_modules folder for easy usage instead of local/current folder.

### Common

- [NodeJS](https://nodejs.org) (at least v6)
  - Ubuntu: sudo apt install nodejs nodejs-legacy npm
- [Bower](http://bower.io)
- [UPX](http://upx.sourceforge.net)
  - Ubuntu: sudo cp upx /usr/local/bin/
- [Python 2.7.x](https://www.python.org)
- [SCSS Lint](https://github.com/brigade/scss-lint/) (You need Ruby: sudo apt install ruby)
- [SASS](https://www.npmjs.com/package/node-sass)
- [Bootstrap for SASS](https://github.com/twbs/bootstrap-sass#d-npm--nodejs) (Don't use `-g`. You need to install into the project node_modules folder)
- [jq](https://stedolan.github.io/jq/)
  - Windows: Please rename jq-win32.exe to jq.exe
  - Ubuntu: sudo apt install jq
- [Asar](https://github.com/electron/asar)
- [Codespell](https://github.com/lucasdemarchi/codespell) (You need Python PIP: sudo apt install python-pip; pip install -U pip)

### OS X

- [XCode](https://developer.apple.com/xcode/)
- [afsctool](https://brkirch.wordpress.com/afsctool/)

### Linux

- [Git](https://git-scm.com/)
  - Ubuntu: sudo apt install git

### Windows

- [Rimraf](https://github.com/isaacs/rimraf)
- [NSIS v2.51](http://nsis.sourceforge.net/Main_Page) (v3.x won't work)
- To compile lzma-native module
  - [windows-build-tool](https://github.com/felixrieseberg/windows-build-tools). This is an easier alternative.
  - OR [Visual Studio Community 2015](https://www.microsoft.com/en-us/download/details.aspx?id=48146) (free) (other editions, like Professional and Enterprise, should work too). Visual Studio 2015 doesn't install C++ by default. You have to rerun the setup, select Modify and then check `Visual C++ -> Common Tools for Visual C++ 2015` (see http://stackoverflow.com/a/31955339)
- [MinGW](http://www.mingw.org) (To run Makefile)
- [Git](https://git-scm.com/)
- [sha256sum](http://www.labtestproject.com/files/win/sha256sum/sha256sum.zip)

The following MinGW packages are required:

- `msys-make`
- `msys-unzip`
- `msys-zip`
- `msys-wget`
- `msys-bash`
- `msys-coreutils`

Below are some paths to set into Windows Environment Variable named `Path` (Please change the path according to where you installed the software):

- C:\MinGW\msys\1.0\bin
- C:\Program Files\NSIS
- C:\Program Files\Windows Kits\8.1\bin\x86  (For signtool)
- C:\Ruby24\bin
- C:\sw\jq
- C:\sw\sha256sum
- C:\sw\upx394w

Cloning/Pulling the project
---------------------------

```sh
git clone https://github.com/pine64dev/PINE64-Installer
```

### OR pull and merge new changes to local project:
```sh
git pull
```

### OR fetch changes without merging:
```sh
git fetch
```

Installing npm dependencies
---------------------------

**Make sure you have all the pre-requisites listed above installed in your
system before running the `install` script.**

Please make use of the following scripts to install npm dependencies rather
than simply running `npm install` given that we need to do extra configuration
to make sure native dependencies are correctly compiled for Electron, otherwise
the application might not run successfully.

If you're on Windows Visual Studio, **run the command from the _Developer Command Prompt for
VS2015_**, to ensure all Visual Studio command utilities are available in the
`%PATH%`.

Note that, the rm -rf is very slow on Windows. You rather want to use Windows Explorer to
manually delete the project's node_modules first before running the command below.

```sh
make electron-develop
```

Running the application
-----------------------

### Build main.css to update new GUI changes (refer package.json)
```sh
npm install bootstrap-sass
npm run build-css
```

### GUI (Start foreground GUI and background engine)
```sh
npm start
```

### CLI (Start background engine)
```sh
electron bin/etcher
```
Use `electron` to run instead of `node` to ensure node version is compatible with the app.
