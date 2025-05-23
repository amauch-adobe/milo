let fetchedIcons;
let fetched = false;

async function getSVGsfromFile(path) {
  /* c8 ignore next */
  if (!path) return null;
  const resp = await fetch(path);
  /* c8 ignore next */
  if (!resp.ok) return null;
  const miloIcons = {};
  const text = await resp.text();
  const parser = new DOMParser();
  const parsedText = parser.parseFromString(text, 'image/svg+xml');
  const symbols = parsedText.querySelectorAll('symbol');
  symbols.forEach((symbol) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    while (symbol.firstChild) svg.appendChild(symbol.firstChild);
    [...symbol.attributes].forEach((attr) => svg.attributes.setNamedItem(attr.cloneNode()));
    svg.classList.add('icon-milo', `icon-milo-${svg.id}`);
    miloIcons[svg.id] = svg;
  });
  return miloIcons;
}

// eslint-disable-next-line no-async-promise-executor
export const fetchIcons = (config) => new Promise(async (resolve) => {
  /* c8 ignore next */
  if (!fetched) {
    const { miloLibs, codeRoot } = config;
    const base = miloLibs || codeRoot;
    fetchedIcons = await getSVGsfromFile(`${base}/img/icons/icons.svg`);
    fetched = true;
  }
  resolve(fetchedIcons);
});

let tooltipListenersAdded = false;
function addTooltipListeners() {
  tooltipListenersAdded = true;

  ['keydown', 'mouseenter', 'focus', 'mouseleave', 'blur'].forEach((eventType) => {
    document.addEventListener(eventType, (event) => {
      const isTooltip = event.target?.matches?.('.milo-tooltip');
      if (!isTooltip) return;

      if (['mouseenter', 'focus'].includes(eventType)) {
        event.target.classList.remove('hide-tooltip');
      } else if (['mouseleave', 'blur'].includes(eventType)
        || (eventType === 'keydown' && event.key === 'Escape')) {
        event.target.classList.add('hide-tooltip');
      }
    }, true);
  });
}

function decorateToolTip(icon, iconName) {
  const hasTooltip = icon.closest('em')?.textContent.includes('|') && [...icon.classList].some((cls) => cls.includes('tooltip'));
  if (!hasTooltip) return;

  const wrapper = icon.closest('em');
  wrapper.className = 'tooltip-wrapper';
  if (!wrapper) return;
  const conf = wrapper.textContent.split('|');
  // Text is the last part of a tooltip
  const content = conf.pop().trim();
  if (!content) return;
  icon.dataset.tooltip = content;
  // Position is the next to last part of a tooltip
  const place = conf.pop()?.trim().toLowerCase() || 'right';
  icon.className = `icon icon-${iconName} milo-tooltip ${place}`;
  icon.setAttribute('tabindex', '0');
  icon.setAttribute('aria-label', content);
  icon.setAttribute('role', 'button');
  wrapper.parentElement.replaceChild(icon, wrapper);
  if (!tooltipListenersAdded) addTooltipListeners();
}

export default async function loadIcons(icons, config) {
  const iconSVGs = await fetchIcons(config);
  if (!iconSVGs) return;
  icons.forEach(async (icon) => {
    const iconNameInitial = icon.classList[1].replace('icon-', '');
    let iconName = iconNameInitial === 'tooltip' ? 'info' : iconNameInitial;
    if (iconNameInitial.includes('tooltip-')) iconName = iconNameInitial.replace(/tooltip-/, '');
    decorateToolTip(icon, iconName);

    const existingIcon = icon.querySelector('svg');
    if (!iconSVGs[iconName] || existingIcon) return;
    const parent = icon.parentElement;
    if (parent?.childNodes.length > 1) {
      if (parent.lastChild === icon) {
        icon.classList.add('margin-inline-start');
      } else if (parent.firstChild === icon) {
        icon.classList.add('margin-inline-end');
        if (parent.parentElement.tagName === 'LI') parent.parentElement.classList.add('icon-list-item');
      } else {
        icon.classList.add('margin-inline-start', 'margin-inline-end');
      }
    }
    icon.insertAdjacentHTML('afterbegin', iconSVGs[iconName].outerHTML);
  });
}
