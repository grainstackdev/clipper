// @flow

import path from 'path'
import fs from 'fs'
import os from 'os'
import SingleInstance from 'single-instance'
import uploadFile from "./uploadFile";
import config from "./config";
import parse from "date-fns/parse";


const appName = 'uploader'
const locker = new SingleInstance(appName)

// locker.lock().then(async () => {
Promise.resolve().then(async () =>{
  // console.log('os.homedir()', os.homedir())

  // const filePath = path.resolve(os.homedir(), 'Movies/2022-09-03 18-03-58.mkv')
  const filePath = resolveLatestRecording()
  await uploadFile(filePath)
  // const stream = new OngoingReader(filePath)
  //
  // stream.fileHandle.close()

  process.exit(0)
}).catch(err => {
  console.error(err)
  process.exit(1)
})

function resolveLatestRecording() {
  let folderPath = ""
  if (config.obsOutputFolderPath.startsWith('~')) {
    folderPath = path.resolve(os.homedir(), config.obsOutputFolderPath.slice(2))
  } else {
    folderPath = path.resolve(config.obsOutputFolderPath)
  }

  return findLastMkv(folderPath, config.obsTimestampFormat)
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