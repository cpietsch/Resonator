# BrainEdit
Mindmachine Editor for generating binaural Tracks and flickering LED-Arduino-Glasses support.
This Editor is part of the www.brainstatesharing.com project.

# Download
For now there is only a 64bit OSX Version of the BrainEdit you can download here: https://github.com/cpietsch/BrainEdit/releases/download/v1.1/BrainEdit.zip
Note: To open do a "ctrl" + doubleclick on the BrainEdit.app and select open.

![Screenshot](https://raw.githubusercontent.com/cpietsch/BrainEdit/master/screenshot.png?raw=true "Screenshot")

# Build
- current nw.js version: 0.12.2 (https://github.com/nwjs/nw.js)
- put nw.js as OSX version in deploy/ as BrainEdit.app
- npm install
- serialport needs recompilation with 0.12.2 flag (https://github.com/nwjs/nw-gyp/issues/69)
- sh deploy.sh

# Arduino
- Put the sketch in /arduino on your arduino
- Make yourself nice goggles and connect the leds to the pins stated in the sketch
