
const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '.env')
})
// const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs-extra')
const minimist = require('minimist')
const chalk = require('chalk')
const execSync = require('child_process').execSync
const exec = require('child_process').exec
const spawn = require('child_process').spawn
const parse = require('date-fns/parse')
const delay = require('delay')
const taskkill = require('taskkill')
const tasklist = require('tasklist')

const {
  VIDEO_PLAYER_PATH
} = process.env

/*::
type CodecData = {
  format: string,
  audio: string,
  video: string,
  duration: string,
  video_details: Array<string>,
  audio_details: Array<string>
}
*/

// function timemarkToSeconds(timemark/*: string*/)/*: number*/ {
//   if (typeof timemark === 'number') {
//     return timemark;
//   }
//
//   if (timemark.indexOf(':') === -1 && timemark.indexOf('.') >= 0) {
//     return Number(timemark);
//   }
//
//   var parts = timemark.split(':');
//
//   // add seconds
//   var secs = Number(parts.pop());
//
//   if (parts.length) {
//     // add minutes
//     secs += Number(parts.pop()) * 60;
//   }
//
//   if (parts.length) {
//     // add hours
//     secs += Number(parts.pop()) * 3600;
//   }
//
//   return secs;
// }


async function getLength(inputFile/*: string*/, ffprobePath/*: ?string*/)/*: Promise<number>*/ {
  // todo: escape or make sure no user generated strings are passed in:
  const command = `${ffprobePath || 'ffprobe'} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputFile}"`
  console.log('command', command)
  const res = execSync(command).toString()
  console.log('res', res)
  const length = parseFloat(res)
  return length

  // old code to get the codecData which contains the duration sometimes.
  // The duration of an MKV in recording cannot be obtained this way.
  // return new Promise((resolve, reject) => {
  //   let codecData
  //   const tempFile = path.resolve(`./temp_${Math.random().toString().slice(2)}.mp4`)
  //   const tempOutStream = fs.createWriteStream(tempFile);
  //   ffmpeg(fs.createReadStream(inputFile))
  //     .outputOptions(['-frag_duration 100','-movflags frag_keyframe+empty_moov+faststart'])
  //     .toFormat('mp4')
  //     .frames(1)
  //     .on('error', function(err) {
  //       reject(err)
  //     })
  //     .on('end', function() {
  //       fs.unlink(tempFile, (err) => {
  //         if (err) {
  //           return reject(err)
  //         }
  //         resolve(codecData)
  //       })
  //     })
  //     .on('codecData', function(data) {
  //       codecData = data
  //     })
  //     .pipe(tempOutStream)
  // })
}

function getCreatedAt(inputFile/*: string*/)/*: Promise<number>*/ {
  const {birthtime} = fs.statSync(inputFile)
  return birthtime.valueOf()
}

async function clipEnding(inputFile/*: ?string*/, outputFile/*: ?string*/, seconds/*: ?number*/, ffmpegPath/*: ?string*/, ffprobePath/*: ?string*/)/*: Promise<any>*/ {
  if (!inputFile) {
    throw new Error('Missing inputFile')
  }
  if (!outputFile) {
    throw new Error('Missing outputFile')
  }
  if (!seconds) {
    throw new Error('Missing seconds or 0 seconds.')
  }

  // const data = await getLength(inputFile)
  // console.log('data', data)
  // const length = timemarkToSeconds(data.duration)
  // const length = await getLength(inputFile, ffprobePath)
  const createdAt = getCreatedAt(inputFile)
  const length = (Date.now() - createdAt) / 1000

  const seekTime = length - seconds + 0.5

  // todo: escape or make sure no user generated strings are passed in:
  const command = `${ffmpegPath || 'ffmpeg'} -ss ${seekTime} -i "${inputFile}" -t ${seconds} -y "${outputFile}"`
  console.log('command', command)
  execSync(command, {stdio: 'inherit'})

  // return new Promise((resolve, reject) => {
    // console.log('inputFile', inputFile)
    // console.log(`Outputting: ${outputFile}`)
    // const outStream = fs.createWriteStream(outputFile);
    // ffmpeg(fs.createReadStream(inputFile))
    //   .outputOptions(['-frag_duration 100','-movflags frag_keyframe+empty_moov+faststart'])
    //   .toFormat('mp4')
    //   .inputOptions(`-ss ${seekTime}`)
    //   .inputOptions(`-t ${seconds}`)
    //   // .seekInput(seekTime)
    //   .on('error', function(err) {
    //     reject(err)
    //   })
    //   .on('end', function() {
    //     resolve()
    //   })
    //   .on('progress', function(progress) {
    //     console.log('Processing: ' + progress.percent + '% done');
    //   })
    //   .pipe(outStream)
  // })
}

