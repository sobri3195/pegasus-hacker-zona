export const TARGET_TYPES=['auto','person','username','email','phone','domain','organization','url','ip','document','media'] as const;
export type TargetType=Exclude<typeof TARGET_TYPES[number],'auto'>;
export interface TargetClassification {type:TargetType|'ambiguous';input:string;explicit:boolean;candidates:TargetType[];reason:string}

const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phone=/^\+?[\d\s().-]{8,}$/;
const ip=/^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
const domain=/^(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z]{2,63}$/i;
const organizationSignal=/\b(?:pt|cv|inc|llc|ltd|corp(?:oration)?|foundation|university|universitas|institute|association|group|company|organisasi|yayasan)\b/i;

export function classifyTarget(input:string,explicit?:string):TargetClassification {
 const value=input.trim();
 if(explicit&&explicit!=='auto'&&TARGET_TYPES.includes(explicit.toLowerCase() as typeof TARGET_TYPES[number]))return {type:explicit.toLowerCase() as TargetType,input:value,explicit:true,candidates:[explicit.toLowerCase() as TargetType],reason:'Explicit command override'};
 if(ip.test(value))return {type:'ip',input:value,explicit:false,candidates:['ip'],reason:'Valid IPv4 address'};
 try{const url=new URL(value);if(['http:','https:'].includes(url.protocol))return {type:'url',input:value,explicit:false,candidates:['url'],reason:'Valid public URL'}}catch{/* not a URL */}
 if(email.test(value))return {type:'email',input:value,explicit:false,candidates:['email'],reason:'Valid email syntax'};
 if(phone.test(value))return {type:'phone',input:value,explicit:false,candidates:['phone'],reason:'Telephone number syntax'};
 if(domain.test(value))return {type:'domain',input:value,explicit:false,candidates:['domain'],reason:'Valid domain syntax'};
 if(value.startsWith('@')||(/^[a-z\d][a-z\d_.-]{1,31}$/i.test(value)&&!value.includes(' ')))return {type:'username',input:value.replace(/^@/,''),explicit:false,candidates:['username'],reason:'Public username syntax'};
 const words=value.split(/\s+/).filter(Boolean);
 if(words.length>=2&&words.length<=5){
  if(organizationSignal.test(value))return {type:'ambiguous',input:value,explicit:false,candidates:['person','organization'],reason:'Input may refer to a person or organization'};
  return {type:'person',input:value,explicit:false,candidates:['person'],reason:'Two-to-five-word human-name seed; not automatically treated as an organization'};
 }
 return {type:'ambiguous',input:value,explicit:false,candidates:['person','organization'],reason:'Insufficient evidence for silent classification'};
}
