import util from 'util';
import cp from 'child_process';
import syntaxerror from 'syntax-error';
import {
 tiktok,
 instagram
} from "@xct007/frieren-scraper";
import fetch from 'node-fetch'
import {
 fileTypeFromBuffer
} from 'file-type';
import fs from 'fs';
import {
 fileURLToPath,
 pathToFileURL
} from "url";
import * as fileType from "file-type";
import yts from "yt-search"

let fileP = fileURLToPath(import.meta.url)
import * as bochil from '@bochilteam/scraper'
import si from 'systeminformation'
import os from 'os'
import {
 Youtube
} from './components/youtube.js'
const youtube = new Youtube()


class CMD {
 constructor() {
  this.pesan = 'Dunia ini bukanlah milikmu, semua ini hanyalah punya tuhan';
 }
 //--------------
 async menuCommand(m, prefix) {
  let contact = await m.getContact();
  let number = '@' + contact.number;

  let text =
  `
  Haii ${number}

  Lib : Whatsapp-web.js
  Owner : Deff
  Source : https://github.com/DEFF-Y/whatsapp-web.js-bot

  [Information of Bot]
  ${prefix}runtime
  ${prefix}ping
  ${prefix}system

  [Owner Featured]
  ${prefix}/$>/
  ${prefix}restart
  ${prefix}sswa

  [Tools Featured]

  *Convert*
  ${prefix}sticker
  ${prefix}toimg

  *Downloader*
  ${prefix}tiktok
  ${prefix}instagram
  ${prefix}play
  ${prefix}ytmp3
  ${prefix}ytmp4

  [Aksesibilitas]

  *Group*
  ${prefix}enable <options>
  ${prefix}disable <options>


  `.trimStart();
  await m.reply(text, false, {
   mentions: [contact]
  });
 }
 //--------------
 async runtimeCommand(m, func) {
  m.reply(await func.format.clock(await process.uptime()));
 }
 //--------------
 async pingCommand(m, speed) {
  let timestamp = speed();
  let latensi = speed() - timestamp;
  m.reply(`*${latensi.toFixed(4)}* Second`);
 }
 //--------------
 async restartCommand(m) {
  cp.exec(`pm2 restart waweb`); //Jika make pm2
 }
 //--------------
 async stickerCommand(m, msg, setting, MessageMedia) {
  try {
   let qMsg = await msg.quotedMessage;
   let [packname,
    author] = msg.value.split('|');
   let attachmentData = await (await qMsg.downloadMedia());
   await m.reply(new MessageMedia(attachmentData.mimetype, attachmentData.data, attachmentData.filename), false, {
    sendMediaAsSticker: true, stickerName: packname || setting.packname, stickerAuthor: author || setting.packname, stickerCategories: ['😅']
   });
  } catch (e) {
   m.reply(`Reply image/video with the command:\n${msg.command}`)
  }
 }
 //--------------
 async tiktokCommand(m, msg, MessageMedia) {
  if (!msg.value) return m.reply(`Input URL:\n${msg.command} https://www.tiktok.com/@initokyolagii/video/7189917930761506075`);
  m.reply(mess.waitMessage)
  const data = await tiktok.v1(msg.value);
  if (data.error) return m.reply(`${data.message}`);
  const buffVideo = Buffer.from(await (await fetch(data.play)).arrayBuffer());
  await m.reply(new MessageMedia((await fileTypeFromBuffer(buffVideo)).mime, buffVideo.toString("base64")), false, {
   caption: `*${data.nickname}*\n@${data.unique_id}`.trim()
  });
  const mediaAudio = new MessageMedia('audio/mpeg', await func.bufferToBase64(await func.fetchBuffer(data.music)), 'Tiktok')
  m.reply(mediaAudio, false, {
   sendMediaAsDocument: false, caption: 'Done'
  });
 }
 //--------------
 async screenshotWaCommand(m, conn, msg, MessageMedia) {
  if (!msg.isOwner) return m.reply(mess.ownerOnly)
  await conn.pupPage.setViewport({
   width: 720, height: 1600
  });
  let media = await conn.pupPage.screenshot({
   fullPage: true
  });
  m.reply(new MessageMedia((await fileTypeFromBuffer(media)).mime, media.toString("base64")));
 }
 //--------------
 async activatorGroupCommand(m, msg) {
  let isEnable = /true|enable|(turn)?on|1/i.test(msg.command)
  let groups = db.groups[m.to]
  let type = (msg.value || '').toLowerCase()
  let isAll = false,
  isUser = false
  if (!msg.isGroup) return m.reply(mess.groupOnly)
  if (!(msg.isAdmin || msg.isOwner)) return m.reply(mess.adminOnly)
  switch (type) {
   case 'welcome':
    groups.welcome = isEnable
    break
   default:
    if (!/[01]/.test(msg.command)) return m.reply(`
     List option:
     => welcome

     Contoh:
     ${msg.prefix}enable welcome
     ${msg.prefix}disable welcome
     `.trim())
    throw false
   }
   m.reply(`
    *${type}* berhasil di *${isEnable ? 'nyala': 'mati'}kan* ${isAll ? 'untuk bot ini': isUser ? '': 'untuk chat ini'}
    `.trim())
  }
  async tes (m) {
   m.reply('Activated')
  }
  //--------------
  async instagramCommand(m, msg, func, MessageMedia) {
   if (!msg.value) return m.reply(`Input URL:\n${msg.command} https://www.instagram.com/p/Cp9u9aou7lK`);
   m.reply(mess.waitMessage)
   const data = await instagram.v1(msg.value)
   if (data.error) return m.reply(`${data.message}`);
   for (let url of data) {
    const media = new MessageMedia(fileTypeFromBuffer(await func.fetchBuffer(url.url)).mime, await func.bufferToBase64(await func.fetchBuffer(url.url)), msg.value)
    m.reply(media, false, {
     sendMediaAsDocument: false, caption: 'Done'
    });
   }
  }
  //--------------
  async toimageCommand(m, msg, MessageMedia) {
   try {
    let quotedMsg = await m.getQuotedMessage() || m;
    let mediaData = await quotedMsg.downloadMedia();
    if (!mediaData || !mediaData.data) {
     return m.reply(`Reply sticker dengan command ${msg.command}`);
    }
    let fileData = mediaData.data;
    let fileBuffer = Buffer.from(fileData, 'base64');
    let webpFilePath = './storage/media/cache/toimg.webp';
    let jpgFilePath = './storage/media/cache/toimg.jpeg';
    await fs.writeFileSync(webpFilePath, fileBuffer);
    console.log(`File ${webpFilePath} written successfully.`);
    let ffmpegCommand = `ffmpeg -i ${webpFilePath} ${jpgFilePath}`;
    console.log(`Running command: ${ffmpegCommand}`);
    await cp.exec(ffmpegCommand, async (err, stderr, stdout) => {
     if (err) {
      console.error(`Error running command: ${err}`);
      return m.reply(`Gagal mengubah sticker menjadi gambar. Silakan coba lagi nanti.`);
     }
     console.log(`Command output: ${stdout}`);
     let media = await MessageMedia.fromFilePath(jpgFilePath);
     await m.reply(media);
     fs.unlinkSync(jpgFilePath);
     fs.unlinkSync(webpFilePath);
     console.log(`Files ${jpgFilePath} and ${webpFilePath} deleted successfully.`);
    });
   } catch (error) {
    console.error(`Error in toimageCommand: ${error}`);
    m.reply(`Terjadi kesalahan saat mengubah sticker menjadi gambar. Silakan coba lagi nanti.`);
   }
  }
  //--------------
  async ytMp3Command(m,
   msg,
   func,
   MessageMedia) {
   if (!msg.value) {
    return m.reply("Masukkan URL YouTube...")
   }
   m.reply("Sedang diproses...")
   var url = await (await bochil.youtubedlv2(msg.value)).audio["128kbps"].download()
   const mediaType = await fileTypeFromBuffer(await func.fetchBuffer(url))
   const media = new MessageMedia('audio/mpeg', await func.bufferToBase64(await func.fetchBuffer(url)), msg.value)
   m.reply(media, false, {
    sendMediaAsDocument: true, caption: 'tes'
   });
  }
  //--------------
  async playCommand(m, msg, func, MessageMedia) {
   if (!msg.value) {
    return m.reply("Masukkan Judul video YouTube...")
   }
   m.reply(mess.waitMessage)
   var res = await (await yts(msg.value)).all[0]
   var url = await (await bochil.youtubedlv2(res.url)).audio["128kbps"].download()
   const mediaType = await fileTypeFromBuffer(await func.fetchBuffer(url))
   const media = new MessageMedia('audio/mpeg', await func.bufferToBase64(await func.fetchBuffer(url)), msg.value)
   m.reply(media, false, {
    sendMediaAsDocument: false, caption: 'Done'
   });
  }
  //--------------
  async ytMp4Command(m, msg, MessageMedia) {
   if (!msg.value) return m.reply("Masukan URL YouTube...")
   m.reply(mess.waitMessage)
   let res = await youtube.download(msg.value, false)
   let ytMp4 = await Buffer.from(await (await fetch(res.url)).arrayBuffer())
   m.reply(new MessageMedia((await fileTypeFromBuffer(ytMp4)).mime, ytMp4.toString("base64")), false, {
    caption: res.title
   });
  }
  //--------------
  async banCommand(m, msg) {
   switch (msg.command) {
    case msg.prefix + 'banned': {
     if (!msg.isOwner) return m.reply(mess.ownerOnly)
     if (!(msg.value || msg.isGroup)) return m.reply('Masukkan user yang ingin di ban\n\nExample: .banned 63838383xxx')
     let who
     if (msg.isGroup) who = m._data.quotedParticipant ? m._data.quotedParticipant: msg.value
     if (!who) return m.reply('Tag salah satu orang yang mau di banned')
     let users = db.users
     users[Array(who.replace(/[^0-9]/g, '') + '@c.us')].banned = true
     m.reply(`Berhasil Banned User`)
    }
     break;
    case msg.prefix + 'unbanned': {
     if (!msg.isOwner) return m.reply(mess.ownerOnly)
     if (!(msg.value || msg.isGroup)) return m.reply('Masukkan user yang ingin di unban\n\nExample: .unbanned 63838383xxx')
     let who
     if (msg.isGroup) who = m._data.quotedParticipant ? m._data.quotedParticipant: msg.value
     if (!who) return m.reply('Tag salah satu orang yang mau di unbanned')
     let users = db.users
     users[Array(who.replace(/[^0-9]/g, '') + '@c.us')].banned = false
     m.reply(`Berhasil Unbanned User`)
    }
     break
   }
  }
  async systemCommand(m, func, msg) {
   let OsInfo = await si.osInfo()
   let System = await si.system()
   let Cpu = await si.cpu()
   let Mem = await si.mem()

   let {
    platform,
    distro,
    release,
    codename,
    kernel,
    arch,
    hostname,
    fqdn,
    codepage,
    logofile
   } = OsInfo
   let {
    manufacturer,
    brand,
    vendor,
    family,
    model,
    stepping,
    revision,
    voltage,
    speed,
    speedMin,
    speedMax,
    governor,
    cores,
    physicalCores,
    processors
   } = Cpu
   let {
    total,
    free,
    used,
    active,
    available,
    buffers,
    cached,
    slab,
    buffcache
   } = Mem

   let teks = `System Information`
   teks += `

   Uptime : ${func.format.clock(os.uptime())}

   *OS INFO*
   Platform: ${platform}
   Distro: ${distro}
   Release: ${release}
   Codename: ${codename}
   Kernel: ${kernel}
   Arch: ${arch}
   Hostname: ${hostname}
   Codepage: ${codepage}

   *CPU INFO*
   Manufacturer: ${manufacturer}
   Brand: ${brand}
   Vendor: ${vendor}
   Family: ${family}
   Model: ${model}
   Speed: ${speed} Ghz
   Governor: ${governor}
   Cores: ${cores}
   PhysicalCores: ${physicalCores}
   Processors: ${processors}

   *MEMORY INFO*
   Memory : ${func.format.size(used)}/${func.format.size(total)}
   Free : ${func.format.size(free)}
   Cached: ${func.format.size(cached)}
   `
   await m.reply(teks)
  }
 }
 export default CMD

  fs.watchFile(fileP, () => {
   fs.unwatchFile(fileP)
   console.log(`Update File "${fileP}"`)
   import(`${import.meta.url}?update=${Date.now()}`)
  })