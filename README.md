PINE64 Installer
================

This is a tool we fork from [Etcher](https://etcher.io/). We added the part for user to easily select their desired PINE A64(+), SOPINE, Pinebook OS image and automatically download the OS image from server before flashing it to the MicroSD card.

***

[**Download**](#download) | [**Notes**](#notes) | [**Screenshots and Guidelines**](#screenshots-and-guidelines) | [**Support**](#support) | [**License**](#license)


## Download
-----------
> [**Latest Version**](https://github.com/pine64dev/PINE64-Installer/releases/latest)


## Notes
--------
- Please disable Ext2fsd software because it is conflicting with the App.


## Screenshots and Guidelines
-----------------------------
![screenshot](https://raw.githubusercontent.com/pine64dev/PINE64-Installer/master/screenshot.png)
- Click on "Choose an OS".
- For Settings, click on the left bottom icon.

![screenshot select board](https://raw.githubusercontent.com/pine64dev/PINE64-Installer/master/screenshot2.png)
- Use the select box on top to select the board (e.g. PINE A64+ (1GB/2GB), SOPINE, PINEBOOK and etc).

![screenshot select OS](https://raw.githubusercontent.com/pine64dev/PINE64-Installer/master/screenshot3.png)
- Select the OS of your choice.
	- Scroll to the bottom the select a local image file (Note that, select local gz / gz2 / xz image file name must end with .img.gz / .img.bz2 / .img.xz).
- If you wish to flash older image version, you can use the version select box at the right of the OS list.
- Click on the "i" at the right of the version to visit the release notes or related websites.

![screenshot settings](https://raw.githubusercontent.com/pine64dev/PINE64-Installer/master/screenshot4.png)
- If "Eject on success" is ticked: After flashing or validating process, the app will try to automatically unmount or eject the MicroSD.
  - Occasionally, the MicroSD may be accessed by some other process running on your system, then, auto umount/eject may failed. Because of that, you may need to manually umount/eject.
- If "Validate write on success" is ticked: After flashing process, the app will run a validation process.
- Download Location: This is where the downloaded image files stored. You can change to other directory or click on the most right button to access to the directory.
  - Remember where your previous download location because you might want to manually delete those old downloaded image files.
  - Default download location:
    - Windows: C:\Users\<USER>\AppData\Roaming\pine64-installer\downloadedImage
    - Linux: /home/<USER>/.config/pine64-installer/downloadedImage
    - OS X: /Users/<USER>/Library/Application Support/pine64-installer/downloadedImage
- Download Sources: Use this to choose from which server all the OS images will be downloaded from.


## Support
----------
If you have any feedback please create new thread in [this forum](https://forum.pine64.org/forumdisplay.php?fid=21) for discussion. You also can subscribe to [this forum thread](https://forum.pine64.org/showthread.php?tid=4481) to receive latest news on the PINE64 Installer.


## License
----------
PINE64 Installer is free software, and may be redistributed under the terms specified in the [license](https://github.com/pine64dev/PINE64-Installer/blob/master/LICENSE).
