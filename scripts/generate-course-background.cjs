const fs = require('node:fs')
const path = require('node:path')
const zlib = require('node:zlib')

const width = 1920
const height = 1080
const pixels = Buffer.alloc(width * height * 4)

function setPixel(x, y, color) {
  if (x < 0 || x >= width || y < 0 || y >= height) return
  const offset = (y * width + x) * 4
  const alpha = color[3] / 255
  const inverse = 1 - alpha
  pixels[offset] = Math.round(color[0] * alpha + pixels[offset] * inverse)
  pixels[offset + 1] = Math.round(color[1] * alpha + pixels[offset + 1] * inverse)
  pixels[offset + 2] = Math.round(color[2] * alpha + pixels[offset + 2] * inverse)
  pixels[offset + 3] = 255
}

function drawRect(x, y, rectWidth, rectHeight, color) {
  for (let row = Math.floor(y); row < Math.ceil(y + rectHeight); row += 1) {
    for (let column = Math.floor(x); column < Math.ceil(x + rectWidth); column += 1) {
      setPixel(column, row, color)
    }
  }
}

function drawCloud(x, y, scale) {
  const cloudParts = [
    [0, 0, 76, 24],
    [17, -19, 40, 20],
    [44, -11, 27, 12],
  ]
  const originX = 38
  const originY = 12
  const shadow = [77, 145, 154, 51]
  const cloud = [244, 251, 248, 219]

  for (const [partX, partY, partWidth, partHeight] of cloudParts) {
    const scaledX = x + originX + (partX - originX) * scale + 6
    const scaledY = y + originY + (partY - originY) * scale + 7
    drawRect(scaledX, scaledY, partWidth * scale, partHeight * scale, shadow)
  }
  for (const [partX, partY, partWidth, partHeight] of cloudParts) {
    const scaledX = x + originX + (partX - originX) * scale
    const scaledY = y + originY + (partY - originY) * scale
    drawRect(scaledX, scaledY, partWidth * scale, partHeight * scale, cloud)
  }
}

for (let offset = 0; offset < pixels.length; offset += 4) {
  pixels[offset] = 159
  pixels[offset + 1] = 219
  pixels[offset + 2] = 226
  pixels[offset + 3] = 255
}

// The cloud positions mirror the desktop CSS layout below the 72px header.
drawCloud(173, 253, 0.78)
drawCloud(1734, 304, 1.05)
drawCloud(326, 835, 1.18)
drawCloud(1152, 877, 0.68)

function chunk(type, data) {
  const header = Buffer.alloc(8)
  header.writeUInt32BE(data.length, 0)
  header.write(type, 4, 4, 'ascii')
  const crc = Buffer.alloc(4)
  let checksum = 0xffffffff
  for (const byte of Buffer.concat([Buffer.from(type), data])) {
    checksum ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      checksum = (checksum >>> 1) ^ (checksum & 1 ? 0xedb88320 : 0)
    }
  }
  crc.writeUInt32BE((checksum ^ 0xffffffff) >>> 0, 0)
  return Buffer.concat([header, data, crc])
}

const scanlines = Buffer.alloc((width * 4 + 1) * height)
for (let row = 0; row < height; row += 1) {
  scanlines[row * (width * 4 + 1)] = 0
  pixels.copy(scanlines, row * (width * 4 + 1) + 1, row * width * 4, (row + 1) * width * 4)
}

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', Buffer.from([0, 0, 7, 128, 0, 0, 4, 56, 8, 6, 0, 0, 0])),
  chunk('IDAT', zlib.deflateSync(scanlines, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])

const output = path.join(__dirname, '..', 'src', 'assets', 'course-background.png')
fs.writeFileSync(output, png)
console.log(`Wrote ${output}`)
