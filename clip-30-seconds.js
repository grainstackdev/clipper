
const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '.env')
})
const exec = require('child_process').execSync
const delay = require('delay')

const {
  INPUT_FILE,
  OUTPUT_FILE,
  MKV_FOLDER,
  TIMESTAMP_FORMAT,
  FFMPEG_PATH,
  FFPROBE_PATH,
} = process.env

const inputFile = INPUT_FILE || ''
const outputFile = OUTPUT_FILE || ''
const folder = MKV_FOLDER || ''
const timeFormat = TIMESTAMP_FORMAT || ''
const ffmpegPath = FFMPEG_PATH || ''
const ffprobePath = FFPROBE_PATH || ''

// #node index.js -s 30 -i "$inputFile" -o "$outputFile"
const indexPath = path.resolve(__dirname, 'index.js')
const command = `node ${indexPath} -s 30 -f "${folder}" -t "${timeFormat}" -x "${ffmpegPath}" -c "${ffprobePath}"`
console.log(command)
Promise.resolve().then(async () => {
  try {
    exec(command, {stdio: 'inherit'})
  } catch (err) {
    if (err) {
      console.error(err)
      await delay(3000)
    }
  }
})

