import {describe,expect,it} from 'vitest';
import {confidenceFor,unwrapGoogleUrl} from '../googleClient';

describe('client-side Google result normalization',()=>{
 it('unwraps Google redirect links and rejects Google-owned navigation',()=>{
  expect(unwrapGoogleUrl('/url?q=https%3A%2F%2Fwww.linkedin.com%2Fin%2Fnadia%3Ftrk%3Dtest')).toBe('https://www.linkedin.com/in/nadia?trk=test');
  expect(unwrapGoogleUrl('https://www.google.com/preferences')).toBeUndefined();
 });

 it('scores exact target terms in title and snippet above weak matches',()=>{
  expect(confidenceFor('Nadia Pratama','Nadia Pratama | LinkedIn','Profil profesional Nadia Pratama')).toBe(95);
  expect(confidenceFor('Nadia Pratama','Unrelated account','A public profile')).toBe(35);
 });
});
