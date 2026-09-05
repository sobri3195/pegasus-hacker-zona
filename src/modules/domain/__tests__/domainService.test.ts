import {describe,expect,it} from 'vitest';
import {createDomainIntelligence} from '../domainService';
import {executeCommand} from '../../command/executor';
import {parseCommand} from '../../command/parser';
describe('Domain Infrastructure Intelligence V2',()=>{
 it('builds a sourced infrastructure summary, graph, timeline, changes, and explainable risks',async()=>{const r=await createDomainIntelligence('Example.COM','infra-history');expect(r.target).toBe('example.com');expect(r.summary.historicalIps.length).toBeGreaterThan(0);expect(r.relationships.map(x=>x.type)).toContain('ANNOUNCED_BY');expect(r.changes.map(x=>x.type)).toContain('IP CHANGE');expect(r.risks.every(x=>x.explanation&&x.provenance.retrievedAt)).toBe(true);expect(r.findings.every(x=>x.provenance.source&&x.provenance.retrievedAt)).toBe(true)});
 it.each(['domain','recon','infra','infra-history','cert','dns','subdomains'])('supports %s example.com',async command=>{const output=await executeCommand(parseCommand(`${command} example.com`,{analystId:'A'}));expect(output.result?.kind).toBe('domain-v2')});
 it('supports legacy recon domain syntax and rejects invalid domains safely',async()=>{expect((await executeCommand(parseCommand('recon domain example.org',{analystId:'A'}))).result?.target).toBe('example.org');expect((await executeCommand(parseCommand('domain localhost',{analystId:'A'}))).title).toBe('VALIDATION ERROR')});
});
