![my stream deck](./streamdeck_setup.png)

Press a button to clip the last `x` seconds of the currently running OBS stream.
___

## Setup

### OBS
1. Setup OBS so that it is recording to an MKV format.

### .env
1. Create a file in this folder called `.env`.
2. Copy the contents of `.env.example` into your `.env` file.
3. In your `.env`, change the value of `MKV_FOLDER` to what you have in OBS.

### Stream Deck
1. Add the System>Open action to the grid.
2. Click on the file selector for "App / File".
3. Select one of the `clip-x-min.js` files.

### FFMPEG
1. Obtain a copy of ffmpeg.exe and ffprobe.exe. The official place is https://ffmpeg.org/download.html#build-windows, but here is a shortcut: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
2. Unzip and inside `bin`, you can find the two `.exe` files.
3. Places these to `.exe` files inside this folder.
