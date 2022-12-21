/* eslint-disable no-undef */
'use strict'

process.env["NTBA_FIX_350"] = 1; //https://github.com/yagop/node-telegram-bot-api/issues/482
process.env["NTBA_FIX_319"] = 1; //

import { HappyBot } from './Classes/bot.js'
import http from 'http';
import serveStatic from 'serve-static';
import finalhandler from 'finalhandler';
import * as schedule from 'node-schedule';
import { LogToPublic, ResetPublicLog_HTML, ShortError } from './utils.js';
import { AwSheetHandler } from './Classes/AwGSheetHandler.js';
import { AwBdDbModel } from './Classes/AwBdDbModel.js';
import { existsSync } from 'fs';

const TG_Token = process.env.token;
const GoogleSheetID = process.env.document;
const TG_GroupId = "-1001224485894";//process.env.groupId
const GoogleServiceAcc = process.env.email;
const GoogleKey = process.env.key.replace(/\\n/g, "\n")


let publicPath = `./public_log/`;
let htmlindex = `./public_log/index.html`;

if (!existsSync(htmlindex)) { //create indext based on template.
    ResetPublicLog_HTML();
}

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
        let dbModel = new AwBdDbModel(GoogleSheetID, 0, 946533461);
        let SheetHandler = new AwSheetHandler(GoogleServiceAcc, GoogleKey, dbModel);

        let bot = new HappyBot(TG_Token, SheetHandler);
        await bot.Init();

        const rule = new schedule.RecurrenceRule();
        rule.hour = new schedule.Range(0, 23, 2); //every x hour
        rule.minute = 0 // needed for every 

        let ran = false;
        /*let runner =*/ schedule.scheduleJob(rule, () => {
            let date = new Date();
            ran = false;
            if (date.getHours() < 19 & date.getHours() > 1) { //in case server is utc, so i can send msg 5am in tehran
                bot.SendHBD(TG_GroupId);
                ran = true;
            }
            console.log(
                `${++counter}. SendHBD Called: '${ran}' at (${date.toUTCString()}).\n` +
                `\t Next run at: (${rule.nextInvocationDate().toUTCString()})`
            );
            LogToPublic(`${counter}. SendHBD Called: '${ran}' at (${date.toUTCString()}).\n` +
                `\t Next run at: (${rule.nextInvocationDate().toUTCString()})`);
        });
        console.log(`0 - First Run at: (${rule.nextInvocationDate().toUTCString()})`);
        LogToPublic(`0 - First Run at: (${rule.nextInvocationDate().toUTCString()})`);

    } catch (err) {
        console.log(`Main Entry Err: ${ShortError(err, 200)}`);
        LogToPublic(`Main Entry Err: ${ShortError(err, 200)}`);
    }
}