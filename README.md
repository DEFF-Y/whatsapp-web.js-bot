

# WhatsApp-Web.js Bot

![Node.js](https://img.shields.io/badge/Node.js-v14.16.1-green)

![whatsapp-web.js](https://img.shields.io/badge/whatsapp--web.js-v1.13.8-blue)

![License](https://img.shields.io/badge/license-MIT-yellow)

This is a Node.js ESM-based WhatsApp bot using the `whatsapp-web.js` library.

## Table of Contents

- [Information](#information)

- [Installation](#installation)

- [Contributing](#contributing)

## Information

Please note that this script is not intended for use on Android/Termux. It is recommended to use Ubuntu (VPS)/Windows(RDP) or panels that support Puppeter.

## Installation

### Ubuntu

```bash

# Update and upgrade system packages

sudo apt update && sudo apt upgrade

# Install Node.js

sudo apt install nodejs

# Install Google Chrome Stable version

wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

sudo dpkg -i google-chrome-stable_current_amd64.deb

# Clone the repository

git clone https://github.com/your-username/whatsapp-web.js-bot.git

# Navigate to the cloned directory

cd whatsapp-web.js-bot

# Install dependencies

npm install

# Install pm2 globally

npm install pm2 -g

# Start the bot with pm2

pm2 start index.js --name bot

# View logs

pm2 log```bash

## contributing

### Special thanks to:

Fatur

Dika Ardnt

Amirul

Ivanzz

Filham

whatsapp-web.js

If you would like to contribute to this project, feel free to fork the repository and submit a pull request.
