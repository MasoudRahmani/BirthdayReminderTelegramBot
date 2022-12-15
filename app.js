/* eslint-disable no-undef */
'use strict'

process.env["NTBA_FIX_350"] = 1; //https://github.com/yagop/node-telegram-bot-api/issues/482
process.env["NTBA_FIX_319"] = 1; //

import { HappyBot } from './Classes/bot.js'
import http from 'http';
import serveStatic from 'serve-static';
import finalhandler from 'finalhandler';
import * as schedule from 'node-schedule';
import { LogToPublic, ShortError } from './my_util.js'

const TG_Token = process.env.token;
const GoogleSheetID = process.env.document
const TG_GroupId = "-1001224485894";//process.env.groupId
const GoogleServiceAcc = process.env.email;
const GoogleKey = process.env.key.replace(/\\n/g, "\n")


let publicPath = `./public_log/`;

var serve = serveStatic(publicPath, { index: ['index.html', 'index.htm'] })

const server = http.createServer((rq, rs) => {
    serve(rq, rs, finalhandler(rq, rs));
});
server.listen(process.env.PORT || 5000);
/**/

Main();


async function Main() {

    try {
        let counter = 0
        let bot = new HappyBot(TG_Token, GoogleSheetID, GoogleServiceAcc, GoogleKey, TG_GroupId);

        await bot.Init();

        const rule = new schedule.RecurrenceRule();
        rule.hour = new schedule.Range(0, 23, 2); //every x hour
        rule.minute = 0 // needed for every 

        let ran = false;
        let runner = schedule.scheduleJob(rule, () => {
            let date = new Date();
            ran = false;
            if (date.getHours() < 19 & date.getHours() > 1) { //in case server is utc, so i can send msg 5am in tehran
                bot.SendHBD();
                ran = true;
            }
            console.log(
                `${date.toLocaleString("fa-IR-u-nu-latn")} ${++counter} - SendHBD Called: '${ran}'.\n` +
                `\t next run at: ${rule.nextInvocationDate().toLocaleString("fa-IR-u-nu-latn")}`
            );
            LogToPublic(`${++counter} - SendHBD Called: '${ran}'.\n` +
                `\t next run at: ${rule.nextInvocationDate().toLocaleString("fa-IR-u-nu-latn")}`);
        });
        console.log(`0 - First Run at: ${runner.nextInvocation()}`);
        LogToPublic(`0 - First Run at: ${runner.nextInvocation()}`);

    } catch (err) {
        console.log(`Main Entry Err: ${ShortError(err, 200)}`);
        LogToPublic(`Main Entry Err: ${ShortError(err, 200)}`);
    }
}