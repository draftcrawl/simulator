// https://github.com/ai/nanoevents v7.0.1
const createNanoEvents = () => ({
    events: {},
    emit(event, ...args) {
        console.log(`emit-event: ${event}`, args[0]);
        let callbacks = this.events[event] || [];
        for (let i = 0, length = callbacks.length; i < length; i++) {
            callbacks[i](...args);
        }
    },
    on(event, cb) {
        console.log(`listen-event: ${event}`);
        this.events[event]?.push(cb) || (this.events[event] = [cb]);
        return () => {
            this.events[event] = this.events[event]?.filter((i) => cb !== i);
        };
    },
});
