import { isEmpty } from '../utils.js';

export class AwBdDbModel {
    /**
     * 
     * @param {string} ID Google Sheet ID
     * @param {int} UsersSheet Users Sheet id with birthdays
     * @param {int} LogSheet Log Sheet id to save send or errors
     */
    constructor(
        ID,
        UsersSheet,
        LogSheet
    ) {
        if (isEmpty(ID) || isEmpty(UsersSheet) || isEmpty(LogSheet))
            throw new Error("AwBirthday Google Sheet Db Model: Parameter is empty.");
        this.ID = ID;
        this.UsersSheet = UsersSheet;
        this.LogSheet = LogSheet;
    }
}
