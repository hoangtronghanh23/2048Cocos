import {Utils} from "db://assets/Script/Utils/utils";

export type EventType = string;

export type Listener = Function;


type EventListener = {
    listener: Listener;
    context?: any;
    once: boolean;
}

export class Event {

    private _listenerRecord: Record<string, EventListener[]> = Object.create(null);

    private _toRemoveListeners: { event: EventType, listener: EventListener }[] = [];

    public constructor() { }

    private hasListener (event: EventType, listener: Listener, context?: any) {
        const listeners = this._listenerRecord[event];
        if (!listeners) {
            //create listner array
            this._listenerRecord[event] = [];
            return false;
        }
        return this.findLinsterIndex(listeners, listener, context) > -1;
    }

    private findLinsterIndex (listeners: EventListener[], listener: Listener, context?: any) {
        return listeners.findIndex(l => l.listener === listener && (Utils.defined(context) ? l.context === context : true));
    }

    public addEventListener (event: EventType, listener: Listener, context?: any) {
        if (!this.hasListener(event, listener, context)) this._listenerRecord[event].push({ listener: listener, context: context, once: false });
    }

    public once (event: EventType, listener: Listener, context?: any) {
        if (!this.hasListener(event, listener, context)) this._listenerRecord[event].push({ listener: listener, context: context, once: true });
    }

    public removeEventListener (event: EventType, listener: Listener, context?: any) {
        const listeners = this._listenerRecord[event];
        if (!listeners) return;
        const index = this.findLinsterIndex(listeners, listener, context);
        if (index > -1) listeners.splice(index, 1);
    }

    public dispatchEvent (event: EventType, ...args: any) {
        let listeners = this._listenerRecord[event];
        if (listeners && listeners.length) {
            //复制一份 防止remove之后导致遍历数组变化
            listeners = listeners.slice(0);
            listeners.forEach(l => {
                l.listener.apply(l.context, args);
                if (l.once) this._toRemoveListeners.push({ event: event, listener: l });
            });
            if (this._toRemoveListeners.length) {
                //移除只监听一次的事件
                while (this._toRemoveListeners.length) {
                    const tr = this._toRemoveListeners.shift();
                    this.removeEventListener(tr.event, tr.listener.listener, tr.listener.context);
                }
            }
        }
    }

    public on (event: EventType, listener: Listener, context?: any) {
        this.addEventListener(event, listener, context);
    }

    public off (event: EventType, listener: Listener, context?: any) {
        this.removeEventListener(event, listener, context);
    }

    public invoke (event: EventType, ...args: any) {
        this.dispatchEvent.apply(this, arguments);
    }

    public emit (event: EventType, ...args: any) {
        this.dispatchEvent.apply(this, arguments);
    }

}

