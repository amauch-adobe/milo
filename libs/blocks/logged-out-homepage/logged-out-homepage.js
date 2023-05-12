import { decorateButtons, decorateBlockBg, decorateBlockText, getBlockSize } from '../../utils/decorate.js';

// size: [heading, body, ...detail]
const blockTypeSizes = {
  small: ['m', 's', 's'],
  medium: ['l', 'm', 'm'],
  large: ['xl', 'm', 'l'],
  xlarge: ['xxl', 'l', 'xl'],
};

function goToDataHref() {
  window.location.href = this.dataset.href;
}

function parseBlockMetaData(el) {
  const rows = el.querySelectorAll(':scope > div');
  let metaDataFound = false;
  const results = {
    rows: [],
    metaData: {},
  };
  rows.forEach((row) => {
    if (metaDataFound) {
      const children = row.querySelectorAll(':scope > div');
      if (children.length === 2) {
        const key = children[0].innerText.toLowerCase().trim().split(' ').join('-');
        const image = children[1].querySelector('img');
        const link = children[1].querySelector('a');
        if (image) {
          results.metaData[key] = image.getAttribute('src');
        } else if (link && link.href.includes('.mp4')) {
          results.metaData[key] = link.href.getAttribute('src');
        } else {
          results.metaData[key] = children[1].innerText.trim();
        }
        row.remove();
      }
    } else {
      const innerText = row.innerText.toLowerCase().trim().split(' ').join('');
      if (innerText === 'blockmetadata') {
        metaDataFound = true;
        row.remove();
      } else {
        results.rows.push(row);
      }
    }
  });
  return results;
}

export default function init(el) {
  decorateButtons(el, 'button-l');
  const parsedBlock = parseBlockMetaData(el);
  let { rows, metaData } = parsedBlock;

  if (!el.classList.contains('no-bg')) {
    el.classList.add('has-bg');
    const [head, ...tail] = rows;
    decorateBlockBg(el, head);
    rows = tail;
  }
  if (el.classList.contains('highlight')) {
    const [highlight, ...tail] = rows;
    highlight.classList.add('highlight-row');
    rows = tail;
    const firstChild = highlight.querySelector(':scope > div:first-child');
    if (el.classList.contains('highlight-custom-bg')) {
      const image = firstChild.querySelector('img');
      if (image) {
        highlight.style.backgroundImage = `url(${image.getAttribute('src')})`;
      } else if (firstChild.innerText.trim() !== '') {
        highlight.style.backgroundColor = firstChild.innerText;
      }
      firstChild.remove();
      if (highlight.innerText.trim() === '') {
        highlight.classList.add('highlight-empty');
      }
    }
  }

  const config = blockTypeSizes[getBlockSize(el)];
  const overrides = ['-heading', '-body', '-detail'];
  overrides.forEach((override, index) => {
    const hasClass = [...el.classList].filter((listItem) => listItem.includes(override));
    if (hasClass.length) config[index] = hasClass[0].split('-').shift().toLowerCase();
  });
  decorateBlockText(el, config);
  rows.forEach((row) => { row.classList.add('foreground'); });

  if (el.classList.contains('link-pod') || el.classList.contains('click-pod') || el.classList.contains('news-pod')) {
    const links = el.querySelectorAll('a');
    links.forEach((link) => { link.classList.add('pod-link'); });
    if (el.classList.contains('click-pod') && links.length) {
      const link = links[0];
      el.dataset.href = link.href;
      el.addEventListener('click', goToDataHref);
    }
  }
}
