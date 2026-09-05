import {describe,expect,it} from 'vitest';
import {createUsernameIntelligence,normalizeUsername} from '../usernameService';

describe('username normalization',()=>{
 it.each([['@JohnDoe','johndoe'],['johndoe','johndoe'],['https://example.com/johndoe','johndoe']])('normalizes %s',(input,expected)=>expect(normalizeUsername(input)).toBe(expected));
 it('rejects unsafe or malformed input',()=>expect(()=>normalizeUsername('https://example.com/')).toThrow());
});

describe('public username intelligence',()=>{
 it('produces classified profiles, evidence-backed graph, timeline and pivots',async()=>{const result=await createUsernameIntelligence('@johndoe','footprint');expect(result.profiles).toHaveLength(3);expect(result.profiles[0].match).toBe('EXACT USERNAME MATCH');expect(result.profiles.every(p=>p.signals.length>=8)).toBe(true);expect(result.relationships.some(r=>r.type==='APPEARS_ON')).toBe(true);expect(result.timeline.length).toBe(3);expect(result.pivots).toHaveLength(6);expect(result.disclaimer).toContain('not proof');});
 it('marks comparison output as inference',async()=>{const result=await createUsernameIntelligence('johndoe','compare','john_doe');expect(result.comparison?.inference).toBe(true);expect(result.comparison?.conclusion).toBe('LIKELY SAME DIGITAL IDENTITY');});
});
