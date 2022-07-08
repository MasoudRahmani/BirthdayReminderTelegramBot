export class Person {
    constructor(UserName, FullName, Month, Day, Year) {
        this._FullName = FullName || ''; this._month = Month || ''; this._Day = Day | '';
        this._Year = Year || ''; this._tUserName = UserName || '';
    }
};