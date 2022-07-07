'use strict';
const TelegramBot = require('node-telegram-bot-api');
const { GetShamsiDay, GetShamsiMonth, MiladiToShamdiConvertor } = require('./util');
const { GoogleSpreadsheet } = require('google-spreadsheet');

class HappyBot {
    #token;
    #prvGroup;
    #bot;
    #jday = GetShamsiDay(new Date());
    #jMonth = GetShamsiMonth(new Date());
    #gDocument
    /**
     * 
     * @param {string} authentication token 
     * @param {Integer} groupId to send happy birthday to 
     */
    constructor(token, groupToNotify) {
        this.#token = token;
        this.#prvGroup = groupToNotify;
        this.#bot = new TelegramBot(this.#token, { polling: true });
        this.#botConfig();
    }

    #botConfig() {
        this.#bot.on('polling_error', (error) => {
            console.log(["Pulling Err:", error.message.substring(0, 100), "..."].join(" ")); // => 'EFATAL'
        });
        this.#bot.on('message', (x) => {
            this.#bot.sendMessage(x.from.id, 'این بات پاسخگو به درخواستی نمی‌باشد.\n باتشکر').catch(x => this.handleSentErro(x));
        });

    }

    #init = async function (sheetSrc, email, key) {
        const doc = new GoogleSpreadsheet(sheetSrc);
        await doc.useServiceAccountAuth({
            client_email: email,
            private_key: key
        });
        await doc.loadInfo();
        return doc;
    }
    /**
    * @patam {String} Online Google SpreadSheet Src which has user birthdays on first sheet 
    * @patam {String} Google Service Key Authentication Email
    * @patam {String} Google Service Key Authentication Private Key
    */
    async run(sheetSrc, gEmail, gPrvKey) {
        this.#gDocument = await this.#init(sheetSrc, gEmail, gPrvKey);
        let photo = await this.#getBirthDayPhoto();
        let was_sent = await this.#wasTodaySent();
        if (was_sent) return;

        try {
            this.#getOnlineBirthdays().then(u => {
                let celbrated = ""
                u.forEach(r => {
                    if (r.Deleted.toLowerCase() == 'false') {
                        if (r.Day & r.Month) {
                            if (parseInt(r.Day) == this.#jday & parseInt(r.Month) == this.#jMonth) {
                                let sir = (r.Men == 'TRUE') ? "جناب آقای" : "سرکار خانم ";
                                let happy = [sir, r.FullName, r.UserName, "\n", "زادروز تولدتان خجسته باد.", "\n", "باتشکر گروه انیم ورلد."].join(" ");
                                this.#bot.sendPhoto(this.#prvGroup, photo, { caption: happy }).catch(x => this.handleSentErro(x));

                                celbrated = celbrated + r.UserName + " - "
                            }
                        }
                    }
                })
                this.#LogSentCelebration(celbrated);
            })
        } catch (error) {
            this.#LogError(["Overall sent Err:", error.message.substring(0, 100), "..."].join(" "))
        }
    }
    async #wasTodaySent() {
        let today = MiladiToShamdiConvertor(new Date());
        let sent = false;
        let sheet = this.#gDocument.sheetsById[946533461];
        let rows = await sheet.getRows();
        rows.forEach(r => {
            if (r.RunDate == today & r.Sent == 'TRUE') { sent = true; return; }
        })
        return sent;
    }
    #LogSentCelebration(celbrated) {
        let sheet = this.#gDocument.sheetsById[946533461];
        sheet.addRow({ RunDate: MiladiToShamdiConvertor(new Date()), Sent: (celbrated) ? 'TRUE' : 'FALSE', Sent_To: celbrated });
    }
    #LogError(eror) {
        let sheet = this.#gDocument.sheetsById[946533461];
        sheet.addRow({ RunDate: MiladiToShamdiConvertor(new Date()), Sent: 'FALSE', Error: eror });
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
        let sheet = (await this.#gDocument).sheetsById[0];
        return await sheet.getRows();
    }
    async #getBirthDayPhoto() {
        const fs = require('fs').promises;
        return await fs.readFile('HBD.jpg');
    }
    handleSentErro(error) {
        console.log(["Specific Sent Err:", error.message.substring(0, 100), "..."].join(" "))
    }
}
module.exports = { HappyBot }