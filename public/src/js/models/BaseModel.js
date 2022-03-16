import Observable from "../Observable.js";

class BaseModel {
    constructor() {
    }
}

Object.assign(BaseModel.prototype, Observable);

export default BaseModel;
