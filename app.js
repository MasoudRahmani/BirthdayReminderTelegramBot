const { HappyBot } = require('./bot');
const http = require('http');

/* Heroku something*/
const server = http.createServer((rq, rs) => { rs.writeHead(200); rs.end('I am running dude.'); });
server.listen(process.env.PORT || 5000);
/**/
const token = process.env.token;
const userXcelSrc = process.env.document
const AWgroup = process.env.groupId
const testGr = -1001632481272
const client_email = process.env.email;
const private_key = process.env.key.replace(/\\n/g, "\n")

let bot = new HappyBot(token, AWgroup)

bot.run(userXcelSrc, client_email, private_key);
