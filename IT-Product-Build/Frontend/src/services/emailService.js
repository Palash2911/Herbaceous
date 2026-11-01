import emailjs from "@emailjs/browser";

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const CONTACT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID;

const CONTACT_RATE_LIMIT = { id: "contact-form", throttle: 30000 };

let initialized = false;

function ensureInitialized() {
  if (initialized) return;
  emailjs.init({
    publicKey: PUBLIC_KEY,
    blockHeadless: true,
    limitRate: { id: "credentials-email", throttle: 30000 },
  });
  initialized = true;
}

function hasEmailJsBase() {
  return Boolean(PUBLIC_KEY && SERVICE_ID);
}

export function isEmailServiceConfigured() {
  return hasEmailJsBase() && Boolean(TEMPLATE_ID);
}

export function isContactFormConfigured() {
  return hasEmailJsBase() && Boolean(CONTACT_TEMPLATE_ID);
}

export async function sendCredentialsEmail({ toEmail, loginEmail, password }) {
  if (!isEmailServiceConfigured()) {
    throw new Error("Email delivery is not configured.");
  }
  ensureInitialized();

  return emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_email: toEmail,
    login_email: loginEmail,
    password,
    login_url: `${window.location.origin}/auth`,
  });
}

function contactErrorMessage(error) {
  if (error?.status === 429) {
    return "You've just sent a message. Please wait a moment before trying again.";
  }
  if (error?.status === 451) {
    return "This browser can't send messages. Please try again from a regular browser window.";
  }
  if (error?.status === 400 || error?.status === 412) {
    return "The contact form isn't set up correctly right now. Please try again later.";
  }
  return "We couldn't send your message. Please check your connection and try again.";
}

export async function sendContactMessage({ name, email, message }) {
  if (!isContactFormConfigured()) {
    throw new Error("The contact form is unavailable right now.");
  }
  ensureInitialized();

  try {
    return await emailjs.send(
      SERVICE_ID,
      CONTACT_TEMPLATE_ID,
      {
        name,
        message,
        site_url: window.location.origin,
        to_email: email,
      },
      { limitRate: CONTACT_RATE_LIMIT },
    );
  } catch (error) {
    throw new Error(contactErrorMessage(error));
  }
}
