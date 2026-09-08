import type {CommandOutput,ParsedCommand} from '../../types/command';
import {createMockFootprint} from '../providers/types';
import {commandRegistry} from './commandRegistry';
import {createPhoneIntelligence} from '../phone/createPhoneResult';
import {createUsernameIntelligence} from '../username/usernameService';
import {createEmailIntelligence} from '../email/emailService';
import {createDomainIntelligence} from '../domain/domainService';
import {analyzeMedia} from '../media/mediaService';
import {searchLocalIndex} from '../search/searchService';
import {createDocumentIntelligence} from '../document/documentService';
import {executeFusionCommand} from '../fusion/fusionService';
import {executePersona} from '../persona/personaService';
const wait=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
export async function executeCommand(parsed:ParsedCommand):Promise<CommandOutput>{
 const {command,args}=parsed;
 const persona=executePersona(parsed);if(persona)return persona;
 const fusion=await executeFusionCommand(parsed);if(fusion)return fusion;
 if(command==='help'){const lines=commandRegistry.reduce<string[]>((all,item,index,array)=>{if(index===0||array[index-1].category!==item.category)all.push('',item.category);all.push(`  ${item.usage.padEnd(38)} ${item.description}`);return all;},[]);return {title:'AUTHORIZED COMMAND REFERENCE',tone:'info',lines};}
 if(command==='status')return {title:'SYSTEM STATUS // NOMINAL',tone:'success',lines:['Safe provider adapters ... ONLINE','Python workflow engine ... READY','Correlation engine ....... ONLINE','Audit stream ............. ACTIVE','Current classification ... INTERNAL']};
 if(command==='history')return {title:'QUERY HISTORY',tone:'info',lines:['Open the execution history tray below for commands, status, provider, and duration.']};
 if(command==='clear')return {title:'CLEAR',tone:'info',lines:[]};
 if(['search','web','news'].includes(command)){
  const query=args.join(' ').trim();const requestedLimit=parsed.flags.limit;const limit=typeof requestedLimit==='number'?requestedLimit:20;const requestedSource=String(parsed.flags.source??'all').toLowerCase();
  if(!query)return {title:'VALIDATION ERROR',tone:'warning',lines:['Usage: search "kata kunci" [--source web|news] [--limit 1-20]']};
  if(!Number.isInteger(limit)||limit<1||limit>20)return {title:'VALIDATION ERROR',tone:'warning',lines:['--limit harus berupa angka antara 1 dan 20.']};
  if(command==='search'&&!['all','web','news'].includes(requestedSource))return {title:'VALIDATION ERROR',tone:'warning',lines:['--source harus web atau news.']};
  const mode=command==='search'?(requestedSource==='web'?'web':requestedSource==='news'?'news':'search'):command as 'web'|'news';const result=searchLocalIndex(query,mode,limit);
  return {title:`FRONTEND SEARCH // ${result.hits.length} RESULT${result.hits.length===1?'':'S'}`,tone:'success',lines:[`QUERY .......................... ${query}`,`SOURCE ......................... ${result.sourceFilter}`,`MATCHES ........................ ${result.hits.length} / ${result.totalIndexed}`,'LOCAL DEMO INDEX · OPENING SEARCH RESULTS...'],result};
 }
 if(command==='media'||command==='image'){
  const mode=args[0] as 'analyze'|'metadata'|'ocr'|'hash'|'compare';const allowed=command==='media'?['analyze','compare']:['metadata','ocr','hash'];
  if(!allowed.includes(mode)||!args[1]||(mode==='compare'&&!args[2]))return {title:'VALIDATION ERROR',tone:'warning',lines:[command==='media'?'Usage: media analyze <file> | media compare <image1> <image2>':'Usage: image metadata|ocr|hash <file>','Select files using the MEDIA EVIDENCE picker first.']};
  try{const result=await analyzeMedia(args[1],mode,args[2]);const m=result.metadata;return {title:`PEGASUS MEDIA INTELLIGENCE // ${mode.toUpperCase()}`,tone:'success',lines:[`ORIGINAL SHA-256 ............... ${result.hashes.sha256}`,`MIME .......................... ${m.mime}`,`DIMENSIONS .................... ${m.width&&m.height?`${m.width} × ${m.height}`:'N/A'}`,...(result.hashes.ahash?[`aHash .......................... ${result.hashes.ahash}`,`dHash .......................... ${result.hashes.dhash}`,`pHash .......................... ${result.hashes.phash}`]:[]),...(result.comparison?[`SIMILARITY ..................... ${result.comparison.similarity}% · HEURISTIC ONLY`]:[]),'ORIGINAL PRESERVED · ANALYSIS DERIVATIVE SEPARATE'],result}}catch(error){return {title:'MEDIA ANALYSIS ERROR',tone:'warning',lines:[error instanceof Error?error.message:'Media analysis failed safely.']}}
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
 if(command==='document'){
  const modes=['analyze','entities','metadata','links','timeline'] as const;const mode=modes.includes(args[0] as typeof modes[number])?args[0] as typeof modes[number]:'analyze';const file=mode==='analyze'&&args[0]!=='analyze'?args[0]:args[1];
  if(!file)return {title:'VALIDATION ERROR',tone:'warning',lines:['Usage: document <analyze|entities|metadata|links|timeline> <file>']};
  try{const result=createDocumentIntelligence(file,mode);return {title:`DOCUMENT INTELLIGENCE // ${mode.toUpperCase()}`,tone:'success',lines:[`FILE ........................... ${result.metadata.name}`,`SHA-256 ........................ ${result.metadata.sha256}`,`ENTITIES ....................... ${result.entities.length}`,`LINKS .......................... ${result.links.length}`,'READ-ONLY DERIVATIVE READY · OPENING DOCUMENT VIEW...'],result};}catch(error){return {title:'DOCUMENT ANALYSIS ERROR',tone:'warning',lines:[error instanceof Error?error.message:'Document analysis failed safely.']};}
 }
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
 if(command==='evidence')return args[0]==='add'&&args[1]?{title:'EVIDENCE CUSTODY LOG UPDATED',tone:'success',lines:[`${args[1]} linked to the active case.`,`Custody event recorded at ${new Date().toISOString()}.`]}:{title:'VALIDATION ERROR',tone:'warning',lines:['Usage: evidence add result:456']};
 if(command==='report')return args[0]==='generate'&&args[1]?{title:'INVESTIGATION REPORT READY',tone:'success',lines:[`CASE ........................... ${args[1]}`,'FORMAT ......................... STRUCTURED HTML','SECTIONS ....................... SUMMARY · FINDINGS · SOURCES · CUSTODY','Report assembled from the current session; review before release.']}:{title:'VALIDATION ERROR',tone:'warning',lines:['Usage: report generate CASE-2026-001']};
 const workflows:Record<string,{type:'domain'|'username'|'organization';usage:string}>={ip:{type:'domain',usage:'ip 203.0.113.24'},asn:{type:'organization',usage:'asn 64500'},whois:{type:'domain',usage:'whois example.com'},archive:{type:'domain',usage:'archive example.com'},url:{type:'domain',usage:'url https://example.com'},person:{type:'organization',usage:'person "Name"'},organization:{type:'organization',usage:'organization "Organization"'},entity:{type:'organization',usage:'entity find "keyword"'},geo:{type:'organization',usage:'geo "location"'},investigate:{type:'domain',usage:'investigate domain example.test'}};
 const workflow=workflows[command];if(workflow){const target=(command==='entity'&&args[0]==='find')||(command==='investigate'&&args[0]==='domain')?args.slice(1).join(' '):args.join(' ');if(!target)return {title:'VALIDATION ERROR',tone:'warning',lines:[`Usage: ${workflow.usage}`]};const providerTarget=command==='ip'?`ip-${target.replaceAll(/[^0-9a-f]/gi,'-')}.example`:target;const result=createMockFootprint(providerTarget,command==='investigate'?'recon':'footprint',workflow.type);result.target=target;return {title:`${command.toUpperCase()} INTELLIGENCE // COMPLETE`,tone:'success',lines:[`TARGET ......................... ${target}`,`FINDINGS ....................... ${result.findings.length}`,`RELATIONSHIPS .................. ${result.relationships.length}`,`CONFIDENCE ..................... ${result.confidence.score}%`,'AUTHORIZED PUBLIC-DATA WORKFLOW · OPENING WORKSPACE...'],result};}
 return {title:'WORKFLOW NOT AVAILABLE',tone:'warning',lines:[`The ${command} workflow is registered but has no configured provider.`]};
}
