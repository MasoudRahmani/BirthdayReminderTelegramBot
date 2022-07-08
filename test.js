'use strict';

// import * as TelegramBot from 'node-telegram-bot-api';
import { HappyBot } from './bot.js';
import schedule from 'node-schedule';
import * as util from './my_util.js'
import { GoogleSpreadsheet } from 'google-spreadsheet';

import tgresolve from 'tg-resolve'

const token = ""
const userXcelSrc = ""
//const AWgroup = "-1001224485894"
const client_email = ""
const private_key = ""

//let Yesterday = util.MiladiToShamdiConvertor(new Date(Date.now() - 86400000))
const rule = new schedule.RecurrenceRule();
rule.hour = new schedule.Range(0, 23, 2); //every 4hour
rule.minute = 0 // needed for every 
rule.tz = "Asia/Tehran"

 console.log(rule.nextInvocationDate());
 console.log(rule.nextInvocationDate(rule.nextInvocationDate()));
//app();
//just_tg();
//resolver();
//google();
function app() {
    let counter = 0
    const rule = new schedule.RecurrenceRule();
    rule.minute = new schedule.Range(0, 59, 1); //every 10 sec

    console.log(["First Run is at:", rule.nextInvocationDate()].join(" "));

    let bot = new HappyBot(token, userXcelSrc, client_email, private_key)


    let runner = schedule.scheduleJob(rule, () => {
    bot.SendHBD();
    console.log(`${++counter} - Run at: ${new Date()}.
      next run at: ${rule.nextInvocationDate()}`);
    });

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