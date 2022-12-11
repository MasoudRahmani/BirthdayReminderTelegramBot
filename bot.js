'use strict';

import * as util from './my_util.js'
import TelegramBot from 'node-telegram-bot-api';
import * as fs from "fs/promises";
import { GoogleSpreadsheet } from 'google-spreadsheet';
import mime from 'mime-types';
import fetch from 'node-fetch';
import { htmlToText } from 'html-to-text';

//https://core.telegram.org/bots/api#formatting-options
export class HappyBot {
    #bot_server = "https://awhappybd.fly.dev/";
    #randomAnimeApi = "https://api.consumet.org/meta/anilist/random-anime";
    #malUrl = "https://myanimelist.net/anime/";
    #commands = { send: 'send', fake: 'send fake', test_No_check: 'sendtest false', test_check: 'sendtest true', anime: 'anime', cmd: 'commands', resetPublicHtml: 'reset public' };
    #TestGroup = "-1001632481272";
    #token;
    #prvGroup;
    #SheetSrc;
    #gMail;
    #gKey;
    #bot;
    #gDocument;
    #menTxt = "جناب آقای";
    #femaleTxt = "سرکار خانم";
    #HBDText = "در روز تولدتان بهترین ها را برایتان آرزومندیم.\nامیدواریم مسیر زندگیتان سرشار از لحظات خوش باشد.\nباتشکر گروه دنیای انیمه.\nଘ(੭ˊᵕˋ)੭* ੈ✩‧₊";
    fileOptions = {
        // Explicitly specify the file name.
        filename: 'AWHappyBdPhoto',
        // Explicitly specify the MIME type.
        contentType: 'image/jpeg'
    };
    /**
     * 
     * @param {string} authentication token 
     * @param {string} Online Google SpreadSheet Src which has user birthdays on first sheet 
     * @param {string} Google Service Key Authentication Email
     * @param {string} Google Service Key Authentication Private Key
     * @param {number} ChatID - groupId to send happy birthday to (has default for test)
     */
    constructor(token, _GSheet, _Gmail, _gKey, chatID = null) {
        if (util.isEmpty(token) ||
            util.isEmpty(_GSheet) ||
            util.isEmpty(_gKey) ||
            util.isEmpty(_Gmail) ||
            chatID == '') {
            console.log('Bot arg is wrong.');
            throw 'Wrong Args';
        }
        this.#token = token;
        this.#prvGroup = (chatID) ? chatID : this.#TestGroup;
        this.#SheetSrc = _GSheet;
        this.#gMail = _Gmail;
        this.#gKey = _gKey;
    }

