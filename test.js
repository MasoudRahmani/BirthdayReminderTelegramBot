'use strict';

import TelegramBot from 'node-telegram-bot-api';
import { HappyBot } from './bot.js';
import schedule from 'node-schedule';
import * as util from './my_util.js'
import { GoogleSpreadsheet } from 'google-spreadsheet';
import fs from 'fs/promises'

class booba {
    b(f) {
        this._f = f;
        t
    }
    async get() {
        return await fs.readFile('HBD.jpg');
    }
}

const TG_Token = ""
const GoogleSheetID = ""
const GoogleServiceAcc = ""
const GoogleKey = ""

Main();
//just_tg();
//google();


async function Main() {

    try {
        let counter = 0
        let bot = new HappyBot(TG_Token, GoogleSheetID, GoogleServiceAcc, GoogleKey);

        await bot.Init();


        const rule = new schedule.RecurrenceRule();
       // rule.hour = new schedule.Range(0, 23, 1); //every 1hour
       // rule.minute = 0 // needed for every 
       rule.second = new schedule.Range(0,59,20);
       
       console.log(`First run is at: ${rule.nextInvocationDate()}`);

        let runner = schedule.scheduleJob(rule, () => {
            let date = new Date();
            console.log(`${++counter} - Run at: ${date}.
        next run at: ${rule.nextInvocationDate()}`);
            bot.SendHBD();
        });
        console.log(`First run is at: ${runner.nextInvocation()}`);
        
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
    const doc = new GoogleSpreadsheet(GoogleSheetID);

    await doc.useServiceAccountAuth({
        client_email: GoogleServiceAcc,
        private_key: GoogleKey
    });
    await doc.loadInfo();
    let sheet = doc.sheetsById[946533461];
}
//let Yesterday = util.MiladiToShamdiConvertor(new Date(Date.now() - 86400000))

let _b = new booba('test');
(async function () { /* Top level Async */
    // _p = await _b.get();
    // console.log(_p.length);
    // let _p;
}());