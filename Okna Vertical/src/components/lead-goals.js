import { redirectTarget } from '../../seo-pages/redirects.js';

export function pageLeadGoal(pathname) {
 const canonicalPath = redirectTarget(pathname) || pathname;
 const page = canonicalPath.replace(/\/index\.html$/, '/').replace(/^\/+|\/+$/g, '') || 'home';
 return 'lead_form_submit_' + page.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
}

export function metrikaLeadGoals(pathname, city, balconyPage = false) {
 const goals = new Set(['lead_form_submit', pageLeadGoal(pathname)]);
 // Keep existing campaign goals without sending a page goal twice.
 if (balconyPage) goals.add('lead_form_submit_balkony');
 else if (city) goals.add('lead_form_submit_' + city);
 return [...goals];
}
