export default class BaseController {
    constructor() {
        this.isActive = false;
    }

    update() {
        this.isActive = true;
    }

    leave() {
        this.isActive = false;
    }
}