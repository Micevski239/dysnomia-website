import type { Exhibition, ExhibitionCity } from '../types';

export const ART_SCENE_PATH = '/art-scena';

export const EXHIBITION_CITIES: { id: ExhibitionCity; en: string; mk: string }[] = [
  { id: 'skopje', en: 'Skopje', mk: 'Скопје' },
  { id: 'bitola', en: 'Bitola', mk: 'Битола' },
  { id: 'ohrid', en: 'Ohrid', mk: 'Охрид' },
  { id: 'prilep', en: 'Prilep', mk: 'Прилеп' },
  { id: 'kavadarci', en: 'Kavadarci', mk: 'Кавадарци' },
  { id: 'shtip', en: 'Shtip', mk: 'Штип' },
  { id: 'other', en: 'Other cities', mk: 'Други градови' },
];

export type ExhibitionStatus = 'current' | 'upcoming' | 'ended';

/** Macedonian is the primary language of this content: English falls back to it, and vice versa. */
export function pickText(en: string | null | undefined, mk: string | null | undefined, language: string): string {
  return (language === 'mk' ? mk || en : en || mk) || '';
}

export function cityName(city: ExhibitionCity, language: string): string {
  const entry = EXHIBITION_CITIES.find((c) => c.id === city);
  return entry ? (language === 'mk' ? entry.mk : entry.en) : '';
}

/** Place name for "in …" phrases; exhibitions outside the listed cities read as "in North Macedonia". */
export function cityForPhrase(city: ExhibitionCity, language: string): string {
  if (city === 'other') return language === 'mk' ? 'Македонија' : 'North Macedonia';
  return cityName(city, language);
}

/** Today's date (YYYY-MM-DD) in Macedonia, so the status flips at local midnight. */
export function todayInSkopje(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Skopje' }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/** Worked out from the dates every time, so it never needs to be changed by hand. */
export function exhibitionStatus(ex: Pick<Exhibition, 'start_date' | 'end_date'>, today = todayInSkopje()): ExhibitionStatus {
  if (ex.start_date > today) return 'upcoming';
  if (ex.end_date && ex.end_date < today) return 'ended';
  return 'current';
}

function dayMonth(date: string): string {
  const [, m, d] = date.split('-');
  return `${d}.${m}`;
}

function fullDate(date: string): string {
  const [y, m, d] = date.split('-');
  return `${d}.${m}.${y}`;
}

/** "18.09 – 22.10.2026", "18.12.2026 – 10.01.2027", or "from 18.09.2026" when there is no end date. */
export function formatDateRange(start: string, end: string | null, language: string): string {
  if (!end) return `${language === 'mk' ? 'од' : 'from'} ${fullDate(start)}`;
  if (start === end) return fullDate(start);
  return start.slice(0, 4) === end.slice(0, 4)
    ? `${dayMonth(start)} – ${fullDate(end)}`
    : `${fullDate(start)} – ${fullDate(end)}`;
}

/** Google title: "Ирена Паскали – „Пресек“ | Изложба во Скопје" unless the admin wrote one. */
export function exhibitionSeoTitle(ex: Exhibition, language: string): string {
  const custom = pickText(ex.seo_title, ex.seo_title_mk, language);
  if (custom) return custom;
  const artist = pickText(ex.artist, ex.artist_mk, language);
  const title = pickText(ex.title, ex.title_mk, language);
  const place = cityForPhrase(ex.city, language);
  return language === 'mk'
    ? `${artist} – „${title}“ | Изложба во ${place}`
    : `${artist} – “${title}” | Art Exhibition in ${place}`;
}

/** Google description (≤160 chars) unless the admin wrote one. */
export function exhibitionSeoDescription(ex: Exhibition, language: string): string {
  const custom = pickText(ex.seo_description, ex.seo_description_mk, language);
  if (custom) return custom;
  const artist = pickText(ex.artist, ex.artist_mk, language);
  const title = pickText(ex.title, ex.title_mk, language);
  const venue = pickText(ex.venue, ex.venue_mk, language);
  const place = cityForPhrase(ex.city, language);
  const solo = ex.exhibition_type === 'solo';
  const text =
    language === 'mk'
      ? `„${title}“ на ${artist} – ${solo ? 'самостојна' : 'групна'} изложба во ${venue}, ${place}. Погледнете период, локација и информации за изложбата.`
      : `“${title}” by ${artist} – ${solo ? 'a solo' : 'a group'} exhibition at ${venue}, ${place}. See dates, location and visitor information.`;
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

/** Slug from artist + title, e.g. "irena-paskali-presek". */
export function exhibitionSlugSource(artistMk: string, titleMk: string): string {
  return `${artistMk} ${titleMk}`.trim();
}
