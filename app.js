const { HappyBot } = require('./bot');

const token = process.env.token;
const userXcelSrc = process.env.document
const AWgroup = process.env.groupId
const testGr = -1001632481272
const client_email = process.env.email;
const private_key = process.env.key.replace(/\\n/g, "\n")

let bot = new HappyBot(token, AWgroup)

bot.run(userXcelSrc, client_email, private_key);