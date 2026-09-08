import {beforeEach,describe,expect,it} from 'vitest';
import {parseCommand} from '../../command/parser';
import {executePersona,resetPersonaStore} from '../personaService';

const run=(raw:string)=>executePersona(parseCommand(raw,{analystId:'ANALYST-1'}));
describe('Persona Intelligence authorization and analyst gates',()=>{
 beforeEach(()=>resetPersonaStore());
 it('requires a lawful purpose when creating a person',()=>{expect(run('person create "Muhammad Example"')?.title).toBe('AUTHORIZATION REQUIRED')});
 it('creates an auditable person without sensitive seeds',()=>{const out=run('person create "Muhammad Example" --purpose self-audit');expect(out?.result?.kind).toBe('persona');expect(out?.result?.authorization).toBe('PENDING');expect(out?.lines.join(' ')).toContain('PERSON-001')});
 it('blocks collection until authorization and scope are confirmed',()=>{run('person create "Muhammad Example" --purpose self-audit');expect(run('person search PERSON-001 --platform all')?.title).toBe('AUTHORIZATION & SCOPE REQUIRED');const authorized=run('person authorize PERSON-001 --case CASE-2026-001');expect(authorized?.result?.scopeConfirmed).toBe(true);expect(run('person search PERSON-001 --platform all')?.lines).toContain('No candidate has been automatically confirmed.')});
 it('preserves provenance for public seed updates',()=>{run('person create "Muhammad Example" --purpose self-audit');const out=run('person add-username PERSON-001 example_user');expect(out?.result?.findings[0].provenance.sourceUrl).toBeUndefined();expect(out?.result?.usernames).toContain('example_user')});
});
