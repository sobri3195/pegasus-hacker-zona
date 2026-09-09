export type ProviderCapability='DOMAIN'|'PHONE'|'EMAIL'|'USERNAME'|'DOCUMENT'|'MEDIA';
export interface ProviderDefinition{id:string;name:string;capabilities:ProviderCapability[];baseUrl:string;enabled:boolean;credentialRef?:string;timeoutMs:number;requestsPerMinute:number}
export interface ProviderHealth{providerId:string;status:'AVAILABLE'|'DEGRADED'|'DISABLED';checkedAt:string;message?:string}

export class ProviderRegistry{
 private providers=new Map<string,ProviderDefinition>();
 constructor(private allowedHosts:ReadonlySet<string>){ }
 register(definition:ProviderDefinition){
  const url=new URL(definition.baseUrl);if(url.protocol!=='https:'||!this.allowedHosts.has(url.hostname))throw new Error('Provider endpoint is not allow-listed.');
  if(definition.credentialRef&&!/^secret:\/\/[a-z0-9/_-]+$/i.test(definition.credentialRef))throw new Error('Provider credentials must use a secret reference.');
  if(definition.timeoutMs<100||definition.requestsPerMinute<1)throw new Error('Provider limits are invalid.');
  this.providers.set(definition.id,{...definition,capabilities:[...definition.capabilities]});
 }
 get(id:string){const provider=this.providers.get(id);return provider?{...provider,capabilities:[...provider.capabilities]}:undefined}
 list(capability?:ProviderCapability){return [...this.providers.values()].filter(item=>!capability||item.capabilities.includes(capability)).map(item=>({...item,capabilities:[...item.capabilities]}))}
 health(id:string):ProviderHealth{const provider=this.providers.get(id);if(!provider)throw new Error('Unknown provider.');return {providerId:id,status:provider.enabled?'AVAILABLE':'DISABLED',checkedAt:new Date().toISOString()}}
}
