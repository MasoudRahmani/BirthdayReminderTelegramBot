'use strict'
import replaceInFile from "replace-in-file";


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
        to: `<li class="list-group-item">${txt}</li>
            </ol>`
};
    replaceInFile(options).then((x) => { console.log(JSON.stringify(x)); }).catch((err) => { console.log(err.message); });
      
}

export { MiladiToShamdi, GetShamsiDay, GetShamsiMonth, isEmpty, LogToPublic }