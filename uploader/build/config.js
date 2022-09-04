"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('dotenv-defaults').config();

var _process$env = process.env,
    AWS_PROFILE = _process$env.AWS_PROFILE,
    S3_BUCKET = _process$env.S3_BUCKET,
    OBS_TIMESTAMP_FORMAT = _process$env.OBS_TIMESTAMP_FORMAT,
    OBS_OUTPUT_FOLDER_PATH = _process$env.OBS_OUTPUT_FOLDER_PATH;

var config = /*#__PURE__*/_createClass(function config() {
  _classCallCheck(this, config);
});

_defineProperty(config, "awsProfile", AWS_PROFILE);

_defineProperty(config, "s3Bucket", S3_BUCKET);

_defineProperty(config, "obsTimestampFormat", OBS_TIMESTAMP_FORMAT);

_defineProperty(config, "obsOutputFolderPath", OBS_OUTPUT_FOLDER_PATH);

var _default = config;
exports["default"] = _default;