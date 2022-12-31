'use strict'
import replaceInFile from "replace-in-file";
import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import { readFile } from "fs/promises";
import mime from 'mime-types';
import path from "path";
import { fileURLToPath } from "url";
const paths = GetJsonObj("./resource/StaticRootLink.json").paths;

function isEmpty(val) {
    return (val === undefined || val == null || val.length <= 0) ? true : false;
}

function LogToPublic(txt) {
    const options = {
        files: paths.htmlindex,
        from: /<\/ol>/i, //i is to ignore case sensitivity
        to: `<li class="list-group-item Multicolor">${new Date().toLocaleString('fa-IR-u-nu-latn')}  --  ${txt}</li>
            </ol>`
    };
    replaceInFile(options).catch((err) => { console.log(`LogToPublic Error: ${err.message}`); });

}
const templ = [{ date_ms: 1672480758878, count: 0 }];
let buffer = Array.from(templ);
function AddCounter(flush = false) {
    const ms = new Date().getTime();//now
    const first_ms = buffer[0].date_ms;//first item
    const time_passed = ms - first_ms;// how much time passed

    const total_cnt = buffer[buffer.length - 1].count + 1;
    buffer.push({ date_ms: ms, count: total_cnt });

    if (flush || time_passed > 60000)//1min
    {
        UpdateTotalStats(total_cnt);
        buffer = Array.from(templ);
    }
}
const UpdateTotalStats = (nmb) => {//inner function
    const stats = GetJsonObj(paths.statsfile);
    stats.TotalReq += nmb;
    WriteJson(paths.statsfile, stats);
    //public data------
    const optios = {
        files: paths.htmlindex,
        from: /id="RequestCount">.*</i,
        to: `id="RequestCount">${stats.TotalReq}<`
    };
    replaceInFile(optios).catch((err) => { console.log(`AddCounter Public Html Error: ${err.message}`); });
}

function GetFileExtension(animeCover) {
    let file_split = animeCover.split('.');
    return (file_split.Length != 1) ? `.${file_split[file_split.length - 1]}` : '';
}
function ResetPublicLog_HTML() {
    try {
        copyFileSync(paths.htmltemplate, paths.htmlindex);
        return true;
    } catch (error) {
        console.log(`LogToPublic Error: ${error.message}`);
        LogToPublic(`LogToPublic Error: ${error.message}`);
        return false;
    }
}
function GetJsonObj(path) {
    try {
        return JSON.parse(readFileSync(path));
    } catch (err) {
        console.log(ShortError(err));
        return false;
    }
}
function WriteJson(path, Object) {

    try {
        writeFileSync(path, JSON.stringify(Object), { encoding: "utf8", });
        return true;
    } catch (error) {
        LogToPublic(`Json Write Erro: ${ShortError(error, 200)}`);
        console.log(`Json Write Erro: ${ShortError(error, 200)}`);
        return false;
    }
}
function ShortError(err, count) {
    return (!isEmpty(err.message)) ? `${err.message.substring(0, count)}...` : '';
}
/**
 * Check if equal and ignore case
 * @param {string} a first string
 * @param {string} b second
 * @returns true or false
 */
function eq_ic(a, b) {
    return typeof a === 'string' && typeof b === 'string'
        ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
        : a === b;
}
/**
 * Asynchronously reads the entire contents of a file.
 * If no encoding is specified , the data is returned as a Buffer object. Otherwise, the data will be a string.
 * @param {string} path file path
 * @param {string} _encoding null or file encoding
 */
async function GetFileAsync(path, _encoding = null) {
    return await readFile(path, { encoding: _encoding });
}

function GetMimeType(filename) {
    if (isEmpty(filename)) return '';
    return mime.lookup(filename);
}
function GetAppDirPath() {
    return path.dirname(fileURLToPath(new URL(import.meta.url)))
}

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

export {
    MiladiToShamdi, GetShamsiDay, GetAppDirPath,
    GetShamsiMonth, isEmpty, LogToPublic,
    GetFileExtension, ResetPublicLog_HTML,
    GetJsonObj, WriteJson, ShortError,
    eq_ic, GetFileAsync, GetMimeType,
    AddCounter
}
