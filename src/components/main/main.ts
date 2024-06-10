import Authorization from '../../controllers/authorization';
import Router from '../../router/router';
import { createElement } from '../../utils/dom-helpers';
import WSConnection from '../../ws_connection/ws_connection';
import AboutButton from '../about/about_button';
import AboutPage from '../about/about_page';
import Chat from '../chat/chat';
import LoginView from '../login/login_form';
import MsgBox from '../modal_msg_box/msg_box';
import NotFoundPage from '../not_found_page/not_found';

export default class Main {
  router: Router;

  wsConn: WSConnection;

  loginComponent: LoginView;

  rootElement = createElement('div', 'root');

  notFoundPage = new NotFoundPage();

  msgBox = new MsgBox();

  aboutPage: AboutPage;

  aboutButton: AboutButton;

  authorization: Authorization;

  constructor(conn: WSConnection) {
    this.wsConn = conn;
    this.router = new Router(this.createRoutes());
    this.loginComponent = new LoginView(this.router, this.wsConn);
    this.authorization = new Authorization(
      this.wsConn,
      this.router,
      this.loginComponent
    );
    this.aboutButton = new AboutButton(this.router);
    this.aboutPage = new AboutPage(this.router);
    this.observeConnection();
  }

  start() {
    document.body.append(this.msgBox.view, this.rootElement);
  }

  replaceView(component: Node) {
    this.rootElement.replaceChildren(component);
  }

  authorize() {
    this.authorization
      .awaitFormSubmit()
      .then(() => {
        this.msgBox.setContent(
          'Authorization',
          'Please wait for server response'
        );
        this.msgBox.show();
        return this.authorization.awaitServerResponse();
      })
      .then(() => {
        this.router.navigate('main');
        this.msgBox.hide();
      })
      .catch((reason) => {
        if (reason && reason instanceof Error) {
          this.msgBox.showError(reason.message).then(
            () => {
              this.router.navigate('login');
            },
            () => {}
          );
        }
      });
  }

  toMainPage() {
    if (this.authorization.isUserLogined) {
      this.replaceView(
        new Chat(this.router, this.wsConn, this.authorization).view
      );
    } else if (!this.authorization.hasUserData()) {
      this.router.navigate('login');
    } else {
      this.authorize();
    }
  }

  toLogin() {
    if (this.authorization.isUserLogined || this.authorization.hasUserData()) {
      this.router.navigate('main');
    } else {
      this.replaceView(this.loginComponent.view);
      this.authorize();
    }
  }

  createRoutes() {
    return {
      '': this.toMainPage.bind(this),
      main: this.toMainPage.bind(this),
      login: this.toLogin.bind(this),
      about: () => this.replaceView(this.aboutPage.view),
      showNotFound: () => {
        this.replaceView(this.notFoundPage.view);
      },
    };
  }

  observeConnection() {
    let path: string;
    const connLost = () => {
      this.msgBox.setContent('Connection', 'Trying to connect to server...');
      this.msgBox.show();
      path = window.location.pathname.slice(1);
    };
    if (this.wsConn.connection.readyState !== WebSocket.OPEN) connLost();
    this.wsConn.addEventListener('close', connLost);
    this.wsConn.addEventListener('open', () => {
      this.msgBox.hide();
      this.router.navigate(path);
    });
  }
}