    async Init() {
        this.#bot = new TelegramBot(this.#token, { polling: true })
        this.#bot.on('polling_error', (error) => {
            util.LogToPublic(`Pulling Err: ${error.message.substring(0, 100)}...`);
            console.log(`Pulling Err: ${error.message.substring(0, 100)}...`); // => 'EFATAL'
        });
        this.#bot.on('message', (req) => {
            if (req.chat.type == "private") { //Only answer to private messages

                if (req.from.id == "90886656" || req.from.id == "76195398") { //if from owner //Masoud_Rah //hamedf
                    let iscommand = Object.values(this.#commands).includes(req.text.toLowerCase());

                    if (iscommand == false) {
                        this.#bot.sendMessage(req.from.id,
                            `🌸 *مدیر* گرامی خوش آمدید\\.\n` +
                            `    با اجرای دستور \`commands\` میتواند از کامندهای در دسترس مطلع شوید\\.🍀`,
                            { parse_mode: 'MarkdownV2' }).catch(x => {
                                console.log(x.message);
                                util.LogToPublic(x.message)
                            });
                    } else
                        this.#HandleOwnerRq(req);
                }
                else {
                    this.#bot.sendMessage(req.from.id, `🌹 🥳 بات تبریک تولد 💃🌹`).catch(x => { util.LogToPublic(x.message.substring(0, 100)) });
                    this.#SendRandomAnime(req.from.id);
                }
            }
        });
    }
    async #HandleOwnerRq(req) {

        switch (req.text.toLowerCase()) {
            case this.#commands.send: {
                this.SendHBD().then(result => { this.#bot.sendMessage(req.from.id, `result: ${result}`); }
                ).catch(x => { this.#bot.sendMessage(req.from.id, x) });
                break;
            }
            case this.#commands.fake: {
                let photo = await this.#GetBirthDayPhoto();
                let sir = `${this.#menTxt} - ${this.#femaleTxt}:`;
                let happy = `${sir} @Masoud_rah\n${this.#HBDText}`;
                this.#bot.sendPhoto(this.#TestGroup, photo, { caption: happy, parse_mode: '' }, this.fileOptions
                ).then(result => { this.#bot.sendMessage(req.from.id, `result: ${(result) ? true : false}`); } //make result readable
                ).catch(x => { this.#bot.sendMessage(req.from.id, x) });
                break;
            }
            case this.#commands.test_No_check: {

                this.#Send_HBD(this.#TestGroup, false).then(result => { this.#bot.sendMessage(req.from.id, `result: ${result}`); }
                ).catch(x => { this.#bot.sendMessage(req.from.id, x) });
                break;
            }
            case this.#commands.test_check: {
                this.#Send_HBD(this.#TestGroup, true).then(result => { this.#bot.sendMessage(req.from.id, `result: ${result}`); }
                ).catch(x => { this.#bot.sendMessage(req.from.id, x) });
                break;
            }
            case this.#commands.cmd: {
                this.#bot.sendMessage(req.from.id,
                    `🧑‍💻* فرمان‌ها* با حروف کوچک:\n` +
                    `1\\. \`${this.#commands.send}\` :    اجبار بات به ارسال سریع دوباره\n` +
                    `2\\. \`${this.#commands.fake}\` :    ارسال یک پیام بی محتوا بدون هیچ بررسی به گروه تست\\. فقط جهت بررسی سلامت عملکرد\n` +
                    `3\\. \`${this.#commands.test_No_check}\` :    تست ارسال، بدون بررسی موارد ارسال شده ی امروز به گروه تست\n` +
                    `4\\. \`${this.#commands.test_check}\` :    تست ارسال: با بررسی ارسال شده های امروز\n` +
                    `5\\. \`${this.#commands.anime}\` :    انیمه شانسی😈❤️\n` +
                    `6\\. \`${this.#commands.resetPublicHtml}\` :    ریست کردن لاگ عمومی در آدرس سرور\n\n\n` +
                    `Bot is running at: [Bot Server سرور](${this.#bot_server})`,
                    { parse_mode: 'MarkdownV2' }
                )
                break;
            }
            case this.#commands.anime: {
                this.#SendRandomAnime(req.from.id);
                break;
            }
            case this.#commands.resetPublicHtml: {
                util.ResetPublicLog_HTML();
                this.#bot.sendMessage(req.from.id, 'request recieved. Check site.');
                break;
            }
            default:
                break;
        }
    }
    /**
     * Get AW Birthdays and Sent Happy Birthday to users which have aged today.
     * @returns celebrated users or empty
     */
    async SendHBD() {
        return await this.#Send_HBD(this.#prvGroup, true);
    }
    /**
     * @param {*} customgrp Telegram Private Group to sent happy bd to!
     * @param {Boolean} check_if_was_sent True to check if we send happy bd today or no, if was sent we dont send anymore, False we send whether was sent or not
     * @returns result of sending which is celebrated user or "". on exception err msg is returned.
     */
    async #Send_HBD(customgrp, check_if_was_sent) {
        try {
            if (util.isEmpty(customgrp)) customgrp = this.#prvGroup;
            //if (util.isEmpty(check_if_was_sent)) util.LogToPublic("Send_HBD - check_if_was_sent is empty");

            this.#gDocument = await this.#GetGoogleDoc();
            let ir_D = util.GetShamsiDay();
            let ir_M = util.GetShamsiMonth();

            if (check_if_was_sent) {
                let was_sent = await this.#WasTodaySent();
                if (was_sent) return "Was sent.";
            }

            let photo = await this.#GetBirthDayPhoto();
            let celebrated = "";
            await this.#GetOnlineBirthdays().then(async u => {
                let to_celebrate = [];
                let happybd = "";
                u.forEach(r => {
                    let sir = "";
                    if (util.isEmpty(r.Deleted) | util.isEmpty(r.Day) | util.isEmpty(r.Month)) return;
                    if (r.Deleted.toLowerCase() == 'false') {
                        if (!util.isEmpty(r.Day) & !util.isEmpty(r.Month)) {
                            if (parseInt(r.Day) == ir_D & parseInt(r.Month) == ir_M) {
                                sir = (r.Men == 'TRUE') ? this.#menTxt : this.#femaleTxt;
                                sir = `${sir} ${r.FullName} ${r.UserName}`;

                                to_celebrate.push(sir);
                                celebrated = `${celebrated} - [U:${r.UserName},N:${r.FullName}]`;
                            }
                        }
                    }
                });
                if (util.isEmpty(celebrated) == false) {
                    happybd = `${to_celebrate.join("\n")}\n${this.#HBDText}`;

                    await this.#bot.sendPhoto(customgrp, photo, { caption: happybd }, this.fileOptions
                    ).then((/*x*/) => { if (check_if_was_sent) this.#LogToXL(celebrated.substring(3)); }
                    ).catch(x => { this.#LogToXL('', x.message); celebrated = x.message.substring(0, 100) });//if err we didnt celebrate then we need to sendback error result;
                } else {
                    //this.#LogToXL(celebrated);// log today we had no one -> too many log. just the fact that there was no error and log says nothing happend.
                }
            });
            return celebrated;
        } catch (error) {
            this.#LogToXL('', `Overall sent Err: ${(!util.isEmpty(error)) ? error.message.substring(0, 100) : ''}...`);
            return ((!util.isEmpty(error)) ? error.message.substring(0, 100) : '') + "...";
        }
    }
    //----------------- <Google Api functions> -------------------//
    async #GetGoogleDoc() {
        if (this.#gDocument) {
            return this.#gDocument;
        }
        const doc = new GoogleSpreadsheet(this.#SheetSrc);
        await doc.useServiceAccountAuth({
            client_email: this.#gMail,
            private_key: this.#gKey
        }).catch(err => {
            console.log((!util.isEmpty(err.message)) ? err.substring(0, 200) : '');
            util.LogToPublic((!util.isEmpty(err.message)) ? err.message.substring(0, 100) : '');
        });
        await doc.loadInfo();
        return doc;
    }
    async #GetOnlineBirthdays() {

        let sheet = this.#gDocument.sheetsById[0];
        return await sheet.getRows();
    }
    async #WasTodaySent() {
        let today = util.MiladiToShamdi();

        let sent = false;
        let sheet = this.#gDocument.sheetsById[946533461];
        let rows = await sheet.getRows();

        rows.forEach(r => { if (r.RunDate == today & util.isEmpty(r.Error)) { sent = true; return; } }) //check -> Sent == FALSE -> line 158 (just dont log false - wase of time though)
        return sent;
    }
    //----------------- </Google Api functions> -------------------//

    //----------------- <Utility functions> -------------------//

    async #SendRandomAnime(userid) {
        let response;
        await fetch(this.#randomAnimeApi).then(x => {
            response = x;
        }).catch(x => {
            console.log(`Random Anime Fetch Error: ${(!util.isEmpty(x.message)) ? x.message.substring(0, 200) : ''}`);
            util.LogToPublic(`Random Anime Fetch Error: ${(!util.isEmpty(x.message)) ? x.message.substring(0, 200) : ''}`);
            return;
        })
        let anime = await response.text();
        anime = JSON.parse(anime);
        var image = anime.image || anime.cover;
        if (!image) return;
        let ext = util.GetFileExtension(image);
        let mimetype = mime.lookup(ext);

        let desc = htmlToText(anime.description, { preserveNewlines: true });

        let caption =
            `ـ 🇯🇵انیمه یکهویی 🎲  🎗 یا شانس و یا اقبال 🎗\n` +
            `           ${(anime.isAdult == "true") ? '🍑🔞🍑 Adult 🍑🔞🍑' : ''}\n` +
            `<b>🍕عنوان:</b> <a href="${this.#malUrl.concat(anime.malId)}">${anime.title.romaji}</a>\n` +
            `<b>🍺نام:</b> ${anime.title.english}\n` +
            `<b>🍷وضعیت:</b> ${anime.status}\n` +
            `<b>🍩 نوع پخش:</b> ${anime.type}\n` +
            `<b>🥂تاریخ شروع:</b> ${anime.releaseDate}\n` +
            `<b>🍚قسمت‌ها:</b> ${anime.totalEpisodes}\n` +
            `<b>☕️ژانر:</b> ${(anime.genres.length > 0) ? '#'.concat(anime.genres.join(" ,#")) : ''}\n` +
            `<b>🥗توضیحات:</b>\n${desc}\n`;

        this.#bot.sendPhoto(
            userid,
            image,
            {
                caption: caption,
                parse_mode: "HTML"
            },
            {
                // Explicitly specify the file name.
                filename: `${anime.id}${ext}`,
                // Explicitly specify the MIME type.
                contentType: (mimetype != false) ? mimetype : ''
            }
        ).catch(err => {
            console.log(`Noch noCh,Sending random Anime Error: ${(!util.isEmpty(err.message)) ? err.message.substring(0, 200) : ''}`);
            util.LogToPublic(`Noch noCh,Sending random Anime Error: ${(!util.isEmpty(err.message)) ? err.message.substring(0, 200) : ''}`);
        });
    }

    #LogToXL(sendto, err = '') {
        let sheet = this.#gDocument.sheetsById[946533461];
        sheet.addRow({ RunDate: util.MiladiToShamdi(), Sent: (sendto) ? 'TRUE' : 'FALSE', Sent_To: sendto, Error: err });

        if (util.isEmpty(sendto) || !util.isEmpty(err)) util.LogToPublic(err);
    }
    async #GetBirthDayPhoto() {
        return await fs.readFile('HBD.jpg');
    }
    //----------------- </Utility functions> -------------------//
    /*
    #LogSentCelebration(celbrated) {
        let sheet = this.#gDocument.sheetsById[946533461];
        sheet.addRow({ RunDate: util.MiladiToShamdi(), Sent: (celbrated) ? 'TRUE' : 'FALSE', Sent_To: celbrated });
    }
    #LogToXlError(err) {
        let sheet = this.#gDocument.sheetsById[946533461];
        sheet.addRow({ RunDate: util.MiladiToShamdi(), Sent: 'FALSE', Error: err });
        
    }
    handleSentError(error) {
     console.log(`Specific Sent Err: ${error.message.substring(0, 100)}...`)
    }
    #IsGroupMember(userid) {
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
    */
}