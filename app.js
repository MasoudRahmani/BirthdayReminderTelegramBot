/* eslint-disable no-undef */
'use strict'

process.env["NTBA_FIX_350"] = 1; //https://github.com/yagop/node-telegram-bot-api/issues/482
process.env["NTBA_FIX_319"] = 1; //

import { HappyBot } from './bot.js'
import http from 'http';
import * as schedule from 'node-schedule';

const TG_Token = process.env.token;
const GoogleSheetID = process.env.document
const TG_GroupId = "-1001224485894";//process.env.groupId
const GoogleServiceAcc = process.env.email;
const GoogleKey = process.env.key.replace(/\\n/g, "\n")

/* Heroku something*/
const server = http.createServer((rq, rs) => { rs.writeHead(200); rs.end('I am running dude.'); });
server.listen(process.env.PORT || 5000);
/**/

Main();

async function Main() {

    try {
        let counter = 0
        let bot = new HappyBot(TG_Token, GoogleSheetID, GoogleServiceAcc, GoogleKey, TG_GroupId);

        await bot.Init();

        const rule = new schedule.RecurrenceRule();
        rule.hour = new schedule.Range(0, 23, 2); //every 1hour
        rule.minute = 0 // needed for every 

        let runner = schedule.scheduleJob(rule, () => {
            let date = new Date();
            if (date.getHours() < 22 & date.getHours() > 4) {
                console.log(`${++counter} - Run at: ${date}.\n\t next run at: ${rule.nextInvocationDate()}`);

                bot.SendHBD();
            }
        });
        console.log(`0 - First run at: ${runner.nextInvocation()}`);

    } catch (error) {
        console.log(`Main Entry Err: ${error.message.substring(0, 100)}...`);
    }
}