import { GoogleSpreadsheet } from 'google-spreadsheet';
import { isEmpty, LogToPublic, ShortError } from '../utils.js';

export class GSheetHandler {

    #SheetId;
    #Gmail;
    #GoogleKey;
    //----------
    #Document; //Dont use directly - try to use GetDocumentAsync instead

    constructor(gmail, key, id) {
        if (
            isEmpty(gmail) ||
            isEmpty(key) ||
            isEmpty(id)) {
            console.log('GSheetHandler Constructor Error: parameter is wrong.');
            throw new Error('GSheetHandler Constructor Error: parameter is wrong.');
        }
        this.#SheetId = id; this.#Gmail = gmail; this.#GoogleKey = key;
    }

    async GetDocumentAsync() {
        if (this.#Document) {
            return this.#Document;
        }
        const doc = new GoogleSpreadsheet(this.#SheetId);
        await doc.useServiceAccountAuth({
            client_email: this.#Gmail,
            private_key: this.#GoogleKey
        }).catch(err => {
            console.log(ShortError(err, 200));
            LogToPublic(ShortError(err, 100));
        });
        await doc.loadInfo();
        this.#Document = doc;
        return doc;
    }
    async GetsheetRowsById(sheetid) {
        let doc = await this.GetDocumentAsync();
        let sheet = doc.sheetsById[sheetid];
        return await sheet.getRows();
    }
    /**
     * append a row to the end of the worksheet
     * @param {int} sheetid Add row to which sheet. accept only sheet id
     * @param {object} values row values as either:
     * - an object of header and value pairs (relative to the worksheet header columns)
     * - an array of values in column order
     */
    async HandleNewRow(sheetid, values) {
        let result;
        let doc = await this.GetDocumentAsync();
        let sheet = doc.sheetsById[sheetid];
        await sheet.addRow(values)
            .then((x) => {
                result = x;
            })
            .catch((err) => {
                console.log(`Google Sheet, Add row Failed: ${ShortError(err)}`);
                LogToPublic(`Google Sheet, Add row Failed: ${ShortError(err)}`);
                result = false;
            });
        return result;
    }

}
