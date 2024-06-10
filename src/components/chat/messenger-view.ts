import './messenger-view.scss';
import {
  cloneElement,
  createElement,
  setAttributes,
} from '../../utils/dom-helpers';
import View from '../view';
import { User } from './contacts';
import loader from '../loader';
import MsgItem from './msg_item';

export default class MessengerView extends View {
  rootElement = createElement('div', 'message-view');

  header = createElement('header', 'message-header');

  userName = createElement('span', 'messenger_user-name');

  userStatus = createElement('span', 'messenger_user-status');

  msgHistory = createElement('div', 'message-history');

  choseUserMsg = createElement('div', 'empty-history');

  emptyHistoryMsg = cloneElement(this.choseUserMsg);

  sender = createElement('form', 'message-sender');

  senderInput = createElement('input', 'message-input');

  senderButton = createElement('input', 'button message_button');

  unreadDivider = createElement('div', 'unread-divider');

  constructor() {
    super();
    this.createView();
  }

  addToHistory(msgItem: MsgItem) {
    this.msgHistory.append(msgItem.view);
  }

  addUnreadDivider() {
    this.msgHistory.append(this.unreadDivider);
  }

  removeUnreadDivider() {
    this.unreadDivider.remove();
  }

  updateHeader(user: User) {
    this.userName.innerText = user.login;
    this.userStatus.innerText = user.isLogined ? 'online' : 'offline';
    this.userStatus.classList.toggle('online', user.isLogined);
  }

  showLoader() {
    this.msgHistory.replaceChildren(loader);
  }

  clearMsgHistory() {
    this.msgHistory.replaceChildren();
  }

  showEmptyHistory() {
    this.msgHistory.replaceChildren(this.emptyHistoryMsg);
  }

  blockSend() {
    this.senderButton.setAttribute('disabled', '');
  }

  unblockSend() {
    this.senderButton.removeAttribute('disabled');
  }

  unblockInput() {
    this.senderInput.removeAttribute('disabled');
  }

  createView() {
    this.createHeader();
    this.choseUserMsg.innerText = 'Please chose user for messaging...';
    this.emptyHistoryMsg.innerText = 'Send your first message to this user...';
    this.unreadDivider.innerHTML = `<label>Unread messages</label>`;
    this.msgHistory.append(this.choseUserMsg);
    setAttributes(
      this.senderInput,
      ['placeholder', 'Message...'],
      ['disabled', '']
    );
    setAttributes(this.senderButton, ['type', 'submit'], ['disabled', '']);
    this.sender.append(this.senderInput, this.senderButton);
    this.rootElement.append(this.header, this.msgHistory, this.sender);
  }

  createHeader() {
    this.userName.innerText = 'no user';
    this.userStatus.innerText = 'unknown';
    this.userStatus.setAttribute('title', 'status');
    this.header.append(this.userName, this.userStatus);
  }
}
