'use strict';

import * as util from './my_util.js'
//import * as GDoc from 'google-spreadsheet';
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
        this.#botConfig();
    }

    async #botConfig() {
        this.#bot = new TelegramBot(this.#token, { polling: true })

        this.#bot.on('polling_error', (error) => {
            console.log(`Pulling Err: ${error.message.substring(0, 100)}...`); // => 'EFATAL'
        });
        this.#bot.on('message', (x) => {
            this.#bot.sendMessage(x.from.id, 'این بات پاسخگو به درخواستی نمی‌باشد.\n باتشکر').catch(x => this.handleSentErro(x));
        });
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
     * @returns false if nothing happend, true if something happend
     */
    async SendHBD() {
        try {
            this.#gDocument = await this.#GetGoogleDoc();

            let photo = await this.#getBirthDayPhoto();
            let was_sent = await this.#wasTodaySent();
            if (was_sent) return false;

            this.#getOnlineBirthdays().then(u => {
                let celbrated = ""
                u.forEach(r => {
                    if(util.isEmpty(r.Deleted) | util.isEmpty(r.Day) | util.isEmpty(r.Month)) return;
                    if (r.Deleted.toLowerCase() == 'false') {
                        if (!util.isEmpty(r.Day) & !util.isEmpty(r.Month)) {
                            if (parseInt(r.Day) == this.#jday & parseInt(r.Month) == this.#jMonth) {
                                let sir = (r.Men == 'TRUE') ? "جناب آقای" : "سرکار خانم";
                                let happy = `${sir} ${r.FullName} ${r.UserName}
                                 زادروز تولدتان خجسته باد.
                                 باتشکر گروه انیم ورلد.
                                 ଘ(੭ˊᵕˋ)੭* ੈ✩‧₊`;

                                this.#bot.sendPhoto(this.#prvGroup, photo, { caption: happy }).catch(x => this.handleSentErro(x));

                                celbrated = `${celbrated} - [U:${r.UserName},N:${r.FullName}]`;
                            }
                        }
                    }
                })
                this.#LogSentCelebration(celbrated.substring(3));
            })
            return true;
        } catch (error) {
            this.#LogError(`Overall sent Err: ${error.message.substring(0, 100)}...`);
            return false;
        }
    }
    async #wasTodaySent() {
        let today = util.MiladiToShamdi();

        let sent = false;
        let sheet = this.#gDocument.sheetsById[946533461];
        let rows = await sheet.getRows();
        rows.forEach(r => {
            if (r.RunDate == today & !r.Error) { sent = true; return; }
        })
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
        console.log(`Specific Sent Err: ${error.message.substring(0, 100)} "..."`)
    }
}