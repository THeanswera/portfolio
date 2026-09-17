/** Список страниц сборки. Порядок влияет на карту сайта. */
import home from './home.mjs';
import configurator from './configurator.mjs';
import projects from './projects.mjs';
import materials from './materials.mjs';
import production from './production.mjs';
import contacts from './contacts.mjs';
import privacy from './privacy.mjs';
import { thanks, notFound } from './extra.mjs';
import { projectPages } from './project.mjs';

export const pages = [
  home,
  configurator,
  projects,
  ...projectPages,
  materials,
  production,
  contacts,
  privacy,
  thanks,
  notFound,
];
