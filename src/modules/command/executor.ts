import type {CommandOutput,ParsedCommand} from '../../types/command';
import {createMockFootprint} from '../providers/types';
import {commandRegistry} from './commandRegistry';
import {createPhoneIntelligence} from '../phone/createPhoneResult';
import {createUsernameIntelligence} from '../username/usernameService';
import {createEmailIntelligence} from '../email/emailService';
import {createDocumentIntelligence} from '../document/documentService';
const wait=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
export async function executeCommand(parsed:ParsedCommand):Promise<CommandOutput>{
 const {command,args}=parsed;
 if(command==='help'){const lines=commandRegistry.reduce<string[]>((all,item,index,array)=>{if(index===0||array[index-1].category!==item.category)all.push('',item.category);all.push(`  ${item.usage.padEnd(38)} ${item.description}`);return all;},[]);return {title:'AUTHORIZED COMMAND REFERENCE',tone:'info',lines};}
 if(command==='status')return {title:'SYSTEM STATUS // NOMINAL',tone:'success',lines:['Mock OSINT provider ...... ONLINE','Correlation engine ....... ONLINE','Audit stream ............. ACTIVE','Current classification ... INTERNAL']};
 if(command==='history')return {title:'QUERY HISTORY',tone:'info',lines:['Open the execution history tray below for commands, status, provider, and duration.']};
 if(command==='clear')return {title:'CLEAR',tone:'info',lines:[]};
 if(command==='document'){
  const modes=['analyze','entities','metadata','links','timeline'] as const;const mode=modes.includes(args[0] as typeof modes[number])?args[0] as typeof modes[number]:undefined;const file=args.slice(1).join(' ');
  if(!mode||!file)return {title:'VALIDATION ERROR',tone:'warning',lines:['Usage: document <analyze|entities|metadata|links|timeline> <file>','Supported: PDF · DOCX · XLSX · PPTX · TXT · HTML']};
  const result=createDocumentIntelligence(file,mode);return {title:'PEGASUS DOCUMENT INTELLIGENCE // COMPLETE',tone:'success',lines:[`FILE ........................... ${result.metadata.name}`,`MIME ........................... ${result.metadata.mime}`,`SHA256 ......................... ${result.metadata.sha256}`,`ENTITIES ....................... ${result.entities.length}`,`LINKS .......................... ${result.links.length}`,`ANOMALIES ...................... ${result.anomalies.length} · REQUIRES REVIEW`,'SOURCE PRESERVED · DERIVATIVE ANALYSIS STORED SEPARATELY','OPENING DOCUMENT WORKSPACE...'],result};
 }
 if(command==='email'){
  const actions=['lookup','footprint','web','documents','graph','timeline','pivot','exposure'];const mode=actions.includes(args[0])?args[0]:'lookup';const raw=mode==='lookup'&&args[0]!=='lookup'?args[0]:args[1];if(!raw)return {title:'VALIDATION ERROR',tone:'warning',lines:['Usage: email [lookup|footprint|web|documents|graph|timeline|pivot|exposure] <email>']};
  const result=await createEmailIntelligence(raw,mode as Parameters<typeof createEmailIntelligence>[1]);const m=result.metadata;return {title:'EMAIL INTELLIGENCE // PUBLIC EXPOSURE',tone:'success',lines:[`LOCAL PART ..................... ${m.localPart}`,`DOMAIN ......................... ${m.domain}`,`VALID FORMAT ................... YES`,`MX STATUS ..................... ${m.mxStatus}`,`MAIL PROVIDER .................. ${m.mailProvider}`,`PUBLIC MENTIONS ................ ${result.mentions.length}`,`EXPOSURE STATUS ................ ${result.exposure.status.toUpperCase()}`,`CONFIDENCE ..................... ${result.confidence.score}%`,'PUBLIC/AUTHORIZED DATA ONLY · NO CREDENTIAL CONTENT'],result};
 }
 if(command==='phone'){
  const actions=['lookup','footprint','web','documents','graph','timeline','evidence','pivot'];const mode=actions.includes(args[0])?args[0]:'lookup';const raw=(mode==='lookup'&&args[0]!=='lookup'?args:args.slice(1)).join(' ');
  if(!raw)return {title:'VALIDATION ERROR',tone:'warning',lines:['Usage: phone [lookup|footprint|web|documents|graph|timeline|evidence|pivot] <nomor Indonesia>']};
  const result=await createPhoneIntelligence(raw,mode);const m=result.metadata;return {title:'PEGASUS ZONA // PHONE INTELLIGENCE',tone:'success',lines:[`NORMALIZING NUMBER ............ DONE`,`COUNTRY ....................... ${m.country.toUpperCase()}`,`E164 .......................... ${m.e164}`,`PREFIX ........................ ${m.prefix}`,`CARRIER HINT .................. ${m.carrierHint.toUpperCase()}`,`PUBLIC WEB .................... ${result.references.length}`,`RELATIONSHIPS ................. ${result.relationships.length}`,'ANALYSIS COMPLETE',`CONFIDENCE: ${result.confidence.score}%`,'OPENING INTELLIGENCE VIEW...'],result};
 }
 if(command==='username'){
  const actions=['footprint','web','graph','timeline','pivot','compare'];const mode=actions.includes(args[0])?args[0]:'lookup';const rest=mode==='lookup'?args:args.slice(1);const raw=rest[0];
  if(!raw||(mode==='compare'&&!rest[1]))return {title:'VALIDATION ERROR',tone:'warning',lines:['Usage: username [footprint|web|graph|timeline|pivot] <username>','       username compare <username> <username>']};
  const result=await createUsernameIntelligence(raw,mode as 'lookup'|'footprint'|'web'|'graph'|'timeline'|'pivot'|'compare',rest[1]);const comparison=result.comparison;return {title:comparison?'USERNAME COMPARISON // INFERENCE':'USERNAME INTELLIGENCE // PUBLIC PRESENCE',tone:'success',lines:[`NORMALIZED USERNAME ........... ${result.normalizedUsername}`,`PUBLIC PROFILES ............... ${result.profiles.length}`,`RELATIONSHIPS ................. ${result.relationships.length}`,`CONFIDENCE .................... ${result.confidence.score}%`,...(comparison?[`USERNAME SIMILARITY ........... ${comparison.usernameSimilarity}%`,`CONCLUSION .................... ${comparison.conclusion}`]:[]),'PUBLIC/INDEXED SOURCES ONLY · SAME USERNAME ≠ SAME PERSON'],result};
 }
 if(command==='case'&&args[0]==='open')return {title:'CASE CONTEXT UPDATED',tone:'success',lines:[`${args[1]??'CASE-2026-001'} is now active.`]};
 if(command==='footprint'){
  const targetType=args[0] as 'domain'|'username'|'organization';const target=args.slice(1).join(' ');if(!['domain','username','organization'].includes(targetType)||!target)return {title:'VALIDATION ERROR',tone:'warning',lines:['Usage: footprint <domain|username|organization> <target>']};
  await wait(180);const result=createMockFootprint(target,'footprint',targetType);return {title:'DIGITAL FOOTPRINT ANALYSIS // COMPLETE',tone:'success',lines:[`TARGET .................... ${result.target}`,`DISCOVERY ................. ${result.findings.length} FINDINGS`,`ENTITIES .................. ${result.findings.filter(f=>f.entityType).length}`,`RELATIONSHIPS ............. ${result.relationships.length}`,`TIMELINE .................. GENERATED`,`CONFIDENCE ................ ${result.confidence.score}%`,'OPENING INTELLIGENCE WORKSPACE...'],result};
 }
 if(['domain','recon','infra','infra-history','cert','dns','subdomains'].includes(command)){
  const target=command==='recon'&&args[0]==='domain'?args[1]:args[0];if(!target)return {title:'VALIDATION ERROR',tone:'warning',lines:[`Usage: ${command} example.com`]};
  try{await wait(120);const result=await createDomainIntelligence(target,command as Parameters<typeof createDomainIntelligence>[1]);return {title:`DOMAIN INFRASTRUCTURE V2 // ${command.toUpperCase()}`,tone:'success',lines:[...result.stages.map(s=>`${s.label.padEnd(32,'.')} ✓`),`${result.summary.currentIps.length} CURRENT IP · ${result.summary.historicalIps.length} HISTORICAL IP · ${result.summary.subdomains.length} SUBDOMAINS`,`${result.changes.length} CHANGES · ${result.risks.length} EXPLAINABLE RISK SIGNALS`,'ALL RESULTS INCLUDE SOURCE + RETRIEVAL TIME · OPENING INVESTIGATION VIEW...'],result};}catch(error){return {title:'VALIDATION ERROR',tone:'warning',lines:[error instanceof Error?error.message:'Domain investigation failed safely.']};}
 }
 if(command==='pivot')return {title:'PEGASUS SMART PIVOT',tone:'info',lines:['Open the active result to review reason, source, confidence, cost, and case context.']};
 if(['graph','timeline'].includes(command))return {title:`${command.toUpperCase()} VIEW READY`,tone:'info',lines:[`Workspace switched to ${command} for ${args.join(' ')||'the active case'}.`]};
 return {title:`${command.toUpperCase()} SEARCH COMPLETE`,tone:'success',lines:[`Authorized mock provider searched for “${args.join(' ')||'current context'}”.`,'No live personal data or protected system was accessed.']};
}
