import util from 'util';
import cp from 'child_process';
import syntaxerror from 'syntax-error';
import { tiktok } from "@xct007/frieren-scraper";
import fetch from 'node-fetch'
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from "url";
let fileP = fileURLToPath(import.meta.url)

class CMD {
  constructor() {
    this.pesan = 'Dunia ini bukanlah milikmu, semua ini hanyalah punya tuhan';
  }

  async menuCommand(m, prefix) {
    let contact = await m.getContact();
    let number = '@' + contact.number;
    let text =
      `
Haii ${number}

Lib : Whatsapp-web.js
Owner : Deff

[Information of Bot]
${prefix}runtime
${prefix}ping

[Owner Featured]
${prefix}/$>/
${prefix}restart
${prefix}sswa

[Tools Featured]

*Convert*
${prefix}sticker

*Downloader*
${prefix}tiktok

[Aksesibilitas]

*Group*
${prefix}enable <options>
${prefix}disable <options>


`.trimStart();
    m.reply(text, false, { mentions: [contact] });
  }

  async runtimeCommand(m, func) {
    m.reply(await func.format.clock(await process.uptime()));
  }

  async pingCommand(m, speed) {
    let timestamp = speed();
    let latensi = speed() - timestamp;
    m.reply(`*${latensi.toFixed(4)}* Second`);
  }

  async restartCommand(m) {
    cp.exec(`pm2 restart waweb`); //Jika make pm2 
  }

  async stickerCommand(m, msg, setting, MessageMedia) {
    let qMsg = await msg.quotedMsg;
    let [packname, author] = msg.value.split('|');
    if (msg.quotedMsg && msg.quotedMsg.hasMedia) {
      let attachmentData = await (await qMsg.downloadMedia());
      await m.reply(new MessageMedia(attachmentData.mimetype, attachmentData.data, attachmentData.filename), false, { sendMediaAsSticker: true, stickerName: packname || setting.packname, stickerAuthor: author || setting.packname, stickerCategories: ['😅'] });
    } else return m.reply(`Reply image/video with the command:\n${msg.command}`);
  }

  async tiktokCommand(m, msg, MessageMedia) {
    if (!msg.value) return m.reply(`Input URL:\n${msg.command} https://www.tiktok.com/@initokyolagii/video/7189917930761506075`);
    m.reply(mess.waitMessage)
    const data = await tiktok.v1(msg.value);
    if (data.error) return m.reply(`${data.message}`);
    const buffVideo = Buffer.from(await (await fetch(data.play)).arrayBuffer());
    const buffAudio = Buffer.from(await (await fetch(data.music)).arrayBuffer());
    await m.reply(new MessageMedia((await fileTypeFromBuffer(buffVideo)).mime, buffVideo.toString("base64")), false, { caption: `*${data.nickname}*\n@${data.unique_id}`.trim() });
    m.reply(new MessageMedia((await fileTypeFromBuffer(buffAudio)).mime, buffAudio.toString("base64")));
  }

  async screenshotWaCommand(m, conn, msg, MessageMedia) {
    if (!msg.isOwner) return m.reply(mess.ownerOnly)
    await conn.pupPage.setViewport({ width: 720, height: 1600 });
    let media = await conn.pupPage.screenshot({ fullPage: true });
    m.reply(new MessageMedia((await fileTypeFromBuffer(media)).mime, media.toString("base64")));
  }
  async tes(m) {
	m.reply('Activated')
	}
  async activatorGroupCommand(m, msg) {
  	let isEnable = /true|enable|(turn)?on|1/i.test(msg.command)
      let groups = db.groups[m.to]
      let type = (msg.value || '').toLowerCase()
      let isAll = false, isUser = false
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
*${type}* berhasil di *${isEnable ? 'nyala' : 'mati'}kan* ${isAll ? 'untuk bot ini' : isUser ? '' : 'untuk chat ini'}
`.trim())
      	}
  	}
export default CMD

fs.watchFile(fileP, () => {
    fs.unwatchFile(fileP)
    console.log(`Update File "${fileP}"`)
    import(`${import.meta.url}?update=${Date.now()}`)
})