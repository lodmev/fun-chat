export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string | string[],
  callback?: Parameters<HTMLElement['addEventListener']>
) {
  const element = document.createElement(tag);
  if (typeof className === 'string') {
    element.className = className;
  } else {
    element.classList.add(...className);
  }
  if (callback) {
    element.addEventListener(...callback);
  }
  return element;
}

export function cloneElement<El extends HTMLElement>(
  element: El,
  deep?: boolean
) {
  return element.cloneNode(deep) as typeof element;
}

export function copyElement<El extends HTMLElement>(
  element: El,
  count: number,
  deep?: boolean
) {
  const elements = Array<typeof element>(count);
  for (let i = 0; i < elements.length; i += 1) {
    elements[i] = cloneElement(element, deep);
  }
  return elements;
}

export function setAttributes<El extends HTMLElement>(
  element: El,
  ...attributes: [string, string][]
) {
  attributes.forEach((attribute) => {
    const [qualifiedName, value] = attribute;
    element.setAttribute(qualifiedName, value);
  });
}
