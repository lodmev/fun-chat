import ContactList, { User } from '../components/chat/contacts';
import MessengerView from '../components/chat/messenger-view';
import MsgItem from '../components/chat/msg_item';
import { Message } from '../components/chat/types';
import WSConnection from '../ws_connection/ws_connection';
import Authorization from './authorization';

type UsersTypePayload =
  | {
      type?: 'USER_EXTERNAL_LOGIN';
      payload: {
        user: User;
      };
    }
  | {
      type?: 'USER_EXTERNAL_LOGOUT';
      payload: {
        user: User;
      };
    }
  | {
      type?: 'USER_ACTIVE';
      payload: {
        users: User[];
      };
    }
  | {
      type?: 'USER_INACTIVE';
      payload: {
        users: User[];
      };
    }
  | {
      type?: 'MSG_FROM_USER';
      payload: {
        messages: Message[];
      };
    };

type UsersUpdateMessage = {
  id: string;
} & Required<UsersTypePayload>;

type AllMessages = {
  unread: MsgItem[];
  read: MsgItem[];
};

const treatMessage = (msg?: MessageEvent): UsersUpdateMessage | null => {
  if (typeof msg?.data === 'string') {
    const msgData = JSON.parse(msg.data) as UsersUpdateMessage;
    if ('type' in msgData && 'payload' in msgData) {
      return msgData;
    }
  }
  return null;
};

export default class Messenger {
  contactsView = new ContactList();

  messengerView = new MessengerView();

  users = new Map<string, User>();

  currentCollocutor = '';

  collocutorMessages: Record<string, AllMessages> = {};

  conn: WSConnection;

  auth: Authorization;

  constructor(conn: WSConnection, auth: Authorization) {
    this.conn = conn;
    this.auth = auth;
    this.conn.connection.send(
      JSON.stringify({
        id: 'get_active_users',
        type: 'USER_ACTIVE',
        payload: null,
      })
    );
    this.conn.connection.send(
      JSON.stringify({
        id: 'get_inactive_users',
        type: 'USER_INACTIVE',
        payload: null,
      })
    );
    this.eventsSubscribe();
  }

  eventsSubscribe() {
    this.conn.addEventListener('message', (msg) => this.onServerMessage(msg));
    this.contactsView.view.addEventListener('click', (event) => {
      this.onCollocutorSelect(event);
    });
    this.messengerView.senderInput.addEventListener('input', () => {
      if (this.messengerView.senderInput.value && this.currentCollocutor) {
        this.messengerView.unblockSend();
      } else {
        this.messengerView.blockSend();
      }
    });
    this.messengerView.sender.addEventListener('submit', (event) => {
      event.preventDefault();
      this.sendMessage(this.messengerView.senderInput.value);
      this.messengerView.blockSend();
      this.messengerView.senderInput.value = '';
      this.markAllAsRead();
    });
    this.setReadEvents();
  }

  setReadEvents() {
    this.messengerView.msgHistory.addEventListener('scroll', () =>
      this.markAllAsRead()
    );
    this.messengerView.msgHistory.addEventListener('click', () =>
      this.markAllAsRead()
    );
    this.messengerView.senderButton.addEventListener('click', () =>
      this.markAllAsRead()
    );
  }

  markAllAsRead() {
    if (this.collocutorMessages[this.currentCollocutor]) {
      const { unread } = this.collocutorMessages[this.currentCollocutor];
      unread.forEach((msgItem) => {
        this.conn.connection.send(
          JSON.stringify({
            id: 'mark_as_read',
            type: 'MSG_READ',
            payload: {
              message: {
                id: msgItem.msgId,
              },
            },
          })
        );
        this.collocutorMessages[this.currentCollocutor].read.push(msgItem);
      });
      this.collocutorMessages[this.currentCollocutor].unread =
        new Array<MsgItem>();
      this.updateMsgHistory();
    }
  }

  onCollocutorSelect(event: MouseEvent) {
    if (event.target instanceof HTMLElement) {
      let uname = '';
      if (event.target.className.match('user-name')) {
        uname = event.target.innerText;
      } else if (event.target.className.match('user-item')) {
        uname =
          event.target.querySelector<HTMLElement>('.user-name')?.innerText ||
          '';
      }
      if (uname) {
        const user = this.users.get(uname);
        if (user) {
          this.currentCollocutor = user.login;
          this.messengerView.unblockInput();
          this.sendMsgHistoryRequest(user);
        } else {
          window.console.error(`error while trying to get user: ${uname}`);
        }
      }
    }
  }

  sendMessage(msg: string) {
    this.conn.connection.send(
      JSON.stringify({
        id: `send_msg_from_${this.auth.userName}`,
        type: 'MSG_SEND',
        payload: {
          message: {
            to: this.currentCollocutor,
            text: msg,
          },
        },
      })
    );
  }

  sendMsgHistoryRequest(user: User) {
    if (user) {
      this.conn.connection.send(
        JSON.stringify({
          id: this.auth.userName,
          type: 'MSG_FROM_USER',
          payload: {
            user: {
              login: user.login,
            },
          },
        })
      );
      this.messengerView.updateHeader(user);
      this.messengerView.showLoader();
    }
  }

  parseMsgHistory(history: Message[]) {
    if (history.length === 0) {
      this.messengerView.showEmptyHistory();
    } else {
      history.forEach((message) => {
        const collocutor =
          message.from === this.auth.userName ? message.to : message.from;
        this.collocutorMessages[collocutor] = {
          read: new Array<MsgItem>(),
          unread: new Array<MsgItem>(),
        };
        const msgItem = new MsgItem(message, collocutor);
        if (message.status.isReaded) {
          this.collocutorMessages[collocutor].read.push(msgItem);
        } else {
          this.collocutorMessages[collocutor].unread.push(msgItem);
        }
      });
      this.updateMsgHistory();
    }
  }

  updateMsgHistory() {
    this.messengerView.clearMsgHistory();
    this.collocutorMessages[this.currentCollocutor].read.forEach((msgItem) =>
      this.messengerView.addToHistory(msgItem)
    );
    const { unread } = this.collocutorMessages[this.currentCollocutor];
    if (unread.length > 0) {
      this.messengerView.addUnreadDivider();
      unread.forEach((msgItem) => this.messengerView.addToHistory(msgItem));
    }
  }

  onServerMessage(msg?: MessageEvent) {
    const receivedMessage = treatMessage(msg);
    if (receivedMessage == null) return;
    switch (receivedMessage.type) {
      case 'USER_EXTERNAL_LOGIN':
      case 'USER_EXTERNAL_LOGOUT':
        this.users.set(
          receivedMessage.payload.user.login,
          receivedMessage.payload.user
        );
        this.contactsView.updateUser(receivedMessage.payload.user);
        break;
      case 'USER_ACTIVE':
      case 'USER_INACTIVE':
        receivedMessage.payload.users.forEach((user) => {
          if (user.login !== this.auth.userName) {
            this.contactsView.updateUser(user);
            this.users.set(user.login, user);
          }
        });
        break;
      case 'MSG_FROM_USER':
        if (receivedMessage.id === this.auth.userName) {
          this.parseMsgHistory(receivedMessage.payload.messages);
        }
        break;
      default:
    }
  }
}
