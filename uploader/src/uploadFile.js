// @flow

import fs from 'fs/promises'
import md5 from 'md5'
import getS3Client from "./getS3Client";
import config from "./config";
import OngoingReader from "./OngoingReader";
const { CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand } = require("@aws-sdk/client-s3");

export default async function uploadFile(filePath: string): void {
  const client = await getS3Client()

  const fileName = filePath.slice(filePath.lastIndexOf('/') + 1)
  // todo verify file is mkv
  
  console.log(`Begin uploading ${fileName}`)

  const command = new CreateMultipartUploadCommand({
    Bucket: config.s3Bucket,
    Key: fileName // todo sanitize
  })
  const createRes = await client.send(command)

  const uploadId = createRes.UploadId

  const reader = new OngoingReader(filePath)

  let partNumber = 1
  let bufferCount = 0
  const completedParts = []
  while (!reader.isDone) {
    const buffer = await reader.getNextPart()
    if (!buffer) continue

    bufferCount += buffer.length

    console.log(`Uploading ${partNumber}, ${bufferCount / 100000}`)

    const uploadRes = await client.send(new UploadPartCommand({
      Bucket: config.s3Bucket,
      Key: fileName,
      PartNumber: partNumber,
      UploadId: uploadId,
      Body: buffer
    }))
    completedParts.push({
      PartNumber: partNumber,
      ETag: uploadRes.ETag
    })

    console.log(`Uploaded ${partNumber}`)
    partNumber++
  }

  console.log('completedParts', completedParts)

  await client.send(new CompleteMultipartUploadCommand({
    Bucket: config.s3Bucket,
    Key: fileName,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: completedParts
    }
  }))

  console.log(`Completed uploading ${fileName}`)

  // turn mkv file into bit stream,
  // batch bits into parts,
  // upload parts,
  // complete upload.
}