import '../../styles/_button.scss';
import Router from '../../router/router';
import { createElement } from '../../utils/dom-helpers';
import View from '../view';

export default class AboutButton extends View {
  rootElement = createElement('button', 'button');

  router: Router;

  constructor(router: Router) {
    super();
    this.router = router;
    this.configureElement();
  }

  configureElement() {
    this.view.innerText = 'About';
    this.view.addEventListener('click', () => {
      this.router.navigate('about');
    });
  }
}
