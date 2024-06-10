import { createElement } from '../../utils/dom-helpers';
import View from '../view';
import { Message } from './types';
import './msg_item.scss';

export default class MsgItem extends View {
  rootElement = createElement('div', 'message-wrapper');

  boxElement = createElement('div', 'message-item');

  msgId: string;

  collocutor: string;

  isOwn: boolean;

  messageHeader = createElement('div', 'message-item__header');

  messageText = createElement('div', 'message-item__text');

  messageStatus = createElement('div', 'message-item__status');

  editedStatus = createElement('span', 'message-item__edited-status');

  deliveryStatus = createElement('span', 'message-item__delivery-status');

  constructor(message: Message, collocutor: string) {
    super();
    this.msgId = message.id;
    this.collocutor = collocutor;
    this.isOwn = message.from !== collocutor;
    this.setHeader(message);
    this.setStatus(message.status);
    this.rootElement.classList.toggle('own', this.isOwn);
    this.messageText.innerText = message.text;
    this.boxElement.append(
      this.messageHeader,
      this.messageText,
      this.messageStatus
    );
    this.rootElement.append(this.boxElement);
  }

  setHeader(message: Message) {
    this.messageHeader.innerHTML = `\
    <span class="message-item__header__sender">\
    ${this.isOwn ? 'you' : message.from}</span>\
    <span>${new Date(message.datetime).toLocaleString()}</span>`;
  }

  markAsRead() {
    this.deliveryStatus.innerText = 'read';
  }

  setStatus(status: Message['status']) {
    const editedStatusText = status.isEdited ? 'edited' : '';
    this.editedStatus.innerText = editedStatusText;
    if (this.isOwn) {
      let deliveryStatusText;
      if (status.isDelivered) {
        deliveryStatusText = 'delivered';
      }
      if (status.isReaded) {
        deliveryStatusText = 'read';
      }
      this.deliveryStatus.innerText = deliveryStatusText || '';
    }
    this.messageStatus.append(this.editedStatus, this.deliveryStatus || '');
  }
}
