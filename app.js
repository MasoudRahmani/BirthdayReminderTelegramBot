'use strict'

import { HappyBot } from './bot.js'
import http from 'http';
import * as schedule from 'node-schedule';

/* Heroku something*/
const server = http.createServer((rq, rs) => { rs.writeHead(200); rs.end('I am running dude.'); });
server.listen(process.env.PORT || 5000);
/**/
const TG_Token = process.env.token;
const GoogleSheetID = process.env.document
const TG_GroupId = process.env.groupId
const GoogleServiceAcc = process.env.email;
const GoogleKey = process.env.key.replace(/\\n/g, "\n")
let counter = 0


try {
    const rule = new schedule.RecurrenceRule();
    rule.hour = new schedule.Range(0, 23, 4); //every 4hour

    console.log(`First Run is at: ${rule.nextInvocationDate()}.`);

    let bot = new HappyBot(TG_Token, GoogleSheetID, GoogleServiceAcc, GoogleKey, TG_GroupId)

    let runner = schedule.scheduleJob(rule, () => {
        bot.SendHBD();
        console.log(`${++counter} - Run at: ${new Date()}.
        next run at: ${rule.nextInvocationDate()}`);
    });
} catch (error) {
    console.log(`Main Entry Err: ${error.message.substring(0, 100)}...`);
}