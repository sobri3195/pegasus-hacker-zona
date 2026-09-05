export type CommandFlagValue = string | number | boolean;
export interface ParsedStage { command: string; args: string[]; flags: Record<string, CommandFlagValue>; }
export interface ParsedCommand extends ParsedStage { raw: string; pipeline: ParsedStage[]; timestamp: string; analystId: string; investigationId?: string; }
export type ExecutionStatus = 'SUCCESS' | 'BLOCKED' | 'ERROR';
export interface CommandRecord { id: string; raw: string; timestamp: string; duration: number; status: ExecutionStatus; provider: string; caseId?: string; }
export interface CommandOutput { title: string; tone: 'success'|'info'|'warning'|'danger'; lines: string[]; result?: DomainProfile; }
export interface DomainProfile { domain: string; registrar: string; created: string; updated: string; expiry: string; nameservers: string[]; records: {type:string;value:string}[]; related: {label:string;type:string}[]; reliability:string; confidence:string; }
