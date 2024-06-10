import { createElement } from '../../utils/dom-helpers';
import View from '../view';
import './contacts.scss';

export type User = {
  login: string;
  isLogined: boolean;
};

function filterList(text: string, list: HTMLUListElement) {
  const items = list.children;
  for (let i = 0; i < items.length; i += 1) {
    const elem = items[i] as HTMLElement;
    if (text === '') {
      elem.classList.remove('hidden');
    } else if (elem.innerText.toLowerCase().indexOf(text) === -1) {
      elem.classList.add('hidden');
    } else {
      elem.classList.remove('hidden');
    }
  }
}

export default class ContactList extends View {
  rootElement = createElement('div', 'contact-list');

  userSearchInput = createElement('input', 'user-search-input');

  contactList = createElement('ul', 'list');

  userElements = new Map<string, HTMLLIElement>();

  constructor() {
    super();
    this.userSearchInput.setAttribute('placeholder', 'Search...');
    this.rootElement.append(this.userSearchInput, this.contactList);
    this.searchFieldObserve();
  }

  updateUser(user: User) {
    if (this.userElements.has(user.login)) {
      this.userElements
        .get(user.login)
        ?.classList.toggle('online', user.isLogined);
      this.updateView();
    } else {
      this.makeItemUserElement(user);
    }
  }

  updateView() {
    this.contactList.replaceChildren(...this.userElements.values());
    this.filter();
  }

  searchFieldObserve() {
    this.userSearchInput.addEventListener('input', () => {
      this.filter();
    });
  }

  makeItemUserElement(user: User) {
    const listElement = createElement('li', `user-item`);
    const uName = createElement('span', 'user-name');
    uName.innerText = user.login;
    listElement.append(uName);
    listElement.classList.toggle('online', user.isLogined);
    this.userElements.set(user.login, listElement);
    this.updateView();
  }

  filter() {
    filterList(this.userSearchInput.value, this.contactList);
  }
}
