'use strict'
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

export { MiladiToShamdi, GetShamsiDay, GetShamsiMonth, isEmpty }