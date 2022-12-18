import { isEmpty } from '../my_util.js';

export class AwBdDbModel {
    /**
     * 
     * @param {Url} Url Google Sheet Url
     * @param {int} UsersSheet Users Sheet id with birthdays
     * @param {int} LogSheet Log Sheet id to save send or errors
     */
    constructor(
        Url,
        UsersSheet,
        LogSheet
    ) {
        if (isEmpty(Url) || isEmpty(UsersSheet) || isEmpty(LogSheet))
            throw new Error("AwBirthday Google Sheet Db Model: Parameter is empty.");
        this.Url = Url;
        this.UsersSheet = UsersSheet;
        this.LogSheet = LogSheet;
    }
}
