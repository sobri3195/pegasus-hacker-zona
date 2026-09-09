const encoder=new TextEncoder();

export const utf8=(value:string)=>encoder.encode(value);

export function hex(bytes:ArrayBuffer|Uint8Array){return [...new Uint8Array(bytes)].map(value=>value.toString(16).padStart(2,'0')).join('')}

export function base64(bytes:Uint8Array){let binary='';for(const value of bytes)binary+=String.fromCharCode(value);return btoa(binary)}

export function fromBase64(value:string){const binary=atob(value);return Uint8Array.from(binary,char=>char.charCodeAt(0))}

export async function sha256(value:string|Uint8Array){return hex(await crypto.subtle.digest('SHA-256',typeof value==='string'?utf8(value):value))}

export function randomId(prefix:string){return `${prefix}_${crypto.randomUUID()}`}
