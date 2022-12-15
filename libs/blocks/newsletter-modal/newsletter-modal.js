import { createTag } from '../../utils/utils.js';

function closeModal() {
  const qModals = document.querySelectorAll('.dialog-modal');
  if (qModals?.length) {
    qModals.forEach((modal) => {
      if (modal.nextElementSibling?.classList.contains('modal-curtain')) {
        modal.nextElementSibling.remove();
      }
      modal.remove();
    });
    window.history.pushState('', document.title, `${window.location.pathname}${window.location.search}`);
  }
}

function displayConfirmation(content, message) {
  const confirmationText = createTag('p', { class: 'newsletter-modal-confirmation' });
  const confirmationClose = createTag('button', { class: 'newsletter-modal-confirmation-close' });

  confirmationText.textContent = message;
  confirmationClose.textContent = 'Close';
  content.innerHTML = '';

  content.append(confirmationText);
  content.append(confirmationClose);

  confirmationClose.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
  });
}

export default function init(block) {
  const children = block.querySelectorAll(':scope > div');

  block.innerHTML = '';

  const picture = children[0].querySelector('picture');
  const text = children[1].querySelector('div > p:nth-child(1)').textContent;
  const disclaimer = children[1].querySelector('div > p:nth-child(2)').textContent;

  const emailText = children[2].querySelector('div p:nth-child(1)').textContent;
  const emailPlaceholder = children[2].querySelector('div p:nth-child(2)').textContent;
  const cta = children[2].querySelector('div p:nth-child(3)').textContent;

  const successMsg = children[3].querySelector(':scope > div:nth-child(1) ').textContent;
  const errorMsg = children[3].querySelector(':scope > div:nth-child(2) ').textContent;

  const bannerContainer = createTag('div', { class: 'newsletter-modal-banner-container' }, picture);

  const content = createTag('div', { class: 'newsletter-modal-content' });
  const textEl = createTag('p', { class: 'newsletter-modal-text' }, text);
  const form = createTag('form', { class: 'newsletter-modal-form' });

  const emailTextEl = createTag('span', { class: 'newsletter-modal-email-text', id: 'newsletter_email' }, emailText);
  const emailEl = createTag('input', { type: 'email', class: 'newsletter-modal-email', required: 'required' });

  const emailLabelEl = createTag('label', { class: 'newsletter-modal-email-label', for: 'newsletter_email' }, emailTextEl);
  emailLabelEl.append(emailEl);
  emailEl.placeholder = emailPlaceholder;

  const ctaEl = createTag('button', { type: 'submit', class: 'newsletter-modal-cta' }, cta);
  const disclaimerEl = createTag('p', { class: 'newsletter-modal-disclaimer' }, disclaimer);

  ctaEl.addEventListener('click', (e) => {
    e.preventDefault();
    const email = emailEl.value;

    if (email && emailEl.checkValidity()) {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');

      const body = {
        sname: 'adbeblog',
        email,
        consent_notice: '<div class="disclaimer detail-spectrum-m" style="letter-spacing: 0px; padding-top: 15px;">The Adobe family of companies may keep me informed with personalized emails from the Adobe Blog team. See our <a href="https://www.adobe.com/privacy/policy.html" target="_blank">Privacy Policy</a> for more details or to opt-out at any time.</div>',
        current_url: window.location.href,
      };

      const requestOptions = {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      };

      fetch('https://www.adobe.com/api2/subscribe_v1', requestOptions)
        .then(() => {
          displayConfirmation(content, successMsg);
        })
        .catch(() => {
          displayConfirmation(content, errorMsg);
        });
    } else {
      emailEl.classList.add('error');
      emailEl.reportValidity();
    }
  });

  form.append(emailLabelEl, ctaEl);

  content.append(textEl, disclaimerEl, form);

  block.append(bannerContainer, content);
}
