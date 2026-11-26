// ===== EDIT YOUR BUSINESS DETAILS AND PRICES HERE =====
export const CONTACT = {
  phone: '+2768932383',          // check this number: it is one digit short for South Africa
  email: 'mo2ittech@gmail.com'
};

// price is a starting price in rand. monthly: true means "per month".
// These are EXAMPLE prices. Change them to your real ones.
export const CATALOGUE = [
  { id: 'web', title: 'Websites', items: [
    { id: 'landing',  name: 'One-page website',        price: 2500,  text: 'A single page that introduces you and collects enquiries.' },
    { id: 'business', name: 'Business website',        price: 6500,  text: 'Several pages with a contact form, built for phones and computers.' },
    { id: 'store',    name: 'Online store',            price: 12000, text: 'Products, a cart and orders.' },
    { id: 'payments', name: 'Payment system integration', price: 3500, text: 'Take payments on your site through a payment provider. Provider fees are separate.' }
  ]},
  { id: 'apps', title: 'Mobile apps', items: [
    { id: 'app',      name: 'Mobile app',              price: 25000, text: 'An app for Android or iOS.' },
    { id: 'appboth',  name: 'Android and iOS app',     price: 38000, text: 'One app for both platforms.' }
  ]},
  { id: 'design', title: 'Design', items: [
    { id: 'proto',    name: 'Prototype design',        price: 2000,  text: 'A clickable model of your idea.' },
    { id: 'uiux',     name: 'UI/UX design',            price: 4000,  text: 'User flows and screen designs.' }
  ]},
  { id: 'cloud', title: 'Cloud, hosting and servers', items: [
    { id: 'hosting',  name: 'Web hosting',             price: 150,  monthly: true, text: 'We host your website and keep it online.' },
    { id: 'cloudsvc', name: 'Cloud services',          price: 800,  monthly: true, text: 'Cloud storage, databases and setup.' },
    { id: 'server',   name: 'Server management',       price: 1500, monthly: true, text: 'Updates, backups and monitoring for your servers.' }
  ]}
];
export const rand = n => 'R' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
