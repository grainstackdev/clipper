// @flow

import fs from 'fs/promises'

const MINIMUM_PART_SIZE = 2.936e+7

export default class OngoingReader {
  filePath: string
  fileHandle: any
  timeOfFirstZero: number = -1
  isDone: boolean = false
  _isBufferDone: boolean = false


  constructor(filePath: string) {
    this.filePath = filePath
  }

  async getFileHandle() {
    if (!this.fileHandle) {
      this.fileHandle = await fs.open(this.filePath, 'r')
    }
    return this.fileHandle
  }

  async getNextBuffer(): Promise<Buffer> {
    if (this._isBufferDone) {
      return null
    }

    const handle = await this.getFileHandle()
    const {bytesRead, buffer} = await handle.read({})

    if (bytesRead === 0 && this.timeOfFirstZero === -1) {
      this.timeOfFirstZero = Date.now()
    } else if (bytesRead > 0 && this.timeOfFirstZero !== -1) {
      this.timeOfFirstZero = -1
    }

    if (this.timeOfFirstZero !== -1) {
      const elapsed = Date.now() - this.timeOfFirstZero
      if (elapsed > 10000) {
        this._isBufferDone = true
      }
    }

    if (bytesRead > 0) {
      return buffer
    }
  }

  bufferBuffer: Array<Buffer> = []
  sumBufferLength: number = 0
  async getNextPart(): Promise<Buffer> {
    if (this.isDone) {
      return null
    }

    if (this._isBufferDone) {
      // Turn the remaining into a smaller part.
      const final = joinBuffers(this.bufferBuffer, this.sumBufferLength)
      this.isDone = true
      return final
    }

    const buffer = await this.getNextBuffer()
    if (!buffer) {
      return null
    }

    this.bufferBuffer.push(buffer)
    this.sumBufferLength += buffer.length

    if (this.sumBufferLength > MINIMUM_PART_SIZE) {
      const final = joinBuffers(this.bufferBuffer, this.sumBufferLength)
      this.bufferBuffer = []
      this.sumBufferLength = 0
      return final
    }
  }
}

function joinBuffers(bufferBuffer: Array<Buffer>, sumBufferLength: number): Buffer {
  const finalBuffer = Buffer.alloc(sumBufferLength)
  let copyCount = 0
  for (const b of bufferBuffer) {
    b.copy(finalBuffer, copyCount)
    copyCount += b.length
  }

  return finalBuffer
}