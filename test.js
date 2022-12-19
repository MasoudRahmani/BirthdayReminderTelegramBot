/* eslint-disable no-unused-vars */
'use strict';
process.env["NTBA_FIX_350"] = 1;////https://github.com/yagop/node-telegram-bot-api/issues/482
process.env["NTBA_FIX_319"] = 1;

import * as util from './utils.js';
import path from 'path';

const privateConfig = util.GetJsonObj(path.join(util.GetAppDirPath(), 'etc/hidden_config.json'));
const TG_AwHappyBdToken = privateConfig[0].TG_Token;
const AWgroup = privateConfig[0].TG_privateGroup;
const GoogleSheetID = privateConfig[0].GoogleSheetID;
const GoogleServiceAcc = privateConfig[0].GoogleServiceAcc;
const GoogleKey = privateConfig[0].GoogleKey;

const TG_UnitTestBot = privateConfig[1].TG_Token; //
const TestGroup = privateConfig[1].TG_privateGroup;



const _Tests = {
    FullAppTest: 1, //Do not run With other test. run it alone
    ScheduleTest: 2, ServerTest: 3, TelegramModuleTest: 4, GspreadSheetTest: 5,
    AnimeHandlerTest: 6, SheetHandlerTest: 7, StartBotTest: 8
};

runtest(_Tests.ServerTest);
runtest(_Tests.StartBotTest);

async function runtest(id) {
    switch (id) {
        case 1:
            FullAppTest(TG_UnitTestBot, TestGroup);
            break;
        case 2:
            ScheduleTest(() => { console.log("2--------2") });
            break;
        case 3:
            ServerTest();
            break;
        case 4:
            TelegramModuleTest(TG_UnitTestBot, TestGroup);
            break;
        case 5:
            GspreadSheetTest();
            break;
        case 6: {
            let anime_data = await AnimeHandlerTest();
            console.log(anime_data);
        }
            break;
        case 7:
            SheetHandlerTest();
            break;
        case 8:
            StartBotTest(TG_UnitTestBot);
            break;
        case 9:
            break;
        default:
            break;
    }
}


import { AwSheetHandler } from './Classes/AwGSheetHandler.js';
import { AwBdDbModel } from './Classes/AwBdDbModel.js';
function SheetHandlerTest() {
    let dbModel = new AwBdDbModel(GoogleSheetID, 0, 946533461);
    let SheetHandler = new AwSheetHandler(GoogleServiceAcc, GoogleKey, dbModel);
    return SheetHandler;
}
import { HappyBot } from './Classes/bot.js';
async function StartBotTest(token) {
    let h = SheetHandlerTest();
    let bot = new HappyBot(token, h);

    await bot.Init();
    return bot;
}

import schedule from 'node-schedule';
async function FullAppTest(token, group) {
    try {
        ServerTest();
        let counter = 0;

        let bot = await StartBotTest(token);

        const rule = new schedule.RecurrenceRule();
        rule.hour = new schedule.Range(0, 23, 2); //every x hour
        rule.minute = 0 // needed for every 

        let ran = false;
        let runner = schedule.scheduleJob(rule, () => {
            let date = new Date();
            ran = false;
            if (date.getHours() < 19 & date.getHours() > 1) { //in case server is utc, so i can send msg 5am in tehran
                bot.SendHBD(group);
                ran = true;
            }
            console.log(`${date.toUTCString()} - ${++counter}. SendHBD Called: '${ran}'.\n` + `\t next run at: ${rule.nextInvocationDate().toUTCString()}`);
            util.LogToPublic(`${++counter}. SendHBD Called: '${ran}'.\n` + `\t next run at: ${rule.nextInvocationDate().toUTCString()}`);
        });

        console.log(`0 - First Run at: ${runner.nextInvocation().toUTCString()}`); util.LogToPublic(`0 - First Run at: ${runner.nextInvocation().toUTCString()}`);
    }
    catch (err) { console.log(`Main Entry Err: ${util.ShortError(err, 200)}`); util.LogToPublic(`Main Entry Err: ${util.ShortError(err, 200)}`); }
}
/**
 * @param {function} delegate give me somting to do while running
 */
function ScheduleTest(delegate) {

    try {
        let counter = 0

        const rule = new schedule.RecurrenceRule();
        rule.second = new schedule.Range(0, 60, 5); //every second
        //rule.minute = 0 // needed for every 

        let ran = false;
        let runner = schedule.scheduleJob(rule, () => {
            let date = new Date();
            ran = false;
            if (date.getHours() < 19 & date.getHours() > 1) { //in case server is utc, so i can send msg 5am in tehran
                delegate();
                ran = true;
            }
            console.log(
                `${date.toUTCString()} - ${++counter}. SendHBD Called: '${ran}'.\n` +
                `\t next run at: ${rule.nextInvocationDate().toUTCString()}`
            );
        });
        console.log(`0 - First Run at: ${runner.nextInvocation().toUTCString()}`);

    } catch (err) {
        console.log(`Main Entry Err: ${util.ShortError(err, 200)}`);
    }
}

import http from 'http';
import serveStatic from 'serve-static';
import finalhandler from 'finalhandler';
import { existsSync } from 'fs';
function ServerTest() {
    let htmlindex = `./public_log/index.html`;

    if (!existsSync(htmlindex)) {
        util.ResetPublicLog_HTML();
    }
    var h = util.GetAppDirPath();

    let publicPath = path.join(h, './public_log/');

    var serve = serveStatic(publicPath, { index: ['index.html', 'index.htm'] })

    const server = http.createServer((rq, rs) => {
        serve(rq, rs, finalhandler(rq, rs));
    });
    server.listen(process.env.PORT || 5000);
}

import TelegramBot from 'node-telegram-bot-api';
function TelegramModuleTest(t, g) {
    let b = new TelegramBot(t, { polling: true });
    b.sendMessage(g, "test").catch(x => handleSentErro(x));


    function handleSentErro(error) {
        console.log(error.message)
    }
}

import { GoogleSpreadsheet } from 'google-spreadsheet';
async function GspreadSheetTest() {
    const doc = new GoogleSpreadsheet(GoogleSheetID);

    await doc.useServiceAccountAuth({
        client_email: GoogleServiceAcc,
        private_key: GoogleKey
    });
    await doc.loadInfo();
    let sheet = doc.sheetsById[946533461];
}

import { AnimeHandler } from './Classes/AnimeHandler.js';
async function AnimeHandlerTest() {
    var ah = new AnimeHandler();
    let f = await ah.RandomAnime();
    return f;
}
