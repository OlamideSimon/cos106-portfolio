/* ==========================================================================
   contact.js — validating and "sending" the contact form
   1. The validation rules
   2. Showing and clearing error messages
   3. Validating as the visitor types and when they submit
   4. A live character counter for the message
   5. The success message (and a ready-to-send email)
   ========================================================================== */

'use strict';

const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const successPanel = document.getElementById('success-panel');
const FIELD_NAMES = ['name', 'email', 'phone', 'message'];
const OWNER_EMAIL = 'simonadepetoye@gmail.com';

/* 1. Validation rules ------------------------------------------------------ */

// Something, then @, then something, then a dot, then at least two letters.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Only the characters 0 to 9, from start (^) to end ($), at least once (+).
const DIGITS_ONLY = /^\d+$/;

const LABELS = {
  name: 'your name',
  email: 'your email address',
  phone: 'your phone number',
  message: 'a message',
};

// Returns an error message for one field, or an empty string if it's valid.
function validateField(name) {
  const value = form.elements[name].value.trim();

  if (value === '') {
    return `Please enter ${LABELS[name]}.`;
  }
  if (name === 'email' && !EMAIL_PATTERN.test(value)) {
    return 'Please enter a valid email address, like name@example.com.';
  }
  if (name === 'phone' && !DIGITS_ONLY.test(value)) {
    return 'Your phone number can only contain digits (0 to 9), with no spaces, + or dashes.';
  }
  if (name === 'phone' && (value.length < 7 || value.length > 15)) {
    return 'Your phone number should be between 7 and 15 digits long.';
  }
  return '';
}

/* 2. Showing errors -------------------------------------------------------- */

function showError(name, message) {
  const input = form.elements[name];
  const error = document.getElementById(`${name}-error`);
  error.textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

/* 3. When to validate ------------------------------------------------------ */

// A field is checked when the visitor leaves it ("blur"). After that, it is
// re-checked on every keystroke so the error disappears as soon as it's fixed.
const touched = new Set();

FIELD_NAMES.forEach((name) => {
  const input = form.elements[name];

  input.addEventListener('blur', () => {
    if (input.value.trim() === '' && !touched.has(name)) return; // don't nag before they've typed
    touched.add(name);
    showError(name, validateField(name));
  });

  input.addEventListener('input', () => {
    if (touched.has(name)) showError(name, validateField(name));
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  // Check every field and keep the names of the ones that failed.
  const invalidFields = FIELD_NAMES.filter((name) => {
    touched.add(name);
    const message = validateField(name);
    showError(name, message);
    return message !== '';
  });

  if (invalidFields.length > 0) {
    const count = invalidFields.length;
    formStatus.textContent = `Please fix ${count} ${count === 1 ? 'field' : 'fields'} before sending.`;
    formStatus.className = 'form-status form-status--error';
    form.elements[invalidFields[0]].focus(); // take the visitor to the first problem
    return;
  }

  showSuccess();
});

/* 4. Character counter ----------------------------------------------------- */

const messageInput = form.elements.message;
const counter = document.getElementById('message-counter');

function updateCounter() {
  counter.textContent = `${messageInput.value.length} / ${messageInput.maxLength}`;
}

messageInput.addEventListener('input', updateCounter);
updateCounter();

/* 5. Success --------------------------------------------------------------- */

// The site has no server, so the form can't send mail by itself. Instead it
// confirms the message and prepares it as an email the visitor can send
// with one click (a "mailto:" link with the subject and body filled in).
function showSuccess() {
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const phone = form.elements.phone.value.trim();
  const message = form.elements.message.value.trim();

  const subject = `Portfolio enquiry from ${name}`;
  const body = `${message}\n\n${name}\n${email}\n${phone}`;
  document.getElementById('mailto-link').href =
    `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  document.getElementById('success-name').textContent = name.split(' ')[0];

  form.hidden = true;
  successPanel.hidden = false;
  successPanel.focus();
}

document.getElementById('send-another').addEventListener('click', () => {
  form.reset();
  touched.clear();
  FIELD_NAMES.forEach((name) => showError(name, ''));
  formStatus.textContent = '';
  updateCounter();
  successPanel.hidden = true;
  form.hidden = false;
  form.elements.name.focus();
});
