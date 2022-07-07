'use strict';

const TelegramBot = require('node-telegram-bot-api');
const token = ""
const testGr = -1001632481272

let b = new TelegramBot(token, { polling: true });
b.sendMessage(testGr,"test").catch( x => handleSentErro(x));


function handleSentErro(error){
    console.log(error.message)
}