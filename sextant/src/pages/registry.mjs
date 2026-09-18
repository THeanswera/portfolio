/** Список страниц сайта в порядке сборки. */
import home from './home.mjs';
import collection from './collection.mjs';
import calibre from './calibre.mjs';
import configurator from './configurator.mjs';
import atelier from './atelier.mjs';
import service from './service.mjs';
import gallery from './gallery.mjs';
import contacts from './contacts.mjs';
import privacy from './privacy.mjs';
import extra from './extra.mjs';

export default [home, collection, calibre, configurator, atelier, service, gallery, contacts, privacy, ...extra];
