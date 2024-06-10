export default abstract class View {
  abstract rootElement: HTMLElement;

  get view() {
    return this.rootElement;
  }
}
