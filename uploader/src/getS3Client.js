// @flow

import {S3Client} from "@aws-sdk/client-s3";
const {loadSharedConfigFiles} = require('@aws-sdk/shared-ini-file-loader');
import config from "./config";

export default async function getS3Client(): any {
  const sharedConfig = await loadSharedConfigFiles();
  const region = sharedConfig.configFile[config.awsProfile]?.region
  const accessKeyId = sharedConfig.credentialsFile[config.awsProfile]?.aws_access_key_id
  const secretAccessKey = sharedConfig.credentialsFile[config.awsProfile]?.aws_secret_access_key

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  })
  return client
}