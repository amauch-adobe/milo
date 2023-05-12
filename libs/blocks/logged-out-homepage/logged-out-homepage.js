import { decorateButtons, decorateBlockBg, decorateBlockText } from '../../utils/decorate.js';

// size: [heading, body, ...detail]
// blockTypeSizes array order: heading, body, detail, button, link
const blockTypeSizes = {
  small: ['m', 's', 's', 'l', 's'],
  medium: ['l', 'm', 'm', 'l', 'm'],
  large: ['xl', 'm', 'l', 'l', 'm'],
  xlarge: ['xxl', 'l', 'xl', 'l', 'l'],

  /* TODO: add this to CSS */
  podFullSizePodDesktop: ['xl', 'm', 'l', 'm'],

  'link-pod': ['m', 'xs', 'm', 's', 'xs'],
  'news-pod': ['s', 'm', 'm', 's', 'xs'],
  'quick-tools-bar': ['l', 'l', 'm', 's', 'xs'],
  default: ['m', 'm', 'l', 's', 'xs'],
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

function getBlockSize(el) {
  const sizes = ['small', 'medium', 'large', 'xlarge', 'link-pod', 'news-pod', 'quick-tools-bar', 'default'];
  return sizes.find((size) => el.classList.contains(size)) || sizes[7];
}

function decorateLinks(el, size) {
  const links = el.querySelectorAll('a:not(.con-button)');
  if (links.length === 0) return;
  links.forEach((link) => {
    const parent = link.closest('p, div');
    parent.setAttribute('class', `body-${size}`);
  });
}

export default function init(el) {
  const blockSize = getBlockSize(el);
  decorateButtons(el, `button-${blockTypeSizes[blockSize][3]}`);
  decorateLinks(el, blockTypeSizes[blockSize][4]);
  const parsedBlock = parseBlockMetaData(el);
  let { rows, metaData } = parsedBlock;

  if (rows.length > 1) {
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

  const config = blockTypeSizes[blockSize];
  const overrides = ['-heading', '-body', '-detail'];
  overrides.forEach((override, index) => {
    const hasClass = [...el.classList].filter((listItem) => listItem.includes(override));
    if (hasClass.length) config[index] = hasClass[0].split('-').shift().toLowerCase();
  });
  decorateBlockText(el, config);
  rows.forEach((row) => { row.classList.add('foreground'); });

  if (el.classList.contains('link-pod') || el.classList.contains('click-pod') || el.classList.contains('news-pod')) {
    const links = el.querySelectorAll('a');
    if (el.classList.contains('click-pod') && links.length) {
      const link = links[0];
      el.dataset.href = link.href;
      el.addEventListener('click', goToDataHref);
    }
  }
}
