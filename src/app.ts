import WSConnection from './ws_connection/ws_connection';
import Main from './components/main/main';

export default class App {
  wsConn: WSConnection;

  mainController: Main;

  constructor() {
    this.wsConn = new WSConnection();
    this.mainController = new Main(this.wsConn);
  }

  start() {
    this.mainController.start();
  }
}
