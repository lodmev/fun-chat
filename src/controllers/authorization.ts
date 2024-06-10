import LoginView from '../components/login/login_form';
import { APP_NAME } from '../constants';
import Router from '../router/router';
import WSConnection from '../ws_connection/ws_connection';

type RequestPayload = {
  user: {
    login: string;
    password: string;
  };
};

type ResponsePayload = {
  user: {
    login: string;
    isLogined: boolean;
  };
};

type ErrorPayload = {
  error: string;
};

type AuthMessage = {
  id: string;
  type: 'USER_LOGIN' | 'ERROR';
};

type RequestMessage = AuthMessage & {
  payload: RequestPayload;
};

type ResponseMessage = AuthMessage & {
  payload: ResponsePayload;
};

type ErrorMessage = AuthMessage & {
  payload: ErrorPayload;
};

function getAuthMessage(
  id: string,
  msg?: MessageEvent
): ResponseMessage | ErrorMessage | null {
  if (typeof msg?.data === 'string') {
    const msgData = <ResponseMessage | ErrorMessage>JSON.parse(msg.data);
    if (msgData?.id === id) return msgData;
  }
  return null;
}

const storageKey = `${APP_NAME}Credentials`;

function loadCredentials(key: string) {
  const savedCredentials = window.sessionStorage.getItem(key);
  if (!savedCredentials) {
    return { userName: null, userPass: null };
  }
  return JSON.parse(savedCredentials) as { userName: string; userPass: string };
}

function saveCredentials(
  key: string,
  data: {
    userName: string | null;
    userPass: string | null;
  }
) {
  window.sessionStorage.setItem(key, JSON.stringify(data));
}

export default class Authorization {
  conn: WSConnection;

  router: Router;

  loginComponent: LoginView;

  userName: string | null;

  userPass: string | null;

  isUserLogined = false;

  static authResolve = () => {};

  static authReject = (reason: unknown) => reason;

  constructor(conn: WSConnection, router: Router, loginComponent: LoginView) {
    this.conn = conn;
    this.router = router;
    this.loginComponent = loginComponent;
    ({ userName: this.userName, userPass: this.userPass } =
      loadCredentials(storageKey));
    this.setConnEvtListeners();
  }

  authMsgID(login = true) {
    const type = login ? 'USER_LOGIN' : 'USER_LOGOUT';
    return `${type}_${this.userName}`;
  }

  setConnEvtListeners() {
    this.conn.addEventListener('message', (msg) => {
      const msgData = getAuthMessage(this.authMsgID(), msg);
      if (msgData !== null) {
        if (msgData.type === 'USER_LOGIN' && 'user' in msgData.payload) {
          this.isUserLogined = true;
          saveCredentials(storageKey, {
            userName: this.userName,
            userPass: this.userPass,
          });
          this.loginComponent.passInput.value = '';
          Authorization.authResolve();
        } else if (msgData.type === 'ERROR' && 'error' in msgData.payload) {
          if (this.isUserLogined) return;
          this.userPass = null;
          this.loginComponent.passInput.value = '';
          this.loginComponent.passInput.blur();
          Authorization.authReject(new Error(msgData.payload.error));
        }
      }
    });
    this.conn.addEventListener('close', () => {
      this.isUserLogined = false;
    });
  }

  awaitFormSubmit() {
    if (this.hasUserData()) return Promise.resolve();
    return new Promise<void>((resolve) => {
      this.loginComponent.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.userName = this.loginComponent.nameInput.value;
        this.userPass = this.loginComponent.passInput.value;
        resolve();
      });
    });
  }

  async awaitServerResponse() {
    return new Promise<void>((res, rej) => {
      this.sendAuthRequest();
      Authorization.authResolve = res;
      Authorization.authReject = rej;
    });
  }

  hasUserData(): boolean {
    return Boolean(this.userName && this.userPass);
  }

  sendAuthRequest() {
    const authRequest: RequestMessage = {
      id: this.authMsgID(),
      type: `USER_LOGIN`,
      payload: {
        user: {
          login: `${this.userName}`,
          password: `${this.userPass}`,
        },
      },
    };
    this.conn.send(JSON.stringify(authRequest));
  }

  logout() {
    this.conn.send(
      JSON.stringify({
        id: this.authMsgID(false),
        type: 'USER_LOGOUT',
        payload: {
          user: {
            login: this.userName,
            password: this.userPass,
          },
        },
      })
    );
    this.userName = null;
    this.userPass = null;
    this.isUserLogined = false;
    window.sessionStorage.removeItem(storageKey);
  }
}
