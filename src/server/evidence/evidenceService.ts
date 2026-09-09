import {base64,fromBase64,randomId,sha256,utf8} from '../core/encoding';

export interface EvidenceRecord{id:string;caseId:string;filename:string;mediaType:string;size:number;sha256:string;storageKey:string;encryptionIv:string;keyVersion:string;capturedBy:string;capturedAt:string}
export interface EvidenceRepository{save(record:EvidenceRecord):Promise<void>;get(id:string):Promise<EvidenceRecord|undefined>}
export interface ObjectStore{put(key:string,data:Uint8Array):Promise<void>;get(key:string):Promise<Uint8Array|undefined>}
export interface EvidenceKeyring{active():Promise<{version:string;key:CryptoKey}>;get(version:string):Promise<CryptoKey|undefined>}

export class EvidenceService{
 constructor(private repository:EvidenceRepository,private objects:ObjectStore,private keyring:EvidenceKeyring){}
 async capture(input:{caseId:string;filename:string;mediaType:string;bytes:Uint8Array;actorId:string},now=new Date()){
  if(!input.bytes.byteLength)throw new Error('Evidence cannot be empty.');const id=randomId('evd');const digest=await sha256(input.bytes);const iv=crypto.getRandomValues(new Uint8Array(12));const {version,key}=await this.keyring.active();
  const additionalData=utf8(`${id}:${input.caseId}:${digest}`);const encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData},key,input.bytes));const storageKey=`cases/${input.caseId}/evidence/${id}`;
  await this.objects.put(storageKey,encrypted);const record:EvidenceRecord={id,caseId:input.caseId,filename:input.filename,mediaType:input.mediaType,size:input.bytes.byteLength,sha256:digest,storageKey,encryptionIv:base64(iv),keyVersion:version,capturedBy:input.actorId,capturedAt:now.toISOString()};await this.repository.save(record);return record;
 }
 async read(id:string){const record=await this.repository.get(id);if(!record)throw new Error('Evidence not found.');const [encrypted,key]=await Promise.all([this.objects.get(record.storageKey),this.keyring.get(record.keyVersion)]);if(!encrypted||!key)throw new Error('Evidence material is unavailable.');
  const bytes=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:fromBase64(record.encryptionIv),additionalData:utf8(`${record.id}:${record.caseId}:${record.sha256}`)},key,encrypted));if(await sha256(bytes)!==record.sha256)throw new Error('Evidence integrity verification failed.');return {record,bytes};
 }
}
