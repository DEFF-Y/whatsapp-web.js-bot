import wweb from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import axios from 'axios';
import util from 'util';
import cp from 'child_process';
import syntaxerror from 'syntax-error';
import speed from 'performance-now';
import * as load from './components/loaderDatabase.js';
// Import semua fungsi yang diperlukan menjadi variabel global
import CMD from './_funcCmd.js'
const cmd = new CMD();
import * as func from './_functions.js'
import {
 databased,
 dbsaver,
 connect
} from './components/database.js';

global.setting = {
 owner: ['628999699559@c.us'],
 packname: 'Sticker by Deff/WhatsappBot-Waweb.js',
 author: 'Deff'
}

global.mess = {
 privateOnly: 'Fitur ini hanya dapat digunakan di private chat',
 groupOnly: 'Fitur ini hanya dapat digunakan di group chat',
 waitMessage: 'Please wait...\nData in process\nJika terlalu lama mungkin error',
 bannedMessage: 'Kamu telah dibanned oleh owner\nKarena alasan tertentu',
 ownerOnly: 'Fitur ini hanya dapat digunakan oleh owner',
 adminOnly: 'Fitur ini hanya dapat diakses oleh admin'
}

// Inisialisasi client WhatsApp
const {
 Client,
 LocalAuth,
 MessageMedia
} = wweb;
const deff = new Client({
 authStrategy: new LocalAuth(),
 bypassCSP: true,
 puppeteer: {
  args: [
   '--no-sandbox',
   '--disable-web-security',
   '--no-first-run',
   '--no-default-browser-check',
   '--disable-setuid-sandbox',
   '--disable-accelerated-2d-canvas',
   '--disable-session-crashed-bubble',
   '--start-maximized',
   '--disable-features=LightMode',
   '--force-dark-mode'
  ],
  executablePath: '/usr/bin/google-chrome-stable' // untuk pengguna ubuntu/vps
 },
 userAgent:
 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
});

// Mulai menjalankan client WhatsApp
deff.initialize();
await connect().catch(() => connect())
setInterval(async () => {
 fs.writeFileSync(`./storage/database/database.json`, JSON.stringify(global.db, null, 3))}, 3 * 1000)
// Event saat loading screen muncul
deff.on('loading_screen', (percent, message) => {
 console.log('LOADING SCREEN', percent, message);
});

// Event saat QR code muncul
deff.on('qr', (qr) => {
 console.log('QR RECEIVED', qr);
 qrcode.generate(qr, {
  small: true
 });
});

// Event saat proses authentikasi berhasil
deff.on('authenticated', () => {
 console.log('AUTHENTICATED');
});

// Event saat proses authentikasi gagal
deff.on('auth_failure', (msg) => {
 console.error('AUTHENTICATION FAILURE', msg);
});

// Event saat client WhatsApp siap digunakan
deff.on('ready', async () => {
 console.log('READY');
});

// Listener untuk kejadian ketika ada pengguna bergabung ke grup
deff.on('group_join', (anu) => {
 if (db.groups[anu.id.remote].welcome === true) {
  console.log(anu);
  const message = 'Selamat datang';
  func.sendGroupMessage(anu, message, deff);
 }
});

// Listener untuk kejadian ketika ada pengguna keluar dari grup
deff.on('group_leave', (anu) => {
 if (db.groups[anu.id.remote].welcome === true) {
  console.log(anu);
  const message = 'Selamat tinggal';
  func.sendGroupMessage(anu, message, deff);
 }
});

