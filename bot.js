'use strict';

import * as util from './my_util.js'
import TelegramBot from 'node-telegram-bot-api';
import * as fs from "fs/promises";
import { GoogleSpreadsheet } from 'google-spreadsheet';

export class HappyBot {
    #token;
    #prvGroup;
    #bot;
    #jday = util.GetShamsiDay();
    #jMonth = util.GetShamsiMonth();
    #gDocument;
    #SheetSrc;
    #gMail;
    #gKey;
    #menTxt = "جناب آقای";
    #femaleTxt = "سرکار خانم";
    #HBDText = "در روز تولدتان بهترین ها را برایتان آرزومندیم.\nامیدواریم مسیر زندگیتان سرشار از لحظات خوش باشد.\nباتشکر گروه دنیای انیمه.\nଘ(੭ˊᵕˋ)੭* ੈ✩‧₊";
    fileOptions = {
        // Explicitly specify the file name.
        filename: 'AWHappyBdPhoto',
        // Explicitly specify the MIME type.
        contentType: 'image/jpeg',
    };
    /**
     * 
     * @param {string} authentication token 
     * @param {string} Online Google SpreadSheet Src which has user birthdays on first sheet 
     * @param {string} Google Service Key Authentication Email
     * @param {string} Google Service Key Authentication Private Key
     * @param {number} ChatID - groupId to send happy birthday to (has default for test)
     */
    constructor(token, _GSheet, _Gmail, _gKey, chatID = -1001632481272) {
        this.#token = token;
        this.#prvGroup = chatID;
        this.#SheetSrc = _GSheet;
        this.#gMail = _Gmail;
        this.#gKey = _gKey;
        //this.Init();
    }

