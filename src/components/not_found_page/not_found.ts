import './not_found.scss';
import { createElement } from '../../utils/dom-helpers';

export default class NotFoundPage {
  rootElement = createElement('div', 'not-found');

  wrongPageURI = createElement('span', 'wrong-uri');

  constructor() {
    this.rootElement.innerText = 'Sorry, but there is not resource: ';
    this.rootElement.append(this.wrongPageURI);
  }

  get view() {
    this.wrongPageURI.innerText = window.location.pathname.slice(1);
    return this.rootElement;
  }
}
