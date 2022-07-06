'use strict'
/**
 * 
 * @param {date} date 
 * @returns {string}
 */
function MiladiToShamdiConvertor(date) {
    return date.toLocaleDateString('fa-IR-u-nu-latn');
}
/**
 * @returns {Integer} Shamsi Month
 * @param {date} Miladi date 
 */
function GetShamsiMonth(date) {
    let jdate = MiladiToShamdiConvertor(date)
    return parseInt(jdate.split('/')[1]);
}
/**
 * @returns {Integer} Shamsi Day
 * @param {date} Miladi date 
 */
function GetShamsiDay(date) {
    let jdate = MiladiToShamdiConvertor(date)
    return parseInt(jdate.split('/')[2]);
}
module.exports = { GetShamsiMonth, GetShamsiDay, MiladiToShamdiConvertor }