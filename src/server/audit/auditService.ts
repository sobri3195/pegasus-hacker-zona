import {randomId,sha256} from '../core/encoding';

export interface AuditEvent{id:string;sequence:number;occurredAt:string;actorId:string;action:string;resourceType:string;resourceId:string;caseId?:string;metadata:Record<string,unknown>;previousHash:string;hash:string}
export interface AuditStore{latest():Promise<AuditEvent|undefined>;append(event:AuditEvent):Promise<void>;list():Promise<readonly AuditEvent[]>}
const stable=(value:unknown):string=>{if(Array.isArray(value))return `[${value.map(stable).join(',')}]`;if(value&&typeof value==='object')return `{${Object.entries(value as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>`${JSON.stringify(key)}:${stable(item)}`).join(',')}}`;return JSON.stringify(value)};

export class AuditService{
 constructor(private store:AuditStore){}
 async record(input:Omit<AuditEvent,'id'|'sequence'|'previousHash'|'hash'>){
  const previous=await this.store.latest();const eventWithoutHash={...input,id:randomId('aud'),sequence:(previous?.sequence??0)+1,previousHash:previous?.hash??'GENESIS'};
  const event:AuditEvent={...eventWithoutHash,hash:await sha256(stable(eventWithoutHash))};await this.store.append(event);return event;
 }
 async verify(){const events=await this.store.list();let previousHash='GENESIS';for(let index=0;index<events.length;index++){const event=events[index];const {hash,...unsigned}=event;if(event.sequence!==index+1||event.previousHash!==previousHash||await sha256(stable(unsigned))!==hash)return false;previousHash=hash}return true}
}
