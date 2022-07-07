const { HappyBot } = require('./bot');
const http = require('http');
const schedule = require('node-schedule');

/* Heroku something*/
const server = http.createServer((rq, rs) => { rs.writeHead(200); rs.end('I am running dude.'); });
server.listen(process.env.PORT || 5000);
/**/
const token = process.env.token;
const userXcelSrc = process.env.document
const AWgroup = process.env.groupId
const client_email = process.env.email;
const private_key = process.env.key.replace(/\\n/g, "\n")


let counter = 0
const rule = new schedule.RecurrenceRule();
rule.hour = 11; //new schedule.Range(0,23,2); //every 2hour
rule.minute = 30;

console.log(["First Run is at:", rule.nextInvocationDate()].join(" "));

let runner = schedule.scheduleJob(rule, () => {
    let bot = new HappyBot(token, AWgroup)
    bot.run(userXcelSrc, client_email, private_key);
    console.log([++counter, "-", "Run at:", new Date()].join(" "));
});