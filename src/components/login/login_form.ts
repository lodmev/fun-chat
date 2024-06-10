import './login_form.scss';
import {
  cloneElement,
  createElement,
  setAttributes,
} from '../../utils/dom-helpers';
import Router from '../../router/router';
import View from '../view';
import WSConnection from '../../ws_connection/ws_connection';
import AboutButton from '../about/about_button';

// const validationErrorMessages = {
//   valueMissing: 'Must not be empty',
//   patternMismatch: 'First letter in uppercase.',
// };
export default class LoginView extends View {
  rootElement = createElement('div', 'login-view');

  loginForm = createElement('form', 'login-form');

  nameInput = createElement('input', 'input');

  passInput = cloneElement(this.nameInput);

  submitButton = cloneElement(this.nameInput);

  router: Router;

  wsConn: WSConnection;

  constructor(router: Router, wsConn: WSConnection) {
    super();
    this.router = router;
    this.wsConn = wsConn;
    this.createView();
  }

  createView() {
    setAttributes(this.nameInput, ['placeholder', 'login'], ['required', '']);
    setAttributes(
      this.passInput,
      ['type', 'password'],
      ['placeholder', 'password'],
      ['required', ''],
      ['minlength', '6']
    );
    setAttributes(this.submitButton, ['type', 'submit']);
    const labelName = createElement('label', '');
    const labelPass = cloneElement(labelName);
    const fieldSet = createElement('fieldset', 'auth');
    const legend = createElement('legend', 'auth-legend');
    legend.innerText = 'Authorization';
    labelName.innerText = 'Login: ';
    labelPass.innerText = 'Password: ';
    fieldSet.append(
      legend,
      labelName,
      this.nameInput,
      labelPass,
      this.passInput,
      this.submitButton
    );
    this.loginForm.append(fieldSet);
    this.rootElement.append(this.loginForm, new AboutButton(this.router).view);
  }
}
