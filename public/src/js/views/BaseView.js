import Observable from "../Observable.js";

class BaseView {
    constructor() {
    }
}

Object.assign(BaseView.prototype, Observable);

export default BaseView;
