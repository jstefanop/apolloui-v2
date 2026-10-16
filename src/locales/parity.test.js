import en from './en.json';
import itMessages from './it.json';
import de from './de.json';
import es from './es.json';
import { flattenMessages } from '../lib/utils';

// A key missing from one locale shows on screen as the key itself (or as the
// English default, in the places that carry one) — in a language the person
// chose precisely so as not to read English.
const flat = {
  en: flattenMessages(en),
  it: flattenMessages(itMessages),
  de: flattenMessages(de),
  es: flattenMessages(es),
};

describe.each(['it', 'de', 'es'])('%s locale', (locale) => {
  it('has exactly the keys of en', () => {
    const keys = Object.keys(flat[locale]);
    const base = Object.keys(flat.en);
    expect(base.filter((k) => !(k in flat[locale]))).toEqual([]);
    expect(keys.filter((k) => !(k in flat.en))).toEqual([]);
  });

  it('translates the backend-offline title rather than copying the English', () => {
    expect(flat[locale]['backend_offline.title']).not.toBe(flat.en['backend_offline.title']);
  });

  it('has no empty text', () => {
    expect(Object.entries(flat[locale]).filter(([, v]) => v === '')).toEqual([]);
  });
});
