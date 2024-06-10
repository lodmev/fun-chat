import './header.scss';
import { createElement } from '../../utils/dom-helpers';
import View from '../view';
import AboutButton from '../about/about_button';
import Router from '../../router/router';
import Authorization from '../../controllers/authorization';

export default class ChatHeader extends View {
  rootElement = createElement('header', 'chat-header');

  userName = createElement('span', 'user-name');

  appName = createElement('h2', 'app-name');

  auth: Authorization;

  router: Router;

  logOutButton = createElement('button', 'button');

  aboutButton: AboutButton;

  constructor(router: Router, auth: Authorization) {
    super();
    this.router = router;
    this.auth = auth;
    this.aboutButton = new AboutButton(router);
    this.createElement();
  }

  createElement() {
    this.userName.innerText = this.auth.userName || '';
    this.appName.innerText = 'Fun Chat';
    const buttonsBlock = createElement('div', 'buttons-block');
    const userNameBlock = createElement('div', 'user-name-block');
    userNameBlock.innerText = 'User: ';
    userNameBlock.append(this.userName);
    this.treatLogOutButton();
    buttonsBlock.append(this.logOutButton, this.aboutButton.view);
    this.rootElement.append(userNameBlock, this.appName, buttonsBlock);
  }

  treatLogOutButton() {
    this.logOutButton.innerText = 'Logout';
    this.logOutButton.addEventListener('click', () => {
      this.auth.logout();
      this.router.navigate('login');
    });
  }
}
