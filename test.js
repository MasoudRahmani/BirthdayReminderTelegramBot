'use strict';

const TelegramBot = require('node-telegram-bot-api');


const { HappyBot } = require('./bot');
const schedule = require('node-schedule');

const token = ""
const userXcelSrc = ""
const testGr = "-1001632481272"
const client_email = ""
const private_key = ""


app();
//just_tg();

function app() {
    let counter = 0
    const rule = new schedule.RecurrenceRule();
    rule.second = new schedule.Range(0, 59, 10); //every 1 minute;

    console.log(["First Run is at:", rule.nextInvocationDate()].join(" "));

    let bot = new HappyBot(token, testGr, userXcelSrc, client_email, private_key)

    let runner = schedule.scheduleJob(rule, () => {
        bot.SendHBD();
        console.log([++counter, "-", "Run at:", new Date()].join(" "));
    });

}

function just_tg() {
    let b = new TelegramBot(token, { polling: true });
    b.sendMessage(testGr, "test").catch(x => handleSentErro(x));


    function handleSentErro(error) {
        console.log(error.message)
    }
}