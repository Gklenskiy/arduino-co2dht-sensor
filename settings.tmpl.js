const path = require('path')

module.exports.tempConnString = path.join(__dirname, 'db', 'YOUR_TEMP_DATABASE_FILE_NAME');
module.exports.chatsConnString = path.join(__dirname, 'db', 'YOUR_CHAT_DATABASE_FILE_NAME');
module.exports.botToken = "YOUR_TELEGRAM_BOT_TOKEN";
module.exports.sitePort = "YOUR_PORT";