import loading from '../assets/images/loader.gif';
import { createElement } from '../utils/dom-helpers';

const loader = createElement('img', 'loader');
loader.setAttribute('src', loading);
loader.setAttribute('alt', 'loading img');

export default loader;
