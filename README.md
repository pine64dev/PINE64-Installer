PINE64 Installer
================

This is a tool we forked from [Etcher](https://etcher.io/) to add an easy menu for downloading the PINE A64(+), SOPINE or Pinebook OS images for flashing to the MicroSD card, saving users the extra steps of finding links on the web, downloading the image then finding the file on the local system again.

***

[**Download**](#download) | [**Notes**](#notes) | [**Screenshots and Guidelines**](#screenshots-and-guidelines) | [**Support**](#support) | [**License**](#license)


## Download
> [**Latest Version**](https://github.com/pine64dev/PINE64-Installer/releases/latest)

## Notes
- Please disable Ext2fsd software because it can conflict with this app.

## Screenshots and Guidelines
![screenshot](https://raw.githubusercontent.com/pine64dev/PINE64-Installer/master/screenshot.png)
- Click on "Choose an OS".
- For Settings, click on the left bottom icon.

![screenshot select board](https://raw.githubusercontent.com/pine64dev/PINE64-Installer/master/screenshot2.png)
- Use the select box on top to select the board (e.g. PINE A64+ (1GB/2GB), SOPINE, PINEBOOK and etc).

![screenshot select OS](https://raw.githubusercontent.com/pine64dev/PINE64-Installer/master/screenshot3.png)
- Select the OS of your choice.
	- Scroll to the bottom the select a local image file (Note that, select local gz / gz2 / xz image file name must end with .img.gz / .img.bz2 / .img.xz).
- If you wish to flash an older image, you can use the version select box on the right of the OS list.
- Click on the "i" at the right of the version to view the release notes or related websites.

![screenshot settings](https://raw.githubusercontent.com/pine64dev/PINE64-Installer/master/screenshot4.png)
- If "Eject on success" is ticked: After the flashing or validating process, the app will try to automatically unmount or eject the MicroSD card.
  - Occasionally, the MicroSD card may be accessed by another process running on your system, causing automatic unmounting or ejection to fail. In this case, you may need to manually unmount or eject the MicroSD card.
- If "Validate write on success" is ticked: after flashing, the app will read the MicroSD card and compare its final checksum with the previous flashing/writing checksum to validate successful writing of the image.
- Download Location: where the downloaded image file is stored. Click the far right button to change this location.
  - Remember your download location if you want to manually delete any old image files later.
  - The default download locations are:
    - Windows: C:\\Users\\&lt;USER&gt;\\AppData\\Roaming\\pine64-installer\\downloadedImage
    - Linux: /home/&lt;USER&gt;/.config/pine64-installer/downloadedImage
    - macOS: /Users/&lt;USER&gt;/Library/Application Support/pine64-installer/downloadedImage
- Download Sources: Choose which server the OS images are downloaded from.
  - Note: pine64.uk (UK) is a mirror server. New OS images may be delayed, upon initial release, whilst syncing to this server. Thanks to Dave for setting this mirror up. 


## Support
If you have any feedback please create new thread in [this forum](https://forum.pine64.org/forumdisplay.php?fid=21) for discussion. You also can subscribe to [this forum thread](https://forum.pine64.org/showthread.php?tid=4481) to receive latest news on the PINE64 Installer.


## License
PINE64 Installer is free software, and may be redistributed under the terms specified in the [license](https://github.com/pine64dev/PINE64-Installer/blob/master/LICENSE).
