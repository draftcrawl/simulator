function isBrowser() {
    return typeof window !== 'undefined';
}

if (isBrowser()) {
    window.global = window;
}

// https://github.com/ai/nanoevents v7.0.1
const createNanoEvents = () => ({
    events: {},
    emit(event, ...args) {
        debugLog(`emit-event: ${event}`, args[0]);
        let callbacks = this.events[event] || [];
        for (let i = 0, length = callbacks.length; i < length; i++) {
            callbacks[i](...args);
        }
    },
    on(event, cb) {
        debugLog(`listen-event: ${event}`);
        this.events[event]?.push(cb) || (this.events[event] = [cb]);
        return () => {
            this.events[event] = this.events[event]?.filter((i) => cb !== i);
        };
    },
});

// based on https://stackoverflow.com/a/4460624
function deepClone(item) {
    if (!item) {
        return item;
    } // null, undefined values check

    var types = [Number, String, Boolean],
        result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function (type) {
        if (item instanceof type) {
            result = type(item);
        }
    });

    if (typeof result == 'undefined') {
        if (Object.prototype.toString.call(item) === '[object Array]') {
            result = [];
            item.forEach(function (child, index, array) {
                result[index] = deepClone(child);
            });
        } else if (typeof item == 'object') {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode == 'function') {
                result = item.cloneNode(true);
            } else if (!item.prototype) {
                // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    // it is an object literal
                    result = {};
                    for (var i in item) {
                        result[i] = deepClone(item[i]);
                    }
                }
            } else {
                // depending what you would like here,
                // just keep the reference, or create new object
                if (false && item.constructor) {
                    // would not advice to do that, reason? Read below
                    result = new item.constructor();
                } else {
                    result = item;
                }
            }
        } else {
            result = item;
        }
    }

    return result;
}