/*
 @Feature in here
*/
deff.on("message_create", async (m) => {
 try {
  if (!m._data.isNewMsg) return;

  class Message {
   constructor({
    body = "", from, id, hasMedia, timestamp, type, hasQuotedMsg, quoted
   }) {
    this.from = from;
    this.id = id;
    this.hasMedia = hasMedia;
    this.timestamp = timestamp;
    this.type = type;
    this.hasQuotedMsg = hasQuotedMsg;
    this.sender = id.participant || from;
    this.chat = null;
    this.body = body;
    this.args = body.trim().split(/\s+/).slice(1);
    this.value = this.args.join(" ");
    this.prefix = /^[./!#%^&=\,;:()]/.test(body) ? body[0]: "#";
    this.command = body?.toLowerCase().split(/\s+/)[0] || "";
    this.isCmd = body?.startsWith(this.prefix) || false;
    this.isOwner = setting.owner.map(v => v.replace(/[^0-9]/g, '') + '@c.us').includes(m.author ? m.author : m.from)
    this.quotedMessage = m.getQuotedMessage() || m;
    this.isGroup = m.id.remote.endsWith('g.us');
    this.isPrivate = m.id.remote.endsWith('c.us');
   }

   async getChat() {
    if (this.chat) return this.chat;
    const chat = await m.getChat();
    this.chat = chat;
    return chat;
   }
  }

  const msg = new Message({
   ...m
  });
  const quoted = m?.hasQuotedMsg ? m.quoted: m
  const participantsGroup = await m.getChat().then(chat => chat.participants);
  const adminFilter = msg.isGroup ? participantsGroup.filter(v => v.isAdmin).map(v => v.id.user): null;
  msg.isAdmin = adminFilter ? adminFilter.map(v => v.replace(/[^0-9]/g, '') + '@c.us').includes(m.author ? m.author: m.from): false;
  msg.isBotAdmin = adminFilter ? adminFilter.map(v => v.replace(/[^0-9]/g, '') + '@c.us').includes(deff.info.me._serialized): false;


  if (msg.isCmd) {
   console.log('Pesan: ' + msg.body)
  }
  if (msg.body) {
   await load.loadDatabase(m, msg)
  }
  if (db.setting.self === true) {
   if (msg.isCmd && !msg.isOwner) {
    return
   }
  }
  const commands = {
   menu: (message) => ({
    execute: () => cmd.menuCommand(m, msg.prefix, func, deff),
    matches: ['menu']
   }),
   runtime: (message) => ({
    execute: () => cmd.runtimeCommand(m, func),
    matches: ['runtime', 'uptime']
   }),
   ping: (message) => ({
    execute: () => cmd.pingCommand(m, speed),
    matches: ['ping', 'speed']
   }),
   restart: (message) => ({
    execute: () => cmd.restartCommand(m, cp),
    matches: ['restart']
   }),
   sticker: (message) => ({
    execute: () => cmd.stickerCommand(m, msg, setting, MessageMedia),
    matches: ['sticker', 's', 'stiker', 'sgif', 'stickergif']
   }),
   tiktok: (message) => ({
    execute: () => cmd.tiktokCommand(m, msg, MessageMedia),
    matches: ['tiktok', 'ttdl', 'ttmp3', 'ttmp4', 'tt']
   }),
   screenshotWa: (message) => ({
    execute: () => cmd.screenshotWaCommand(m, deff, msg, MessageMedia),
    matches: ['sswa', 'screenshot-whatsapp']
   }),
   activator: (message) => ({
    execute: () => cmd.activatorGroupCommand(m, msg),
    matches: ['enable', 'disable']
   }),
   tes: (message) => ({
    execute: () => cmd.tes(m),
    matches: ['tes']
   }),
   instagram: (message) => ({
    execute: () => cmd.instagramCommand(m, msg, func, MessageMedia),
    matches: ['igdl', 'instagram', 'ig']
   }),
   toimage: (message) => ({
    execute: () => cmd.toimageCommand(m, msg, MessageMedia),
    matches: ['toimg', 'toimage']
   }),
   ytmp3: (message) => ({
    execute: () => cmd.ytMp3Command(m, msg, func, MessageMedia),
    matches: ['ytmp3', 'youtubemp3']
   }),
   ytmp4: (message) => ({
    execute: () => cmd.ytMp4Command(m, msg, MessageMedia),
    matches: ['ytmp4', 'youtubemp4']
   }),
   playYt: (message) => ({
    execute: () => cmd.playCommand(m, msg, func, MessageMedia),
    matches: ['play']
   }),
   ban: (message) => ({
    execute: () => cmd.banCommand(m, msg),
    matches: ['banned', 'unbanned']
   }),
   systemInformation: (message) => ({
    execute: () => cmd.systemCommand(m, func, msg),
    matches: ['status', 'system']
   })
  };


  function findCommand(message) {
   const command = message.command.slice(1);
   for (const cmd of Object.keys(commands)) {
    const {
     matches,
     execute
    } = commands[cmd](message);
    if (matches.includes(command)) {
     execute();
     return;
    }
   }
   // console.log('Text no command');
  }

if (msg.command.startsWith(msg.prefix)) {
      if (!msg.isOwner && db.users[m.author ? m.author : m.from].banned) {
        return m.reply(mess.bannedMessage);
      } else {
        findCommand(msg);
      }
    }

  //No prefix command
  let commandTypes = {
   '>': async (msg, m) => {
    // Evaluate argument
   if (!msg.isOwner) return;
    try {
     const result = await eval(`(async () => { return ${msg.value} })()`);
     console.log(result);
     m.reply(util.format(result));
    } catch (e) {
     const err = syntaxerror(msg.value, "EvalError", {
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
      sourceType: "module"
     });
     let erTxt = `${err ? `${err}\n\n`: ""}${util.format(e)}`
     m.reply(erTxt);
    }
   },
   '$': (msg, m) => {
    // Execute shell command
    if (!msg.isOwner) return;
    try {
     cp.exec(msg.args.join(" "), function (err, stdout) {
      if (err) m.reply(util.format(err.toString().replace(/\x1b\[[0-9;]*m/g, "")));
      if (stdout) m.reply(util.format(stdout.toString().replace(/\x1b\[[0-9;]*m/g, "")));
     });
    } catch (e) {
     console.warn(e);
    }
   }
  }
  const messageType = msg.command;
  const commandHandler = commandTypes[messageType];
  if (commandHandler) {
   commandHandler(msg, m);
  }

 } catch (e) {
  console.warn(e);
 }
});