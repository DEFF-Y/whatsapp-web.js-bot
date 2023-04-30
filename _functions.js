import util from 'util';
import hr from 'human-readable';
import axios from 'axios';

function Formarter() {
    this.util = util.format
    this.size = formatSize
    this.date = function(fmt) {
        let date = new Date(((fmt + "000") * 1) + (1000 * 60 * 60 * 7))
        let YYYY = date.getFullYear()
        let MM = date.getMonth() + 1
        let DD = date.getDate()
        let hh = date.getHours()
        let mm = date.getMinutes()
        let ss = date.getSeconds()

        return [YYYY, MM, DD].map(v => ("" + v).padStart(2, "0")).join("-") + ", " + [hh, mm, ss].map(v => ("" + v).padStart(2, "0")).join(":")
    }
    this.money = function(n, opt = "IDR") {
            return n.toLocaleString("id", {
                style: "currency",
                currency: opt
            })
        },
        this.number = function(n) {
            return n.toLocaleString("id")
        }
    this.clock = function clockString(ms) {
 let h = isNaN(ms) ? '--' : Math.floor(ms % (3600 * 24) / 3600)
	let m = isNaN(ms) ? '--' : Math.floor(ms % 3600 / 60)
	let s = isNaN(ms) ? '--' : Math.floor(ms % 60)
	return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
    }
    this.FtoC = function(f) {
        if (f.endsWith("°F")) return "" + Math.ceil(((f.replace(/[^0-9]/g, "") * 1) - 32) * 5 / 9) + "°C"
        else return f
    }
    this.json = function(j) {
        return JSON.stringify(j, null, 2)
    }
    this.bytes = function(bytes) {
        const sizes = ["B", "KB", "MB", "GB", "TB"]
        if (bytes == 0 || isNaN(bytes * 1)) return "0 B"
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
        return (bytes / Math.pow(1024, i)) + " " + sizes[i]
    }
}
let formatSize = hr.sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`
})
export async function sendGroupMessage(anu, message, client) {
  const { remote, participant } = anu.id;
  const name = participant.replace('@c.us', '');
  try {
    const contact = await client.getContactById(participant);
    const text = `${message} @${name}`;
    await client.sendMessage(remote, text, { mentions: [contact] });
  } catch (error) {
    console.log(error);
  }
}
export async function fetchJson(url, options = {}) {
        try {
            let data = await axios(url, {
                method: "get",
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
                    origin: url,
                    referer: url
                },
                responseType: 'json'
            })

            return data?.data
        } catch (e) {
            return e
        }
    }
export async function isUrl(url) {
        //url = url.replace(/ /g, '%20')
        return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'gi'))
    }
export async function fetchBuffer(string, options = {}) {
        return new Promise(async (resolve, reject) => {
            if (isUrl(string)) {
                let buffer = await axios({
                    url: string,
                    method: "GET",
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
                        'Referer': string
                    },
                    responseType: 'arraybuffer',
                    ...options
                })

                resolve(buffer.data)
            } else if (Buffer.isBuffer(string)) {
                resolve(string)
            } else if (/^data:.*?\/.*?;base64,/i.test(string)) {
                let buffer = Buffer.from(string.split`,`[1], 'base64')
                resolve(buffer)
            } else {
                let buffer = fs.readFileSync(string)
                resolve(buffer)
            }
        })
    }
export async function getFile(PATH, save) {
        try {
            let filename = 'Not Saved'
            let data
            if (/^https?:\/\//.test(PATH)) {
                data = await fetchBuffer(PATH)
            } else if (/^data:.*?\/.*?;base64,/i.test(PATH)) {
                data = Buffer.from(PATH.split`,`[1], 'base64')
            } else if (fs.existsSync(PATH) && (fs.statSync(PATH)).isFile()) {
                data = fs.readFileSync(PATH)
            } else if (Buffer.isBuffer(PATH)) {
                data = PATH
            } else {
                data = Buffer.alloc(20)
            }

            let type = await fileTypeFromBuffer(data) || {
                mime: 'application/octet-stream',
                ext: '.bin'
            }

            if (data && save) {
                filename = path.join(__dirname, "..", "..", 'temp', new Date * 1 + "." + type.ext)
                fs.promises.writeFile(filename, data)
            }
            let size = Buffer.byteLength(data)
            return {
                filename,
                size,
                sizeH: format.size(size),
                ...type,
                data
            }
        } catch { }
    }
export async function getRandom(ext = "", length = "10") {
        var result = ""
        var character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
        var characterLength = character.length
        for (var i = 0; i < length; i++) {
            result += character.charAt(Math.floor(Math.random() * characterLength))
        }

        return `${result}${ext ? `.${ext}` : ""}`
    }
export async function bufferToBase64(buffer) {
        if (!Buffer.isBuffer(buffer)) throw new Error("Buffer Not Detected")

        var buf = new Buffer(buffer)
        return buf.toString('base64')
    }

export async function base64ToBuffer(base) {
        return Buffer.from(base, 'base64')
    }

export async function streamToBuffer(strea) {
        let buff = Buffer.alloc(0)
        for (const chunk of strea) {
            buff = Buffer.concat([buff, chunk])
        }
        strea.destroy()
        return buff
    }
export async function downloadMediaMessage(deff, message) {
        if (!Boolean(message.mediaKey && message.directPath)) throw new Error('Not Media Message')

        const result = await deff.pupPage.evaluate(async (msg) => {
            try {
                const decryptedMedia = await (window.Store.DownloadManager?.downloadAndMaybeDecrypt || window.Store.DownloadManager?.downloadAndDecrypt)({
                    directPath: msg.directPath,
                    encFilehash: msg.encFilehash,
                    filehash: msg.filehash,
                    mediaKey: msg.mediaKey,
                    mediaKeyTimestamp: msg.mediaKeyTimestamp,
                    type: msg.type,
                    signal: (new AbortController).signal
                });

                const data = await window.WWebJS.arrayBufferToBase64Async(decryptedMedia);

                return {
                    data,
                    mimetype: msg.mimetype,
                    filename: msg.filename,
                    filesize: msg.size
                };
            } catch (e) {
                if (e.status && e.status === 404) return undefined
                throw e
            }
        }, message)

        if (!result) return undefined;
        return base64ToBuffer(result?.data)
    }

export const format = new Formarter()