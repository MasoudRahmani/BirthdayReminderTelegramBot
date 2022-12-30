'use strict';
//Todo:
//write a function to clear txt of reserved character of markdownv2
// group slow mode time and send based on that time

import * as util from '../utils.js'
import TelegramBot from 'node-telegram-bot-api';
import { AnimeHandler } from './AnimeHandler.js'

//https://core.telegram.org/bots/api#formatting-options
export class HappyBot {
    //#region field member
    #bot_server = "https://awhappybd.fly.dev/";
    #commands = {
        send: 'send', fake: 'send fake', test_No_check: 'sendtest false', test_check: 'sendtest true',
        anime: 'anime', cmd: 'commands', resetPublicHtml: 'reset public', add_admin: 'new admin'
    };
    #TG_TestGrp = "-1001632481272";
    #TG_Group;
    #adminConfig = './resource/admins.json';
    #BdPhoto = "./resource/HBD.jpg";
    #admins = [];
    #token;
    #telegram_caption_limit = 1024;
    #bot;
    #AWsheetHandler;
    #menTxt = "جناب آقای";
    #femaleTxt = "سرکار خانم";
    #HBDText = "در روز تولدتان بهترین ها را برایتان آرزومندیم.\nامیدواریم مسیر زندگیتان سرشار از لحظات خوش باشد.\nباتشکر گروه دنیای انیمه.\nଘ(੭ˊᵕˋ)੭* ੈ✩‧₊";
    fileOptions = {
        filename: 'AWHappyBdPhoto',
        contentType: 'image/jpeg'
    };
    //#endregion
    /**
     * Create a Telegram Bot For AWhappyBdBot
     * @param {string} Telegran Bot authentication token 
     * @param {AwSheetHandler} awGHandler Aw Handler for Google Sheet
     */
    constructor(token, GoogleSheetHandler) {
        if (util.isEmpty(token) ||
            util.isEmpty(GoogleSheetHandler)) {
            console.log('HappyBot Constructor Error: parameter is wrong.');
            throw new Error('HappyBot Constructor Error: parameter is wrong.');
        }
        this.#token = token;
        this.#AWsheetHandler = GoogleSheetHandler;

        this.#admins = util.GetJsonObj(this.#adminConfig);
        if (this.#admins == false) {
            console.log("Bug: admin config file is not loaded");
            util.LogToPublic("Bug: admin config file is not loaded");
        }
    }

    async Init() {
        this.#bot = new TelegramBot(this.#token, { polling: true });

        this.#bot.on('polling_error', (err) => {
            util.LogToPublic(`HappyBot Pulling Error: ${util.ShortError(err, 200)}...`);
            console.log(`HappyBot Pulling Error: ${util.ShortError(err, 200)}...`); // => 'EFATAL'
        });
        this.#bot.on('message', (req) => {
            if (
                req.from.is_bot ||
                util.isEmpty(req.text) // it is not text - vide, photo or etc
            ) return;
            req.text = req.text.toLowerCase();
            let Admin = this.#admins.find((x) => { return x.UserId == req.from.id });

            switch (req.chat.type) {
                case "group":
                case "supergroup":
                    try {
                        this.#AllGroups(req, Admin);
                    }
                    catch (err) {
                        console.log(`Handling Group Chat Error: ${util.ShortError(err, 450)}`);
                        util.LogToPublic(`Handling Group Chat Error: check console log.`);
                    }
                    break;
                case "private": //Only answer to private messages
                    this.#PrivateConversation(req, Admin);
                    break;
                case "channel":
                    break;
                default:
                    break;
            }
        });
    }
    #PrivateConversation(req, admin) {
        let isadmin = util.isEmpty(admin) ? false : true;

        if (isadmin) {
            let commandPos = Object.values(this.#commands).findIndex((x) => { return req.text.startsWith(x); });

            if (commandPos < 0) { // It is not a command
                this.#bot.sendMessage(req.from.id,
                    `🌸 *مدیر* گرامی، جناب ${admin.Name} خوش آمدید\\.\n` +
                    `    با اجرای دستور \`commands\` میتواند از کامندهای در دسترس مطلع شوید\\.🍀`,
                    { parse_mode: 'MarkdownV2' }).catch(err => {
                        console.log(util.ShortError(err, 200));
                        util.LogToPublic(util.ShortError(err, 200));
                    });
            }
            else
                this.#HandleOwnerRq(req);
        }
        else {
            this.#bot.sendMessage(req.from.id, `🌹 🥳 بات تبریک تولد 💃🌹`).catch(err => { util.LogToPublic(util.ShortError(err, 200)); });
            this.#RandomAnime(req.from.id);
        }
    }
    #AllGroups(req, admin) {
        // group slow mode time and send based on that time
        // group comand as field maybe?

        let isadmin = util.isEmpty(admin) ? false : true;
        if (isadmin) {
            if (util.eq_ic(req.text, "@AWBirthdayBot god")) {
                this.#bot.sendMessage(req.chat.id, " No eye to see, No ear to listen.\n No body to touch to feel warm. \n No hand to comfort.\n\n Yet you seek...");
            }
        }
        if (util.eq_ic(req.text, "@AWBirthdayBot anime")) {
            this.#RandomAnime(req.chat.id);
        }
    }
    async #HandleOwnerRq(req) {
        let request = req.text;
        let condition = request;

        //add_admin: Check if pattern is correct and group them to 0:input text , 1: command 2: userid, 3: name 4: telegram username
        let _possible_admin = request.match(`^(${this.#commands.add_admin}) ([0-9]+)+([^@]*)?(@[^ ]*)?`);
        condition =
            (request.startsWith(this.#commands.add_admin))
                ? this.#commands.add_admin
                : request;

        switch (condition) {
            case this.#commands.send: {
                this.SendHBD(this.#TG_Group).then(result => { this.#bot.sendMessage(req.from.id, `result: ${result}`); }
                ).catch(err => { this.#bot.sendMessage(req.from.id, util.ShortError(err, 200)) });
                break;
            }
            case this.#commands.fake: {
                let photo = await this.#GetBirthDayPhoto();
                let sir = `${this.#menTxt} - ${this.#femaleTxt}:`;
                let happy = `${sir} ${req.from.first_name || ''} ${req.from.last_name || ''}\n${this.#HBDText} \n\n\n@${req.from.username}`;
                this.#bot.sendPhoto(this.#TG_TestGrp, photo, { caption: happy, parse_mode: '' }, this.fileOptions
                ).then(result => { this.#bot.sendMessage(req.from.id, `result: ${(result) ? true : false}`); } //make result readable
                ).catch(err => { this.#bot.sendMessage(req.from.id, util.ShortError(err, 200)) });
                break;
            }
            case this.#commands.test_No_check: {

                this.#Send_HBD(this.#TG_TestGrp, false).then(result => { this.#bot.sendMessage(req.from.id, `result: ${result}`); }
                ).catch(err => { this.#bot.sendMessage(req.from.id, util.ShortError(err, 200)) });
                break;
            }
            case this.#commands.test_check: {
                this.#Send_HBD(this.#TG_TestGrp, true).then(result => { this.#bot.sendMessage(req.from.id, `result: ${result}`); }
                ).catch(err => { this.#bot.sendMessage(req.from.id, util.ShortError(err, 200)) });
                break;
            }
            // In all other places characters '_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!' 
            // must be escaped with the preceding character '\'.
            case this.#commands.cmd: {
                this.#bot.sendMessage(req.from.id,
                    `🧑‍💻* فرمان‌ها* با حروف کوچک:\n` +
                    `1\\. \`${this.#commands.send}\` :    اجبار بات به ارسال سریع دوباره\n` +
                    `2\\. \`${this.#commands.fake}\` :    ارسال یک پیام بی محتوا بدون هیچ بررسی به گروه تست\\. فقط جهت بررسی سلامت عملکرد\n` +
                    `3\\. \`${this.#commands.test_No_check}\` :    تست ارسال، بدون بررسی موارد ارسال شده ی امروز به گروه تست\n` +
                    `4\\. \`${this.#commands.test_check}\` :    تست ارسال: با بررسی ارسال شده های امروز\n` +
                    `5\\. \`${this.#commands.anime}\` :    انیمه شانسی😈❤️\n` +
                    `6\\. \`${this.#commands.resetPublicHtml}\` :    ریست کردن لاگ عمومی در آدرس سرور\n` +
                    `7\\. \`${this.#commands.add_admin}\` :به سرور یک آدمین جدید اضافه کنید\\.\n` +
                    `    دستور باید همیشه با عدد آیدی کاربر مورد نظر همراه باشد\\. بطور مثال: \n` +
                    `\`\`\` \n` +
                    `قالب: \n` +
                    `${this.#commands.add_admin} {userid} {firstname} {@UserName} \n` +
                    `نمونه: \n` +
                    `${this.#commands.add_admin} 90886656 MasoudRahmani @Masoud_rah \n` +
                    `\`\`\` \n` +
                    ` \n` +
                    ` لطفا نهایت دقت لازم را مبذول فرمایید\\.  \n` +
                    ` \n` +
                    ` \n\n\n` +
                    `Bot is running at: [Bot Server سرور](${this.#bot_server})`,
                    { parse_mode: 'MarkdownV2' }
                )
                break;
            }
            case this.#commands.anime: {
                this.#RandomAnime(req.from.id);
                break;
            }
            case this.#commands.resetPublicHtml: {
                let result = util.ResetPublicLog_HTML();
                this.#bot.sendMessage(req.from.id, (result) ? `موفق` : ` ناموفق.`);
                break;
            }
            case this.#commands.add_admin: //with no arg ->  to check all possibility
                {
                    if (util.isEmpty(_possible_admin)) {
                        this.#bot.sendMessage(req.from.id, "دستور ناقص است، لطفا نحوه وارد کردن پارامتر را مطالعه کنید."); return;
                    }
                    let newadmin = { newid: _possible_admin[2], _name: _possible_admin[3].trim(), _user: _possible_admin[4] };

                    if (!util.isEmpty(newadmin.newid)) { //we need id

                        let _exist = this.#admins.findIndex((x) => { return x.UserId == newadmin.newid });

                        if (_exist >= 0) {
                            this.#bot.sendMessage(req.from.id, "این کاربر قبلا ثبت شده است"); return;
                        }

                        this.#admins.push({
                            "Name": newadmin._name,
                            "UserName": newadmin._user,
                            "UserId": newadmin.newid,
                            "AddedByID": req.from.id,
                            "Date": new Date().toDateString()
                        })
                        var result = util.WriteJson(this.#adminConfig, this.#admins);
                        this.#bot.sendMessage(req.from.id, (result) ? `کاربر با آیدی ${newadmin.newid} با موفقیت اضافه شد.` : `ثبت اطلاعات ناموفق بوده است.`);
                    } else {
                        this.#bot.sendMessage(req.from.id, "پارامتر آیدی به درستی وارد نشده است."); return;
                    }
                    break;
                }
            default:
                break;
        }
    }
    //#region <Birthday Logic>
    /**
     * Get AW Birthdays and Sent Happy Birthday to users which have aged today.
     * @param {string} Telegram group to send happy birthday
     * @returns Celebrated Users as string
     */
    async SendHBD(TG_GroupChatID = null) {
        if (TG_GroupChatID == '') throw new Error('Group Chat Id Cannot be Empty String.');

        this.#TG_Group = (TG_GroupChatID) ? TG_GroupChatID : this.#TG_TestGrp;
        return await this.#Send_HBD(this.#TG_Group, true);
    }
    /**
     * @param {string} customgrp Telegram Private Group to sent happy bd to!
     * @param {Boolean} check_if_was_sent True to check if we send happy bd today or no, if was sent we dont send anymore, False we send whether was sent or not
     * @returns result of sending which is celebrated user or "". on exception err msg is returned.
     */
    async #Send_HBD(customgrp, check_if_was_sent) {
        try {
            if (util.isEmpty(customgrp)) customgrp = this.#TG_TestGrp;

            let ir_D = util.GetShamsiDay();
            let ir_M = util.GetShamsiMonth();

            if (check_if_was_sent) {
                let today = util.MiladiToShamdi();
                let was_sent = await this.#AWsheetHandler.WasItSent(today);
                if (was_sent) return `${today} Was sent.`;
            }

            let photo = await this.#GetBirthDayPhoto();
            let celebrated = "";
            await this.#AWsheetHandler.GetBirthdays().then(async rows => {
                let to_celebrate = [];
                rows.forEach(r => {
                    let sir = "";
                    if (util.isEmpty(r.Deleted) | util.isEmpty(r.Day) | util.isEmpty(r.Month)) return;

                    if (util.eq_ic(r.Deleted, 'false')) {
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
                    let happybd = `${to_celebrate.join("\n")}\n${this.#HBDText}`;

                    await this.#bot.sendPhoto(customgrp, photo, { caption: happybd }, this.fileOptions
                    ).then((/*x*/) => { if (check_if_was_sent) this.#LogToXL(celebrated.substring(3)); }
                    ).catch(err => {
                        this.#LogToXL('', err.message);
                        celebrated = util.ShortError(err, 200)
                    });//if err we didnt celebrate then we need to sendback error result;
                } else {
                    //this.#LogToXL(celebrated);// log today we had no one -> too many log. just the fact that there was no error and log says nothing happend.
                }
            });
            return celebrated;
        } catch (err) {
            console.log(`Overall SentHBD Error: ${util.ShortError(err, 200)}`);
            this.#LogToXL('', `Overall SentHBD Error: ${util.ShortError(err, 200)}`);
            return util.ShortError(err, 200);
        }
    }
    //#endregion
    //#region <Utility functions>
    async #RandomAnime(userid) {
        try {
            let ani_Handler = new AnimeHandler();
            let { anime, status } = await ani_Handler.RandomAnimeAsync();

            if (status != 200) { this.#bot.sendMessage(userid, `خطا: ${anime}`); return; }

            let hashtag_genre = (Array.isArray(anime.genres)) ? anime.genres.map((x) => { return x.trim().replaceAll(" ", "_").replaceAll("-", "_") }) : "";
            hashtag_genre = (hashtag_genre.length > 0) ? '#'.concat(hashtag_genre.join(", #")) : '';

            let caption =
                `ـ 🇯🇵انیمه یکهویی 🎲  🎗 یا شانس یا اقبال 🎗\n` +
                `${(anime.isAdult == "true") ? '🍑 Adult 🍑' : ''}\n` +
                `<b>🍕عنوان:</b><a href="${anime.mal_link}">${anime.t_romaji}</a>\n` +
                `<b>🍺نام:</b>${anime.t_english || anime.t_native}\n` +
                `<b>🍷وضعیت:</b>${anime.status}\n` +
                `<b>🍩 نوع پخش:</b>${anime.type}\n` +
                `<b>🥂تاریخ شروع:</b>${anime.releaseDate}\n` +
                `<b>🍚قسمت‌ها:</b>${anime.totalEpisodes}\n` +
                `<b>☕️ژانر:</b>${hashtag_genre}\n` +
                `<b>*رتبه: </b>${anime.rating}\n` +
                `\n` +
                `🥗 `;
            let remaining = this.#telegram_caption_limit - caption.length;

            let caption_p2 = anime.desc.substring(0, remaining - 4);

            caption = caption.concat(`${caption_p2}...`);

            this.#bot.sendPhoto(
                userid,
                anime.image,
                {
                    caption: caption,
                    parse_mode: "HTML"
                },
                {
                    filename: `${anime.id}${anime.ext}`,
                    contentType: anime.mimetype
                }
            ).catch(err => {
                console.log(`Sending anime message Error: ${util.ShortError(err, 300)}`);
                util.LogToPublic(`Sending anime message Error: ${util.ShortError(err, 300)}`);
            });
        }
        catch (err) {
            console.log(`HappyBot Anime Error: ${util.ShortError(err, 250)}...`);
            util.LogToPublic(`HappyBot Anime Error: ${util.ShortError(err, 250)}...`);
            this.#bot.sendMessage(userid, "خطا در دریافت اطلاعات، لطفا بعدا تلاش فرمایید.");
        }
    }
    async #GetBirthDayPhoto() {
        return await util.GetFileAsync(this.#BdPhoto);
    }

    #LogToXL(sendto, err = '') {
        let val = { RunDate: util.MiladiToShamdi(), Sent: (sendto) ? 'TRUE' : 'FALSE', Sent_To: sendto, Error: err };
        this.#AWsheetHandler.AddLog(val);

        if (util.isEmpty(sendto) || !util.isEmpty(err)) util.LogToPublic(err);
    }
    //#endregion
}