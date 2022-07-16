'use strict';

// import * as TelegramBot from 'node-telegram-bot-api';
import { HappyBot } from './bot.js';
import schedule from 'node-schedule';
import * as util from './my_util.js'
import { GoogleSpreadsheet } from 'google-spreadsheet';

import tgresolve from 'tg-resolve'

// const TG_Token = ""
// const GoogleSheetID = ""
// //const AWgroup = "-1001224485894"
// const GoogleServiceAcc = ""
// const GoogleKey = ""

//let Yesterday = util.MiladiToShamdiConvertor(new Date(Date.now() - 86400000))
//console.log(`🌹🌹 🥳 بات تبریک تولد 💃🌹🌹`);

app();
//just_tg();
//resolver();
//google();
function app() {
    let counter = 0
    try {
        let bot = new HappyBot(TG_Token, GoogleSheetID, GoogleServiceAcc, GoogleKey)

        const rule = new schedule.RecurrenceRule();
        // rule.hour = new schedule.Range(0, 23, 2); //every 4hour
        // rule.minute = 0 // needed for every 
        // rule.tz = "Asia/Tehran"
        rule.second = new schedule.Range(0, 59, 4);

        console.log(`First run is at: ${rule.nextInvocationDate()}`);
        let date = new Date();
       // let runner = schedule.scheduleJob(rule, () => {

            date.setHours(date.getHours() + 1);
            console.log(`${++counter} - Run at: ${date}.
            next run at: ${rule.nextInvocationDate()}`);
            console.log(date.getHours());
            if (date.getHours() > 3 & date.getHours() < 20) {
                bot.SendHBD();
                console.log('yes');
            }
       // });
    } catch (error) {
        console.log(`Main Entry Err: ${error.message.substring(0, 100)}...`);
    }

}

function just_tg() {
    let b = new TelegramBot(token, { polling: true });
    b.sendMessage(testGr, "test").catch(x => handleSentErro(x));


    function handleSentErro(error) {
        console.log(error.message)
    }
}
async function google() {
    const doc = new GDoc.GoogleSpreadsheet(userXcelSrc);

    await doc.useServiceAccountAuth({
        client_email: client_email,
        private_key: private_key
    });
    await doc.loadInfo();
    let sheet = doc.sheetsById[946533461];
}

function resolver() {
    // using the 'bare' function

    // tgres(token, "@Masoud_rah", function (error, result) {
    //     console.log(result.id);
    // });

    // you can create a client (referred to as 'resolver')
    // that you can repeatedly use
    const resolver = new tgresolve.Tgresolve(token);

    // using the 'resolver'
    resolver.tgresolve("@Masoud_rah", function (error, result) {
        console.log(result.id);
    });
}