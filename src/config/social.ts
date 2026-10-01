/**
 * Social profiles and contact details — the only place these are defined.
 * Footer, About, Contact and SEO structured data all read from here, so a
 * future rename is a one-line change. scripts/check-site.mjs fails the build
 * if an old, deleted handle reappears anywhere in the source.
 */
export const SOCIAL_LINKS = {
  instagram: {
    handle: '@dysnomia.gallery',
    url: 'https://www.instagram.com/dysnomia.gallery/',
  },
  facebook: {
    name: 'Dysnomia Art Gallery',
    url: 'https://www.facebook.com/profile.php?id=61575933645818',
  },
} as const;

export const CONTACT_EMAIL = 'contact_dysnomia@yahoo.com';
