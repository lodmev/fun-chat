import './about-page.scss';
import Router from '../../router/router';
import { createElement } from '../../utils/dom-helpers';
import View from '../view';

export default class AboutPage extends View {
  rootElement = createElement('div', 'about-page');

  aboutText = createElement('article', 'about-text');

  backButton = createElement('button', 'button');

  router: Router;

  constructor(router: Router) {
    super();
    this.router = router;
    this.configureElement();
  }

  configureElement() {
    this.backButton.innerText = 'Go back';
    this.backButton.addEventListener('click', () => Router.goBack());
    this.aboutText.innerHTML = `This is a simple application Fun Chat for send and receive messages designed to completing the\
       <a href="https://github.com/rolling-scopes-school/tasks/blob/master/stage2/tasks/fun-chat/README.md">task</a>
       <hr>Developed by <a href="https://github.com/lodmev/">lodmev</a>`;
    this.view.append(this.aboutText, this.backButton);
  }
}
