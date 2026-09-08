import {describe,expect,it} from 'vitest'; import {CommandParseError,isBlockedCommand,parseCommand} from '../parser';
describe('application command parser',()=>{it('parses quotes, typed flags and pipelines',()=>{const parsed=parseCommand('search "contoh organisasi" --source web --limit 20 | entity create',{analystId:'ANALYST-04'}); expect(parsed.args).toEqual(['contoh organisasi']); expect(parsed.flags).toEqual({source:'web',limit:20}); expect(parsed.pipeline[0]).toMatchObject({command:'entity',args:['create']});}); it('resolves safe aliases',()=>expect(parseCommand('company "PT Example"',{analystId:'A'}).command).toBe('organization')); it('rejects OS and unknown commands',()=>expect(()=>parseCommand('rm -rf /',{analystId:'A'})).toThrow(CommandParseError)); it('blocks harmful capabilities',()=>expect(isBlockedCommand('brute-force login target')).toBe(true));});

describe('v0.2 command surface',()=>{it('recognizes every fusion module without treating commands as a shell',()=>{for(const command of ['dashboard','watch list','changes compare SNAP-1 SNAP-2','alert list','claim verify CLAIM-001','source score SOURCE-001','resolve duplicates','org profile Example','ioc inspect example.com','cve CVE-2026-0001','threat campaign Example','exposure findings','collection analyze COL-001','capture url https://example.com','note add CASE-1','playbook list','access status','audit show','ask case CASE-1 question','ai gaps CASE-1','saved-query run SQ-001'])expect(parseCommand(command,{analystId:'A'}).command).toBe(command.split(' ')[0])});it('rejects shell separators',()=>expect(()=>parseCommand('watch list; rm -rf /',{analystId:'A'})).toThrow(CommandParseError))});

describe('CommandAST v2',()=>{
 it.each([
  ['username search sobri3195','username','search','sobri3195'],
  ['username exact sobri3195','username','exact','sobri3195'],
  ['username compare sobri3195 sobri_3195','username','compare','sobri3195'],
  ['person search "Muhammad Sobri Maulana"','person','search','Muhammad Sobri Maulana'],
  ['person search PERSON-001 --platform github','person','search','PERSON-001'],
  ['email references user@example.com','email','references','user@example.com'],
  ['domain rumahweb.com','domain',undefined,'rumahweb.com'],
  ['claim create "Isi klaim"','claim','create','Isi klaim'],
  ['evidence verify E-100','evidence','verify','E-100'],
  ['report export REP-001 --format pdf','report','export','REP-001'],
 ])('parses %s without treating the action as target',(raw,namespace,action,target)=>{const ast=parseCommand(raw,{analystId:'A'}).ast;expect(ast).toMatchObject({namespace,action,target});});
 it('separates flags and remaining positional arguments',()=>{const ast=parseCommand('username compare sobri3195 sobri_3195 --platform github',{analystId:'A'}).ast;expect(ast.positionalArguments).toEqual(['sobri_3195']);expect(ast.flags).toEqual({platform:'github'});});
});
