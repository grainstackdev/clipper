// @flow

require('dotenv-defaults').config()

const {
  AWS_PROFILE,
  S3_BUCKET,
  OBS_TIMESTAMP_FORMAT,
  OBS_OUTPUT_FOLDER_PATH
} = process.env

class config {
  static awsProfile: string = AWS_PROFILE
  static s3Bucket: string = S3_BUCKET
  static obsTimestampFormat: string = OBS_TIMESTAMP_FORMAT
  static obsOutputFolderPath: string = OBS_OUTPUT_FOLDER_PATH
}

export default config