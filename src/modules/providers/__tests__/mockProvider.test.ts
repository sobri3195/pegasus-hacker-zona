import {describe,expect,it} from 'vitest';
import {createMockFootprint,isValidPublicDomain,normalizeDomain} from '../types';
describe('Phase 1 public OSINT provider',()=>{
 it('normalizes and validates public domain input',()=>{expect(normalizeDomain('HTTPS://Example.COM/path')).toBe('example.com');expect(isValidPublicDomain('example.com')).toBe(true);expect(isValidPublicDomain('localhost')).toBe(false)});
 it('returns evidence-backed entities, relationships and pivots',()=>{const result=createMockFootprint('example.com','footprint');expect(result.findings.length).toBeGreaterThan(10);expect(result.findings.every(f=>f.provenance.id&&f.provenance.method)).toBe(true);expect(result.relationships.every(r=>r.sourceId&&r.validationStatus==='UNVERIFIED')).toBe(true);expect(result.pivots.every(p=>p.reason&&p.expectedOutput&&p.dataSource&&p.confidence&&p.estimatedCost&&p.caseContext)).toBe(true)});
 it('rejects invalid domains before a provider query',()=>expect(()=>createMockFootprint('127.0.0.1','recon')).toThrow('valid public domain'));
});
