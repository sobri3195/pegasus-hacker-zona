import {beforeEach,describe,expect,it,vi} from 'vitest';
import {createDomainIntelligence} from '../domainService';
import {executeCommand} from '../../command/executor';
import {parseCommand} from '../../command/parser';
describe('Domain Infrastructure Intelligence V2',()=>{
 beforeEach(()=>vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>({provider:'TEST DNS + RDAP',retrievedAt:'2026-09-08T00:00:00.000Z',durationMs:4,records:{a:['93.184.216.34'],aaaa:[],mx:[],ns:['a.iana-servers.net'],txt:[],rdap:{handle:'TEST',events:[{eventAction:'registration',eventDate:'2020-01-01T00:00:00Z'}]}},errors:[]})}))));
 it('builds a sourced infrastructure summary, graph, timeline, changes, and explainable risks',async()=>{const r=await createDomainIntelligence('Example.COM','infra-history');expect(r.target).toBe('example.com');expect(r.summary.currentIps.length).toBeGreaterThan(0);expect(r.relationships.map(x=>x.type)).toContain('RESOLVES_TO');expect(r.mocked).toBe(false);expect(r.findings.every(x=>x.provenance.source&&x.provenance.retrievedAt)).toBe(true)});
 it.each(['domain','recon','infra','infra-history','cert','dns','subdomains'])('supports %s example.com',async command=>{const output=await executeCommand(parseCommand(`${command} example.com`,{analystId:'A'}));expect(output.result?.kind).toBe('domain-v2')});
 it('supports legacy recon domain syntax and rejects invalid domains safely',async()=>{expect((await executeCommand(parseCommand('recon domain example.org',{analystId:'A'}))).result?.target).toBe('example.org');expect((await executeCommand(parseCommand('domain localhost',{analystId:'A'}))).title).toBe('VALIDATION ERROR')});
});
