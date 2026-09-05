import {describe,expect,it} from 'vitest';import {executeCommand} from '../executor';import {parseCommand} from '../parser';
describe('Phase 1 command execution',()=>{
 it('executes structured footprint workflow',async()=>{const output=await executeCommand(parseCommand('footprint domain example.com',{analystId:'A'}));expect(output.result?.kind).toBe('footprint');expect(output.result?.confidence.score).toBe(82)});
 it('executes every recon stage',async()=>{const output=await executeCommand(parseCommand('recon domain example.org',{analystId:'A'}));expect(output.result?.stages.map(s=>s.label)).toContain('CORRELATION');expect(output.lines.at(-1)).toContain('OPENING')});
 it('supports a quoted organization footprint',async()=>{const output=await executeCommand(parseCommand('footprint organization "Example Corp"',{analystId:'A'}));expect(output.result?.target).toBe('Example Corp');expect(output.result?.targetType).toBe('organization')});
 it('validates footprint syntax',async()=>{const output=await executeCommand(parseCommand('footprint domain',{analystId:'A'}));expect(output.title).toBe('VALIDATION ERROR')});
});
