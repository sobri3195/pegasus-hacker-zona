import {describe,expect,it} from 'vitest';import {executeCommand} from '../executor';import {parseCommand} from '../parser';
describe('Phase 1 command execution',()=>{
 it('executes structured footprint workflow',async()=>{const output=await executeCommand(parseCommand('footprint domain example.com',{analystId:'A'}));expect(output.result?.kind).toBe('footprint');expect(output.result?.confidence.score).toBe(82)});
 it('executes every recon stage',async()=>{const output=await executeCommand(parseCommand('recon domain example.org',{analystId:'A'}));expect(output.result?.stages.map(s=>s.label)).toContain('CORRELATION');expect(output.lines.at(-1)).toContain('OPENING')});
 it('supports a quoted organization footprint',async()=>{const output=await executeCommand(parseCommand('footprint organization "Example Corp"',{analystId:'A'}));expect(output.result?.target).toBe('Example Corp');expect(output.result?.targetType).toBe('organization')});
 it('validates footprint syntax',async()=>{const output=await executeCommand(parseCommand('footprint domain',{analystId:'A'}));expect(output.title).toBe('VALIDATION ERROR')});
 it('searches and ranks the frontend public index',async()=>{const output=await executeCommand(parseCommand('search "teknologi indonesia" --limit 2',{analystId:'A'}));expect(output.result?.kind).toBe('search');if(output.result?.kind==='search'){expect(output.result.hits).toHaveLength(2);expect(output.result.hits.flatMap(hit=>hit.matchedTerms)).toContain('teknologi');}});
 it('filters frontend search results by source',async()=>{const output=await executeCommand(parseCommand('news "public data"',{analystId:'A'}));expect(output.result?.kind).toBe('search');if(output.result?.kind==='search')expect(output.result.hits.every(hit=>hit.source==='NEWS')).toBe(true);});
 it('validates frontend search limits',async()=>{const output=await executeCommand(parseCommand('search data --limit 99',{analystId:'A'}));expect(output.title).toBe('VALIDATION ERROR')});
});

import {parseCommand as parsePhone} from '../parser';
it('executes Indonesian phone intelligence with safe empty state',async()=>{const output=await executeCommand(parsePhone('phone lookup +62 812-3456-7891',{analystId:'A'}));expect(output.result?.kind).toBe('phone');expect(output.lines).toContain('E164 .......................... +6281234567891');});
