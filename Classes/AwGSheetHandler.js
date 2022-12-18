import { isEmpty } from '../utils.js';
import { GSheetHandler } from './GSheetHandler.js';

export class AwSheetHandler extends GSheetHandler {

    #sheetModel;
    /**
     * 
     * @param {string} gmail Gmail or Google account to access Google Sheet
     * @param {string} key Key Given To access
     * @param {AwBdDbModel} AwsheetDbModel For functions
     */
    constructor(gmail, key, AwsheetDbModel) {
        super(gmail, key, AwsheetDbModel.Url);
        this.#sheetModel = AwsheetDbModel;
    }

    AddLog(val) {
        this.Addrow(this.#sheetModel.LogSheet, val);
    }
    /**
     * was a celebrated message sent on date
     * @param {String} PersianDate Only Persian Date like 01/12/1397
     * @returns true or false
     */
    async WasItSent(PersianDate) {
        let sent = false;

        let rows = await this.GetsheetRowsById(this.#sheetModel.LogSheet);
        rows.forEach(r => {
            if (r.RunDate == PersianDate & isEmpty(r.Error)) { sent = true; return; }
        });
        return sent;
    }
    async GetBirthdays() {

        return await this.GetsheetRowsById(this.#sheetModel.UsersSheet);

    }
}