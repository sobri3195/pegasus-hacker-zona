import { z } from 'zod';
import type { CommandFlagValue, ParsedCommand, ParsedStage } from '../../types/command';
import { resolveCommand } from './commandRegistry';
const tokenPattern = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|([^\s]+)/g;
const unsafePattern = /(?:brute[\s-]?force|credential[-\s](?:stuffing|harvesting)|password[-\s]?(?:crack|steal)|deploy malware|install spyware|(?:run|execute|weaponize|active)[-\s]exploit|lateral[-\s]movement|establish persistence|unauthorized[-\s]?(?:access|login)|stealth[-\s]?track|doxx|remote[-\s]?(?:intrusion|shell))/i;
const segmentSchema=z.string().trim().min(1,'Command cannot be empty').max(500,'Command is too long');
export class CommandParseError extends Error {}
function tokenize(segment:string){const tokens:string[]=[]; for(const match of segment.matchAll(tokenPattern)) tokens.push((match[1]??match[2]??match[3]).replace(/\\(["'])/g,'$1')); return tokens;}
function parseStage(segment:string):ParsedStage { const tokens=tokenize(segment); const command=(tokens.shift()??'').toLowerCase(); if(!resolveCommand(command)) throw new CommandParseError(`Unknown command “${command}”. Type help to view authorized commands.`); const args:string[]=[]; const flags:Record<string,CommandFlagValue>={}; for(let i=0;i<tokens.length;i++){const token=tokens[i]; if(token.startsWith('--')){const [rawKey,inline]=token.slice(2).split('=',2); if(!rawKey) throw new CommandParseError('Flag name cannot be empty.'); const next=inline??tokens[i+1]; if(inline===undefined&&next&&!next.startsWith('--')) i++; let value:CommandFlagValue=next&&!next.startsWith('--')?next:true; if(typeof value==='string'&&/^\d+$/.test(value)) value=Number(value); flags[rawKey]=value;} else args.push(token);} return {command:resolveCommand(command)?.name??command,args,flags}; }
const actionNamespaces=new Set(['username','person','email','claim','evidence','report','command','case','profile','social']);
const targetTypes:Record<string,string>={username:'username',person:'person',email:'email',domain:'domain',evidence:'evidence',report:'report',claim:'claim'};
function toAst(stage:ParsedStage,rawInput:string){
 const hasAction=actionNamespaces.has(stage.command);const action=hasAction?stage.args[0]:undefined;const rest=hasAction?stage.args.slice(1):stage.args;
 if(hasAction&&!action) throw new CommandParseError(`Invalid syntax: ${stage.command} requires an action.`);
 const subAction=stage.command==='command'?action:undefined;
 const target=rest[0];
 const requiresConfirmation=['export','redact','verify'].includes(action??'')||stage.command==='report'&&action==='export';
 return {namespace:stage.command,action,subAction,targetType:targetTypes[stage.command],target,positionalArguments:rest.slice(1),flags:stage.flags,rawInput,requiresConfirmation};
}
export function isBlockedCommand(raw:string){return unsafePattern.test(raw);}
export function parseCommand(raw:string, context:{analystId:string;investigationId?:string}):ParsedCommand {const clean=segmentSchema.parse(raw); if(/[;&`]|\$\(|\|\|/.test(clean))throw new CommandParseError('BLOCKED: Operating-system syntax is not accepted.');if(isBlockedCommand(clean)) throw new CommandParseError('BLOCKED: Unauthorized access or harmful capability is disabled.'); const segments=clean.split('|').map(s=>s.trim()); if(segments.some(s=>!s)) throw new CommandParseError('Pipeline contains an empty stage.'); const [first,...pipeline]=segments.map(parseStage); return {...first,ast:toAst(first,clean),raw:clean,pipeline,timestamp:new Date().toISOString(),...context};}
