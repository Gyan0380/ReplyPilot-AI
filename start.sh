#!/bin/bash
echo "Starting your WhatsApp Bot..."
# Agar dependencies install nahi hain toh install kar lega
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
# PM2 se bot ko background mein run karega taaki terminal band hone par bhi na ruke
if ! command -v pm2 &> /dev/null
then
    echo "Installing PM2..."
    npm install -g pm2
fi
pm2 restart bot.js || pm2 start bot.js --name "whatsapp-bot"
echo "✅ Bot is now online and running in background!"
