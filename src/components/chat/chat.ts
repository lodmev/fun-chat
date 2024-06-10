import './chat.scss';
import { createElement, setAttributes } from '../../utils/dom-helpers';
import View from '../view';
import Router from '../../router/router';
import WSConnection from '../../ws_connection/ws_connection';
import ChatHeader from './header';
import Authorization from '../../controllers/authorization';
import Messenger from '../../controllers/messenger';

export default class Chat extends View {
  router: Router;

  wsConn: WSConnection;

  rootElement = createElement('main', 'chat');

  header: ChatHeader;

  messenger: Messenger;

  footer = createElement('footer', 'chat-footer');

  constructor(router: Router, conn: WSConnection, auth: Authorization) {
    super();
    this.router = router;
    this.wsConn = conn;
    this.header = new ChatHeader(this.router, auth);
    this.messenger = new Messenger(this.wsConn, auth);
    this.createElement();
  }

  createElement() {
    this.createFooter();
    this.rootElement.append(
      this.header.view,
      this.messenger.contactsView.view,
      this.messenger.messengerView.view,
      this.footer
    );
  }

  createFooter() {
    const rssLogo = createElement('img', 'logo');
    setAttributes(
      rssLogo,
      ['src', 'https://rs.school/assets/rs-logo-2XN05XgC.webp'],
      ['alt', 'rss logo']
    );
    const me = createElement('a', 'author');
    me.innerHTML = '<h2>lodmev</h2>';
    me.setAttribute('href', 'https://github.com/lodmev/');
    const year = createElement('div', '');
    year.innerText = `${new Date().getFullYear()}`;
    this.footer.append(rssLogo, me, year);
  }
}
