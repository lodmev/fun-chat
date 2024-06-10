import './msg_box.scss';
import { createElement } from '../../utils/dom-helpers';
import View from '../view';

export default class MsgBox extends View {
  rootElement = createElement('div', 'modal hidden');

  msgBox = createElement('div', 'message-box');

  header = createElement('h2', 'message-box__header');

  msg = createElement('div', 'message-box__message');

  okButton = createElement('button', 'message-box__ok-button hidden');

  constructor() {
    super();
    this.okButton.innerText = 'OK';
    this.msgBox.append(this.header, this.msg, this.okButton);
    this.rootElement.append(this.msgBox);
  }

  setContent(headerText: string, msgText: string) {
    this.header.innerText = headerText;
    this.msg.innerText = msgText;
  }

  hideError() {
    this.header.classList.remove('error');
    this.okButton.classList.add('hidden');
    this.hide();
  }

  showError(errMsg: string) {
    return new Promise<void>((resolve) => {
      this.show();
      this.header.classList.add('error');
      this.setContent('ERROR', errMsg);
      this.okButton.classList.remove('hidden');
      this.okButton.onclick = () => {
        this.hideError();
        resolve();
      };
    });
  }

  show() {
    this.rootElement.classList.remove('hidden');
  }

  hide() {
    this.setContent('', '');
    this.rootElement.classList.add('hidden');
  }
}
