import type {CommandOutput,ParsedCommand} from '../../types/command';
import {createMockFootprint} from '../providers/types';
import {commandRegistry} from './commandRegistry';
import {createPhoneIntelligence} from '../phone/createPhoneResult';
const wait=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
export async function executeCommand(parsed:ParsedCommand):Promise<CommandOutput>{
 const {command,args}=parsed;
 if(command==='help'){const lines=commandRegistry.reduce<string[]>((all,item,index,array)=>{if(index===0||array[index-1].category!==item.category)all.push('',item.category);all.push(`  ${item.usage.padEnd(38)} ${item.description}`);return all;},[]);return {title:'AUTHORIZED COMMAND REFERENCE',tone:'info',lines};}
 if(command==='status')return {title:'SYSTEM STATUS // NOMINAL',tone:'success',lines:['Mock OSINT provider ...... ONLINE','Correlation engine ....... ONLINE','Audit stream ............. ACTIVE','Current classification ... INTERNAL']};
 if(command==='history')return {title:'QUERY HISTORY',tone:'info',lines:['Open the execution history tray below for commands, status, provider, and duration.']};
 if(command==='clear')return {title:'CLEAR',tone:'info',lines:[]};
 if(command==='phone'){
  const actions=['lookup','footprint','web','documents','graph','timeline','evidence','pivot'];const mode=actions.includes(args[0])?args[0]:'lookup';const raw=(mode==='lookup'&&args[0]!=='lookup'?args:args.slice(1)).join(' ');
  if(!raw)return {title:'VALIDATION ERROR',tone:'warning',lines:['Usage: phone [lookup|footprint|web|documents|graph|timeline|evidence|pivot] <nomor Indonesia>']};
  const result=await createPhoneIntelligence(raw,mode);const m=result.metadata;return {title:'PEGASUS ZONA // PHONE INTELLIGENCE',tone:'success',lines:[`NORMALIZING NUMBER ............ DONE`,`COUNTRY ....................... ${m.country.toUpperCase()}`,`E164 .......................... ${m.e164}`,`PREFIX ........................ ${m.prefix}`,`CARRIER HINT .................. ${m.carrierHint.toUpperCase()}`,`PUBLIC WEB .................... ${result.references.length}`,`RELATIONSHIPS ................. ${result.relationships.length}`,'ANALYSIS COMPLETE',`CONFIDENCE: ${result.confidence.score}%`,'OPENING INTELLIGENCE VIEW...'],result};
 }
 if(command==='case'&&args[0]==='open')return {title:'CASE CONTEXT UPDATED',tone:'success',lines:[`${args[1]??'CASE-2026-001'} is now active.`]};
 if(command==='footprint'){
  const targetType=args[0] as 'domain'|'username'|'organization';const target=args.slice(1).join(' ');if(!['domain','username','organization'].includes(targetType)||!target)return {title:'VALIDATION ERROR',tone:'warning',lines:['Usage: footprint <domain|username|organization> <target>']};
  await wait(180);const result=createMockFootprint(target,'footprint',targetType);return {title:'DIGITAL FOOTPRINT ANALYSIS // COMPLETE',tone:'success',lines:[`TARGET .................... ${result.target}`,`DISCOVERY ................. ${result.findings.length} FINDINGS`,`ENTITIES .................. ${result.findings.filter(f=>f.entityType).length}`,`RELATIONSHIPS ............. ${result.relationships.length}`,`TIMELINE .................. GENERATED`,`CONFIDENCE ................ ${result.confidence.score}%`,'OPENING INTELLIGENCE WORKSPACE...'],result};
 }
 if(command==='recon'){
  if(args[0]!=='domain'||!args[1])return {title:'VALIDATION ERROR',tone:'warning',lines:['Usage: recon domain example.com']};await wait(250);const result=createMockFootprint(args[1],'recon');return {title:'DOMAIN RECON // COMPLETED',tone:'success',lines:[...result.stages.map(s=>`${s.label.padEnd(28,'.')} ✓`),`${result.findings.length} FINDINGS · ${result.relationships.length} RELATIONSHIPS · ${result.timeline.length} EVENTS`,`${(result.durationMs/1000).toFixed(2)} sec · OPENING INVESTIGATION VIEW...`],result};
 }
 if(command==='domain'){if(!args[0])return {title:'VALIDATION ERROR',tone:'warning',lines:['Usage: domain example.com']};const result=createMockFootprint(args[0],'domain');return {title:'DOMAIN INTELLIGENCE COMPLETE',tone:'success',lines:[`${result.findings.length} public-source findings found.`,`Smart Pivot generated ${result.pivots.length} recommended next steps.`],result};}
 if(command==='pivot')return {title:'PEGASUS SMART PIVOT',tone:'info',lines:['Open the active result to review reason, source, confidence, cost, and case context.']};
 if(['graph','timeline'].includes(command))return {title:`${command.toUpperCase()} VIEW READY`,tone:'info',lines:[`Workspace switched to ${command} for ${args.join(' ')||'the active case'}.`]};
 return {title:`${command.toUpperCase()} SEARCH COMPLETE`,tone:'success',lines:[`Authorized mock provider searched for “${args.join(' ')||'current context'}”.`,'No live personal data or protected system was accessed.']};
}
