import type {PersonaCandidate,PlatformCategory} from '../../types/command';

export type GoogleSearchProgress=(message:string)=>void;
export interface GoogleResult {title:string;url:string;snippet:string;platform:string;category:PlatformCategory;confidence:number}

const proxies=[
 'https://api.allorigins.win/raw?url=',
 'https://corsproxy.io/?url=',
] as const;

const platforms=[
 ['Facebook','SOCIAL',['facebook.com']],['LinkedIn','PROFESSIONAL',['linkedin.com']],['Instagram','SOCIAL',['instagram.com']],
 ['X / Twitter','SOCIAL',['twitter.com','x.com']],['Threads','SOCIAL',['threads.net']],['TikTok','SOCIAL',['tiktok.com']],
 ['YouTube','CREATOR',['youtube.com','youtu.be']],['GitHub','PROFESSIONAL',['github.com']],['GitLab','PROFESSIONAL',['gitlab.com']],
 ['Reddit','COMMUNITY',['reddit.com']],['Medium','COMMUNITY',['medium.com']],['Google Scholar','PROFESSIONAL',['scholar.google.com']],
 ['ResearchGate','PROFESSIONAL',['researchgate.net']],['ORCID','PROFESSIONAL',['orcid.org']],
] as const satisfies readonly (readonly [string,PlatformCategory,readonly string[]])[];

export class GoogleClientError extends Error {constructor(message:string,public readonly code:'PROXY_UNAVAILABLE'|'CAPTCHA'|'PARSE_ERROR'){super(message);this.name='GoogleClientError'}}

export function unwrapGoogleUrl(raw:string,base='https://www.google.com'):string|undefined{
 try{const url=new URL(raw,base);if(url.pathname==='/url'){const target=url.searchParams.get('q')||url.searchParams.get('url');if(target)return unwrapGoogleUrl(target)}
  if(!['http:','https:'].includes(url.protocol)||url.hostname.endsWith('google.com'))return;
  url.hash='';return url.toString();
 }catch{return undefined}
}

const words=(value:string)=>value.toLocaleLowerCase('id').match(/[\p{L}\p{N}]{2,}/gu)??[];
export function confidenceFor(query:string,title:string,snippet:string):number{
 const terms=[...new Set(words(query).filter(term=>!['site','com','www'].includes(term)))];if(!terms.length)return 35;
 const titleWords=new Set(words(title)),snippetWords=new Set(words(snippet));
 const titleHits=terms.filter(term=>titleWords.has(term)).length,snippetHits=terms.filter(term=>snippetWords.has(term)).length;
 return Math.min(95,35+Math.round(titleHits/terms.length*40)+Math.round(snippetHits/terms.length*20));
}

function platformFor(rawUrl:string){const host=new URL(rawUrl).hostname.toLowerCase().replace(/^www\./,'');return platforms.find(([, ,domains])=>domains.some(domain=>host===domain||host.endsWith(`.${domain}`)))}
const clean=(value:string|undefined|null)=>value?.replace(/\s+/g,' ').trim()??'';

export function parseGoogleResults(html:string,query:string):GoogleResult[]{
 if(typeof DOMParser==='undefined')throw new GoogleClientError('DOMParser tidak tersedia; pencarian ini harus dijalankan di browser.','PARSE_ERROR');
 const text=html.toLowerCase();if(text.includes('/sorry/index')||text.includes('unusual traffic')||text.includes('g-recaptcha')||text.includes('detected unusual traffic'))throw new GoogleClientError('Google menampilkan CAPTCHA atau mendeteksi trafik tidak biasa. Coba lagi nanti.','CAPTCHA');
 const document=new DOMParser().parseFromString(html,'text/html');const found:GoogleResult[]=[];const seen=new Set<string>();
 for(const heading of document.querySelectorAll('h3')){const anchor=heading.closest('a[href]')??heading.parentElement?.querySelector('a[href]');const url=anchor?unwrapGoogleUrl(anchor.getAttribute('href')??''):undefined;if(!url||seen.has(url))continue;
  const platform=platformFor(url);if(!platform)continue;const container=heading.closest('div[data-snhf], div.MjjYud, div.g')??heading.parentElement?.parentElement;
  const candidates=container?.querySelectorAll('div,span')??[];let snippet='';for(const node of candidates){const value=clean(node.textContent);if(value.length>snippet.length&&value!==clean(container?.textContent)&&value!==clean(heading.textContent))snippet=value}
  snippet=snippet.slice(0,500);const title=clean(heading.textContent);seen.add(url);found.push({title,url,snippet,platform:platform[0],category:platform[1],confidence:confidenceFor(query,title,snippet)});
 }
 return found;
}

export async function fetchGoogleResults(query:string,onProgress:GoogleSearchProgress=()=>undefined,signal?:AbortSignal):Promise<GoogleResult[]>{
 const googleUrl=`https://www.google.com/search?q=${encodeURIComponent(query)}&hl=id`;const failures:string[]=[];onProgress('Connecting via browser proxy...');
 for(const proxy of proxies){try{const response=await fetch(`${proxy}${encodeURIComponent(googleUrl)}`,{headers:{Accept:'text/html'},signal});if(!response.ok)throw new Error(`HTTP ${response.status}`);const html=await response.text();onProgress('Parsing DOM elements...');const results=parseGoogleResults(html,query);onProgress(`Extracted ${results.length} candidates successfully.`);return results}catch(error){if(error instanceof GoogleClientError&&error.code==='CAPTCHA')throw error;failures.push(error instanceof Error?error.message:'Unknown proxy error')}}
 throw new GoogleClientError(`Semua public CORS proxy gagal (${failures.join('; ')}). Coba lagi nanti atau buka pencarian Google secara manual.`,'PROXY_UNAVAILABLE');
}

export function googleResultsToCandidates(results:GoogleResult[],personId:string):PersonaCandidate[]{const collectedAt=new Date().toISOString();return results.map((item,index)=>{const path=new URL(item.url).pathname.split('/').filter(Boolean);return {id:`PROFILE-${personId}-${String(index+1).padStart(2,'0')}`,platform:item.platform,category:item.category,platformStatus:item.confidence>=75?'FOUND':'POSSIBLE MATCH',username:path.at(-1)?.replace(/^@/,'')||'—',displayName:item.title,profileUrl:item.url,bio:item.snippet||'Tidak ada snippet publik yang tersedia.',accountType:'GOOGLE INDEXED PUBLIC RESULT',platformVerified:false,lastObserved:collectedAt,matchingIndicators:[`Nama target cocok dengan judul/snippet (${item.confidence}%)`],conflictingIndicators:['Identitas belum diverifikasi secara independen'],confidence:item.confidence,status:item.confidence>=75?'HIGH':item.confidence>=55?'MEDIUM':'LOW',source:'Google Search via public browser CORS proxy',sourceUrl:item.url,collectedAt,verificationStatus:'ANALYST REVIEW REQUIRED'} satisfies PersonaCandidate})}
