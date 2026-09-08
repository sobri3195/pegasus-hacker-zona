import {promises as dns} from 'node:dns';
import {isIP} from 'node:net';
const domainPattern=/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const blockedIp=ip=>/^(?:0\.|10\.|127\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.|224\.|240\.)/.test(ip)||ip==='::1'||/^f[cd]/i.test(ip)||/^fe[89ab]/i.test(ip);
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const domain=String(req.query?.domain??'').trim().toLowerCase().replace(/\.$/,'');
 if(!domainPattern.test(domain))return res.status(400).json({error:'Invalid public domain'});
 const started=Date.now(),retrievedAt=new Date().toISOString();
 try{
  const [a,aaaa,mx,ns,txt,rdap]=await Promise.allSettled([dns.resolve4(domain),dns.resolve6(domain),dns.resolveMx(domain),dns.resolveNs(domain),dns.resolveTxt(domain),fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`,{signal:AbortSignal.timeout(7000),headers:{accept:'application/rdap+json'}}).then(async r=>{if(!r.ok)throw new Error(`RDAP ${r.status}`);return r.json()})]);
  const value=x=>x.status==='fulfilled'?x.value:[];const addresses=[...value(a),...value(aaaa)].filter(ip=>isIP(ip)&&!blockedIp(ip));
  const rdapData=rdap.status==='fulfilled'?rdap.value:null;
  return res.status(200).json({provider:'NODE_DNS + RDAP.ORG',retrievedAt,durationMs:Date.now()-started,records:{a:addresses.filter(x=>isIP(x)===4),aaaa:addresses.filter(x=>isIP(x)===6),mx:value(mx),ns:value(ns),txt:value(txt),rdap:rdapData?{handle:rdapData.handle,status:rdapData.status,events:rdapData.events,links:rdapData.links}:null},errors:[a,aaaa,mx,ns,txt,rdap].map((x,i)=>x.status==='rejected'?['A','AAAA','MX','NS','TXT','RDAP'][i]:null).filter(Boolean)});
 }catch{return res.status(503).json({error:'Provider unavailable'});}
}