/*
  Looks for the last MKV file based on:

  * Has extension .mkv
  * Name is a parseable timestamp.

* */
function findLastMkv(folder, timeFormat) {
  const contents = fs.readdirSync(folder)

  let latestTime
  let latestName
  for (const name of contents) {
    const endsWithMkv = name.endsWith('.mkv')
    if (!endsWithMkv) continue

    const basename = name.split('.mkv')[0]
    const time = parse(basename, timeFormat, new Date()) // todo: This new Date should be in the requester's TZ
    if (!latestTime || latestTime < time) {
      latestTime = time
      latestName = name
    }
  }

  return path.resolve(folder, latestName)
}


Promise.resolve().then(async () => {
  // todo: escape user input:
  const argv = minimist(process.argv.slice(2));
  const seconds = parseFloat(argv['s'])

  console.log('argv', argv)

  let inputFile = argv['i'] ? path.resolve(argv['i']) : null
  let outputFile = argv['o'] ? path.resolve(argv['o']) : null
  const folder = argv['f'] ? path.resolve(argv['f']) : null
  const timeFormat = argv['t']
  const ffmpegPath = typeof argv['x'] === 'string' && argv['x']
  const ffprobePath = typeof argv['c'] === 'string' && argv['c']

  if (folder) {
    inputFile = findLastMkv(folder, timeFormat)
  }

  if (!outputFile && folder && inputFile) {
    const fname = path.basename(inputFile)
    const basename = fname.split('.mkv')[0]
    const outname = `${basename} ${Date.now()}.mp4`
    outputFile = path.resolve(folder, basename, outname)
    fs.ensureDirSync(path.resolve(folder, basename))
  }

  console.log(chalk.yellow(`Clipping last ${chalk.red(seconds)} seconds from ${chalk.red(inputFile)} to ${chalk.green(outputFile)}`))
  await clipEnding(inputFile, outputFile, seconds, ffmpegPath, ffprobePath)

  if (process.env.VIDEO_PLAYER_PATH) {
    // Open the video in the chosen video player.
    // Using auto-close.
    const command = `"${process.env.VIDEO_PLAYER_PATH}" "${outputFile}"`
    console.log('command', command)
    const task = spawn(process.env.VIDEO_PLAYER_PATH, [outputFile])
    await delay(seconds * 1000 + 500)
    process.kill(task.pid)
  } else {
    // Open the clip in the default .mp4 player.
    // Auto-close is hard to implement for this case.
    const command = `start "" "${outputFile}"`
    execSync(command, {stdio: 'inherit'})
  }

}).catch(async err => {
  console.error(err)
  await delay(30000)
  process.exit(1)
})

async function killVideoPlayer() {
  const list = await tasklist()
  console.log(list)
}
// ffmpeg(fs.createReadStream(file))
//   .outputOptions(['-frag_duration 100','-movflags frag_keyframe+empty_moov+faststart'])
//   .toFormat('mp4')
//   // .seekInput('')
//   .duration(1)
//   // .videoCodec('libx264')
//   // .audioCodec('libmp3lame')
//   // .size('320x240')
//   .on('error', function(err) {
//     console.log('An error occurred: ' + err.message);
//   })
//   .on('end', function() {
//     console.log('Processing finished !');
//   })
//   .on('codecData', function(data) {
//     console.log('data', data)
//   })
//   .on('progress', function(progress) {
//     console.log('progress', progress)
//     // console.log('Processing: ' + progress.percent + '% done');
//   })
//   .pipe(outStream)
//   // .on('data', function(chunk) {
//   //   // console.log('ffmpeg just wrote ' + chunk.length + ' bytes');
//   // })