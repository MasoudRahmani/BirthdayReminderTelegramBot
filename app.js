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
    let bot = new HappyBot(TG_Token, GoogleSheetID, GoogleServiceAcc, GoogleKey, TG_GroupId)

    const rule = new schedule.RecurrenceRule();
    rule.hour = new schedule.Range(0, 23, 1); //every 1hour
    rule.minute = 0 // needed for every 


    console.log(`First run is at: ${rule.nextInvocationDate()}`);

    let runner = schedule.scheduleJob(rule, () => {
        let date = new Date();
        console.log(`${++counter} - Run at: ${date}.
        next run at: ${rule.nextInvocationDate()}`);
            bot.SendHBD();
    });
} catch (error) {
    console.log(`Main Entry Err: ${error.message.substring(0, 100)}...`);
}