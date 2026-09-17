/**
 * Список страниц сборки. Порядок влияет на карту сайта.
 */
import home from './home.mjs';
import howItWorks from './how-it-works.mjs';
import markets from './markets.mjs';
import calculator from './calculator.mjs';
import faq from './faq.mjs';
import contacts from './contacts.mjs';
import privacy from './privacy.mjs';
import { thanks, notFound } from './extra.mjs';

export const pages = [home, howItWorks, markets, calculator, faq, contacts, privacy, thanks, notFound];
