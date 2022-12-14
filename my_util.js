'use strict'
import replaceInFile from "replace-in-file";
import { copyFileSync, readFileSync, writeFileSync } from 'fs';

/**
 * 
 * @param {Date} - Gregorian Date, Default today
 * 
 * @returns {String} Shamsi (jalali) string
 */
function MiladiToShamdi(date = new Date()) {
    return date.toLocaleDateString('fa-IR-u-nu-latn');
}
/**
 * @param {date} Miladi date - Default today
 * @returns {Integer} Shamsi Month
 */
function GetShamsiMonth(date = new Date()) {
    let jdate = MiladiToShamdi(date)
    return parseInt(jdate.split('/')[1]);
}
/**
 * @param {date} Miladi date - Default today
 * @returns {Integer} Shamsi Day
 */
function GetShamsiDay(date = new Date()) {
    let jdate = MiladiToShamdi(date)
    return parseInt(jdate.split('/')[2]);
}

function isEmpty(val) {
    return (val === undefined || val == null || val.length <= 0) ? true : false;
}

function LogToPublic(txt) {
    const options = {
        files: './public_log/index.html',
        from: /<\/ol>/i, //i is to ignore case sensitivity
        to: `<li class="list-group-item">${new Date().toLocaleString('fa-IR-u-nu-latn')}  --  ${txt}</li>
            </ol>`
    };
    replaceInFile(options).catch((err) => { console.log(err.message); });

}
function GetFileExtension(animeCover) {
    let file_split = animeCover.split('.');
    return (file_split.Length != 1) ? `.${file_split[file_split.length - 1]}` : '';
}
function ResetPublicLog_HTML() {
    try {
        let htmlindex = `./public_log/index.html`;
        let template = `./public_log/index-clean.html`;
        copyFileSync(template, htmlindex);
        return true;
    } catch (error) {
        console.log(error.message);
        LogToPublic(error.message);
        return false;
    }
}
function GetJson(path) {
    try {
        return JSON.parse(readFileSync(path));
    } catch (err) {
        return false;
    }
}
function WriteJson(path, Object) {

    try {
        writeFileSync(path, JSON.stringify(Object), { encoding: "utf8", });
        return true;
    } catch (error) {
        LogToPublic("Json Write Failed.");
        console.log("Json Write Failed.");
        return false;
    }
}
function ShortError(err, count) {
    return (!isEmpty(err.message)) ? `${err.message.substring(0, count)}...` : '';
}
function Compare_ignoreC(a, b) {
    return typeof a === 'string' && typeof b === 'string'
        ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
        : a === b;
}

export {
    MiladiToShamdi, GetShamsiDay,
    GetShamsiMonth, isEmpty, LogToPublic,
    GetFileExtension, ResetPublicLog_HTML,
    GetJson, WriteJson, ShortError, Compare_ignoreC
}