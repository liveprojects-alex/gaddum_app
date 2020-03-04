# TO BUILD

- make sure `google-services.json` is in `platforms/android/` for a working android build. (untested on iOS)
- (ios: `sudo gem install cocoapods`, then `cd platforms/ios; pod install`; then removal of ios and android platforms, then readdition of ios@4.5.5 and android@6.3.0 allowed clean builds of both) (lots of platform clean in xcode and cordova helped here)

## iOS build problems

(2019-11-12 11:40:00) Some issues with the Spotify Auth plugin on iOS - part of the install process is to download an archive from Spotify's github repository, but it has been taken down at some point in the last few days. As a result the install fails on iOS. This was flaged as an issue with https://github.com/CMDT/gaddum_app/issues/24 (then referenced at https://github.com/Festify/cordova-spotify/issues/54#issuecomment-549753932 )

