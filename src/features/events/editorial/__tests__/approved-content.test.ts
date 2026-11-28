import {
  editorialLocales,
  reviewedEditorialContent,
  type ReviewedEditorialContent,
} from '../approved-content';
import { eventsRegistry } from '@/config/events.registry';

const tokens = (value: string) => [...value.matchAll(/\{([A-Za-z][A-Za-z0-9]*)\}/g)].map(match => match[1]).sort();
const records: ReviewedEditorialContent[] = Object.values(reviewedEditorialContent);

describe('reviewed editorial adapter input', () => {
  it('keeps editorial choices separate from activation and runtime availability', () => {
    for (const record of records) {
      expect(record.status).toBe('reviewed_choices_only');
      expect(record.publicActivationApproved).toBe(false);
      expect(eventsRegistry[record.event]).toBeDefined();
      expect(record.sourceSHA).toMatch(/^[a-f0-9]{40}$/);
      expect(record.sourceWorkbook).toMatch(/^docs\/.+\.xlsx$/);
    }
    expect(Object.keys(reviewedEditorialContent)).not.toContain('community');
    expect(Object.keys(reviewedEditorialContent)).not.toContain('birthday');
    expect(Object.keys(reviewedEditorialContent)).not.toContain('fifty');
  });

  it('preserves event namespaces, complete languages and interpolation tokens', () => {
    for (const record of records) {
      for (const [key, copy] of Object.entries(record.referenceCopy)) {
        expect(key.startsWith(`${record.event}.`) || key === `events.${record.event}`).toBe(true);
        expect(Object.keys(copy).sort()).toEqual([...editorialLocales].sort());
        for (const locale of editorialLocales) {
          expect(copy[locale].trim()).not.toBe('');
          expect(tokens(copy[locale])).toEqual(tokens(copy.it));
        }
      }
      for (const key of [...record.approvedChoices.sceneKeys, ...record.approvedChoices.roleKeys, ...record.approvedChoices.invitationKeys]) {
        expect(record.referenceCopy[key]).toBeDefined();
      }
    }
  });

  it('limits invitation examples to public wording and rejects private-note interpolation', () => {
    const allowedTokens = new Set(['childName', 'name', 'eventDate', 'ceremonyTime', 'ceremonyPlace', 'receptionTime', 'receptionPlace', 'rsvpDate', 'graduateName', 'personName']);
    for (const record of records) {
      for (const key of record.approvedChoices.invitationKeys) {
        for (const value of Object.values(record.referenceCopy[key])) {
          for (const token of tokens(value)) expect(allowedTokens.has(token)).toBe(true);
          expect(value).not.toMatch(/\{(?:privateNotes|notes|foodNeeds|guestNotes|email|phone|address)\}/i);
        }
      }
    }
  });

  it('retains the specific reviewed roles, voice and visual choices without inventing unspecified tone', () => {
    const { baptism, communion, graduation, confirmation } = reviewedEditorialContent;
    expect(baptism.referenceCopy['baptism.setup.communityName'].it).toBe('Comunità scelta');
    expect(baptism.referenceCopy['baptism.dashboard.reception'].it).toBe('Ritrovo');
    expect(communion.approvedChoices.tone).toBe('solemn');
    expect(graduation.approvedChoices.invitationVoice).toBe('self_first_person_other_names_graduate');
    expect(graduation.approvedChoices.tone).toBeNull();
    expect(confirmation.referenceCopy['confirmation.setup.personName'].it).toBe('Nome di chi riceve la Cresima');
    expect(confirmation.referenceCopy['confirmation.community.sponsorSuggestion'].it).toBe('Padrino o Madrina');
    expect(confirmation.referenceCopy['confirmation.photo.ceremonyAlt'].it).toMatch(/persona adulta.+chi la accompagna/);
    expect(confirmation.approvedChoices.tone).toBeNull();
  });
});
