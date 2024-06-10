import { WS_SERVER_URL } from '../constants';

type HandlerFunction = (msg?: MessageEvent) => void;

type EventHandlers = {
  close: Set<HandlerFunction>;
  open: Set<HandlerFunction>;
  message: Set<HandlerFunction>;
};

export default class WSConnection {
  conn: WebSocket;

  eventHandlers: EventHandlers = {
    close: new Set<HandlerFunction>(),
    open: new Set<HandlerFunction>(),
    message: new Set<HandlerFunction>(),
  };

  sendingQueue: Array<string>;

  constructor() {
    this.conn = new WebSocket(WS_SERVER_URL);
    this.setEventHandlers();
    this.sendingQueue = [];
  }

  get connection() {
    return this.conn;
  }

  setEventHandlers() {
    this.conn.onopen = this.onOpen.bind(this);
    this.conn.onclose = () => {
      this.alwaysReconnect();
      this.onClose();
    };
    this.conn.onmessage = this.onMessage.bind(this);
  }

  onOpen() {
    this.eventHandlers.open.forEach((func) => {
      // check still open before invoke callbacks
      if (this.conn.readyState === WebSocket.OPEN) func();
    });
    this.sendAwaitingMsg();
  }

  sendAwaitingMsg() {
    while (this.sendingQueue.length > 0) {
      if (this.conn.readyState === WebSocket.OPEN) {
        const nextMsg = this.sendingQueue.pop();
        if (nextMsg) this.conn.send(nextMsg);
      }
    }
  }

  send(msg: string) {
    if (this.conn.readyState === WebSocket.OPEN) {
      this.conn.send(msg);
    } else {
      this.sendingQueue.push(msg);
    }
  }

  onClose() {
    this.sendingQueue = [];
    this.eventHandlers.close.forEach((func) => {
      // check still close before invoke callbacks
      if (this.conn.readyState !== WebSocket.OPEN) func();
    });
  }

  onMessage(msg: MessageEvent) {
    this.eventHandlers.message.forEach((func) => func(msg));
  }

  addEventListener<E extends keyof EventHandlers>(
    event: E,
    handler: HandlerFunction
  ) {
    this.eventHandlers[event].add(handler);
  }

  removeEventListener<E extends keyof EventHandlers>(
    event: E,
    handler: HandlerFunction
  ) {
    this.eventHandlers[event].delete(handler);
  }

  alwaysReconnect() {
    setTimeout(() => {
      window.console.log('Trying to reconnect');
      this.conn = new WebSocket(WS_SERVER_URL);
      this.setEventHandlers();
    }, 1000);
  }
}
