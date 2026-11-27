// Business details, and the starter content shown until the admin saves their own in the database.
export const CONTACT = {
  phone: '+2768932383',          // check this number: it is one digit short for South Africa
  email: 'mo2ittech@gmail.com'
};

const s = (order, id, category, name, price, monthly, text) => ({ order, id, category, name, price, monthly, text });
const t = (order, id, name, text) => ({ order, id, name, text });

// The prices here are EXAMPLES. Change them from the admin page.
export const DEFAULTS = {
  services: [
    s(10, 'landing',  'Websites', 'One-page website', 2500, false, 'A single page that introduces you and collects enquiries.'),
    s(20, 'business', 'Websites', 'Business website', 6500, false, 'Several pages with a contact form, built for phones and computers.'),
    s(30, 'store',    'Websites', 'Online store', 12000, false, 'Products, a cart and orders.'),
    s(40, 'payments', 'Websites', 'Payment system integration', 3500, false, 'Take payments on your site through a payment provider. Provider fees are separate.'),
    s(50, 'app',      'Mobile apps', 'Mobile app', 25000, false, 'An app for Android or iOS.'),
    s(60, 'appboth',  'Mobile apps', 'Android and iOS app', 38000, false, 'One app for both platforms.'),
    s(70, 'proto',    'Design', 'Prototype design', 2000, false, 'A clickable model of your idea.'),
    s(80, 'uiux',     'Design', 'UI/UX design', 4000, false, 'User flows and screen designs.'),
    s(90, 'hosting',  'Cloud, hosting and servers', 'Web hosting', 150, true, 'We host your website and keep it online.'),
    s(100, 'cloudsvc', 'Cloud, hosting and servers', 'Cloud services', 800, true, 'Cloud storage, databases and setup.'),
    s(110, 'server',  'Cloud, hosting and servers', 'Server management', 1500, true, 'Updates, backups and monitoring for your servers.')
  ],
  mastery: [
    t(10, 'm-web', 'Websites and web systems', 'Fast, clear sites that work on phones and computers.'),
    t(20, 'm-app', 'Mobile apps', 'Apps people can use without being taught.'),
    t(30, 'm-ux', 'UI/UX design', 'Straightforward screens and flows, tried as prototypes first.'),
    t(40, 'm-pay', 'Payment integration', 'Sites connected to a payment system.'),
    t(50, 'm-cloud', 'Cloud, hosting and servers', 'Setting up, hosting and managing what we build.')
  ],
  faqs: [
    { order: 10, id: 'f-cost', q: 'How much will my project cost?', a: 'Use the quote builder for a starting estimate. We confirm the final price with you after we understand what you need.' },
    { order: 20, id: 'f-idea', q: 'I only have an idea. Can you still help?', a: 'Yes. Choose prototype design or custom, describe the idea, and we take it from there.' },
    { order: 30, id: 'f-pay', q: 'Can my website take payments?', a: 'Yes, we build sites integrated with a payment system. The payment provider charges its own fees.' },
    { order: 40, id: 'f-host', q: 'Do you host the site after building it?', a: 'We offer web hosting, cloud services and server management as monthly services.' },
    { order: 50, id: 'f-quote', q: 'Can I download my quotation?', a: 'Yes. After you send a quote request you can download it as a PDF or an image. If you were signed in, you can also download it later from your profile.' },
    { order: 60, id: 'f-account', q: 'Do I need an account?', a: 'No. An account lets you message the team and see your past requests. You can create one with Google or email.' }
  ],
  projects: [],
  promotions: []
};
export const rand = n => 'R' + String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
