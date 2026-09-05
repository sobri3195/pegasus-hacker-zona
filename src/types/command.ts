export type CommandFlagValue = string | number | boolean;
export interface ParsedStage { command: string; args: string[]; flags: Record<string, CommandFlagValue>; }
export interface ParsedCommand extends ParsedStage { raw: string; pipeline: ParsedStage[]; timestamp: string; analystId: string; investigationId?: string; }
export type ExecutionStatus = 'SUCCESS' | 'BLOCKED' | 'ERROR';
export interface CommandRecord { id: string; raw: string; timestamp: string; duration: number; status: ExecutionStatus; provider: string; caseId?: string; }
export type EntityKind='DOMAIN'|'IP_ADDRESS'|'ASN'|'HOSTNAME'|'ORGANIZATION'|'EMAIL'|'USERNAME'|'URL'|'DOCUMENT';
export interface Provenance {id:string;source:string;retrievedAt:string;method:string;confidence:'HIGH'|'MEDIUM'|'LOW';sourceUrl?:string}
export interface Finding {id:string;category:string;label:string;value:string;entityType?:EntityKind;provenance:Provenance}
export interface Relationship {id:string;from:string;to:string;type:string;sourceId:string;confidence:number;createdAt:string;validationStatus:'UNVERIFIED'|'VALIDATED'}
export interface TimelineItem {id:string;at:string;type:string;label:string;sourceId:string;confidence:number}
export interface ConfidenceAssessment {score:number;factors:{label:string;impact:number}[]}
export interface PivotRecommendation {id:string;title:string;reason:string;expectedOutput:string;dataSource:string;confidence:number;estimatedCost:'LOW'|'MEDIUM'|'HIGH';caseContext:string;command:string;status:'READY'|'QUEUED'|'IGNORED'}
export interface FootprintResult {kind:'footprint'|'recon'|'domain';targetType:'domain'|'username'|'organization';target:string;runId:string;startedAt:string;completedAt:string;durationMs:number;stages:{id:string;label:string;status:'complete'}[];findings:Finding[];relationships:Relationship[];timeline:TimelineItem[];confidence:ConfidenceAssessment;pivots:PivotRecommendation[]}
export interface CommandOutput { title:string; tone:'success'|'info'|'warning'|'danger'; lines:string[]; result?:FootprintResult; }
