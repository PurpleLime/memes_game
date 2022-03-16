let Observable = {
    on (evt, handler) {
        if (!this._events) this._events = {};
        (this._events[evt] || (this._events[evt] = [])).push(handler);
        return this;
    },

    off (evt, handler) {
        if (!this._events || !this._events[evt]) return this;
        this._events[evt] = this._events[evt].filter(hndlr => hndlr !== handler);
        return this;
    },

    emit(evt, ...args) {
        if (!this._events || !this._events[evt]) return;
        this._events[evt].slice().forEach(hndlr => hndlr(...args));
    },
};

export default Observable;