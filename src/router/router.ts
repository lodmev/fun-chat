export type Routes = {
  [uri: string]: () => void;
  showNotFound: () => void;
};

export default class Router {
  routes: Routes;

  constructor(routes: Routes) {
    this.routes = routes;
    this.setObservers();
  }

  setObservers() {
    window.addEventListener('DOMContentLoaded', () => {
      // this.navigate(window.location.pathname.slice(1));
      this.navigate(null);
    });
    window.addEventListener('popstate', () => {
      this.navigate(null);
    });
  }

  static goBack() {
    window.history.back();
  }

  navigate(uri: string | null) {
    if (typeof uri === 'string') {
      window.history.pushState(null, '', `/${uri}`);
    }
    const path = window.location.pathname.slice(1);
    if (path in this.routes) {
      this.routes[path]();
    } else {
      this.routes.showNotFound();
    }
  }
}