    async Init() {
        this.#bot = new TelegramBot(this.#token, { polling: true })

        this.#bot.on('polling_error', (error) => {
            console.log(`Pulling Err: ${error.message.substring(0, 100)}...`); // => 'EFATAL'
        });
        this.#bot.on('message', (x) => {
            if (x.chat.type == "private") { //Only answer to private messages
                this.#bot.sendMessage(x.from.id, `🌹🌹 🥳 بات تبریک تولد 💃🌹🌹`).catch(x => this.handleSentErro(x));

                if (x.from.id == "90886656") { //if from owner //Masoud_Rah
                    this.#HandleOwnerRq(x);
                }
            }
        });
    }
    async #HandleOwnerRq(req) {
        switch (req.text) {
            case 'Send':
                this.SendHBD().then(result => { this.#bot.sendMessage(req.from.id, `result: ${result}`); }
                ).catch(x => { this.#bot.sendMessage(req.from.id, x) });
                break;
            case 'SendFake':
                {
                    let photo = await this.#getBirthDayPhoto();
                    let sir = `${this.#menTxt} - ${this.#femaleTxt}:`;
                    let happy = `${sir}مسعود @Masoud_rah\n${this.#HBDText}`;
                    this.#bot.sendPhoto('-1001632481272', photo, { caption: happy }, this.fileOptions).catch(x => this.handleSentErro(x));
                    break;
                }
            case 'SendTest False': {
                this.#Send_HBD('-1001632481272', false).then(result => { this.#bot.sendMessage(req.from.id, `result: ${result}`); }
                ).catch(x => { this.#bot.sendMessage(req.from.id, x) });
                break;
            }
            case 'SendTest True': {
                this.#Send_HBD('-1001632481272', true).then(result => { this.#bot.sendMessage(req.from.id, `result: ${result}`); }
                ).catch(x => { this.#bot.sendMessage(req.from.id, x) });
                break;
            }
            default:
                break;
        }
    }

    async #GetGoogleDoc() {
        if (this.#gDocument) {
            return this.#gDocument;
        }
        const doc = new GoogleSpreadsheet(this.#SheetSrc);
        await doc.useServiceAccountAuth({
            client_email: this.#gMail,
            private_key: this.#gKey
        }).catch(err => { console.log(err.message.substring(0, 100)) });
        await doc.loadInfo();
        return doc;
    }
    /**
     * Get AW Birthdays and Sent Happy Birthday to users which have aged today.
     * @returns celebrated users or empty
     */
    async SendHBD() {
        return await this.#Send_HBD(this.#prvGroup, true);
    }
    /**
     * 
     * @param {*} customgrp Telegram Private Group to sent happy bd to!
     * @param {Boolean} check_if_was_sent True to check if we send happy bd today or no, if was sent we dont send anymore, False we send whether was sent or not
     * @returns result of sending which is celebrated user or "". on exception err msg is returned.
     */
    async #Send_HBD(customgrp, check_if_was_sent) {
        try {
            if (util.isEmpty(customgrp)) customgrp = this.#prvGroup;
            if (util.isEmpty(check_if_was_sent)) this.handleSentErro('check_if_was_sent is empty');

            this.#gDocument = await this.#GetGoogleDoc();

            if (check_if_was_sent) {
                let was_sent = await this.#wasTodaySent();
                if (was_sent) return "was sent";
            }
            
            let photo = await this.#getBirthDayPhoto();
            let celebrated = "";
            await this.#getOnlineBirthdays().then(async u => {
                let to_celebrate = [];
                let happybd = "";
                u.forEach(r => {
                    let sir = "";
                    if (util.isEmpty(r.Deleted) | util.isEmpty(r.Day) | util.isEmpty(r.Month)) return;
                    if (r.Deleted.toLowerCase() == 'false') {
                        if (!util.isEmpty(r.Day) & !util.isEmpty(r.Month)) {
                            if (parseInt(r.Day) == this.#jday & parseInt(r.Month) == this.#jMonth) {
                                sir = (r.Men == 'TRUE') ? "جناب آقای" : "سرکار خانم";
                                sir = `${sir} ${r.FullName} ${r.UserName}`;

                                to_celebrate.push(sir);
                                celebrated = `${celebrated} - [U:${r.UserName},N:${r.FullName}]`;
                            }
                        }
                    }
                });
                happybd = `${to_celebrate.join("\n")}\nدر روز تولدتان بهترین ها را برایتان آرزومندیم.\nامیدواریم مسیر زندگیتان سرشار از لحظات خوش باشد.\nباتشکر گروه دنیای انیمه.\nଘ(੭ˊᵕˋ)੭* ੈ✩‧₊`;
                
                await this.#bot.sendPhoto(customgrp, photo, { caption: happybd }, this.fileOptions
                ).then(x => { if (check_if_was_sent) this.#LogSentCelebration(celebrated.substring(3)); }
                ).catch(x => { this.handleSentErro(x); celebrated = x.message.substring(0, 100) });//if err we didnt celebrate then we need to sendback error result;
            });
            return celebrated;
        } catch (error) {
            this.#LogError(`Overall sent Err: ${error.message.substring(0, 100)}...`);
            return error.message.substring(0,100) + "...";
        }
    }
    async #wasTodaySent() {
        let today = util.MiladiToShamdi();

        let sent = false;
        let sheet = this.#gDocument.sheetsById[946533461];
        let rows = await sheet.getRows();

        rows.forEach(r => { if (r.RunDate == today & util.isEmpty(r.Error)) { sent = true; return; } }) //check -> Sent == FALSE -> repet log need counter and write once
        return sent;
    }
    #LogSentCelebration(celbrated) {
        let sheet = this.#gDocument.sheetsById[946533461];
        sheet.addRow({ RunDate: util.MiladiToShamdi(), Sent: (celbrated) ? 'TRUE' : 'FALSE', Sent_To: celbrated });
    }
    #LogError(eror) {
        let sheet = this.#gDocument.sheetsById[946533461];
        sheet.addRow({ RunDate: util.MiladiToShamdi(), Sent: 'FALSE', Error: eror });
    }
    #isAGroupMember(userid) {
        let result;
        let chatmember = this.#bot.getChatMember(this.#prvGroup, userid);

        if (chatmember) {
            result = chatmember.then((x) => {
                return x.status
            })
            chatmember.catch(x => {
                console.log(x);
            })
            if (result) return true
            else return false
        }
    }
    #getOnlineBirthdays = async function () {

        let sheet = this.#gDocument.sheetsById[0];
        return await sheet.getRows();
    }
    async #getBirthDayPhoto() {
        return await fs.readFile('HBD.jpg');
    }
    handleSentErro(error) {
        console.log(`Specific Sent Err: ${error.message.substring(0, 100)}...`)
    }
}