import type {PhoneMetadata} from '../../types/command';
import {CARRIER_CAVEAT,findPrefix} from './data/indonesiaPrefixes';
export class PhoneValidationError extends Error {}
export function normalizeIndonesianPhone(raw:string):PhoneMetadata{
 const input=raw.trim();
 if(!input||/[A-Za-z]/.test(input)||/[^\d+().\s-]/.test(input)||((input.match(/\+/g)||[]).length>1)||input.includes('+')&&!input.startsWith('+'))throw new PhoneValidationError('Format nomor tidak valid. Gunakan 08…, 628…, atau +628….');
 let digits=input.replace(/\D/g,'');
 if(digits.startsWith('62'))digits=`0${digits.slice(2)}`;
 if(!digits.startsWith('08')||digits.length<10||digits.length>13)throw new PhoneValidationError('Nomor seluler Indonesia harus memiliki 10–13 digit dan diawali 08.');
 const prefix=findPrefix(digits);
 if(!prefix)throw new PhoneValidationError('Prefix tidak dikenali sebagai alokasi nomor seluler Indonesia.');
 const nationalNumber=digits.slice(1), groups=[nationalNumber.slice(0,3),nationalNumber.slice(3,7),nationalNumber.slice(7)].filter(Boolean);
 return {raw,normalizedLocal:digits,e164:`+62${nationalNumber}`,country:'Indonesia',countryCode:'+62',nationalNumber,validFormat:true,formattedInternational:`+62 ${groups.join('-')}`,prefix:prefix.prefix,carrierHint:prefix.operator,lineType:'Mobile',network:prefix.network,carrierNotes:`${prefix.notes} ${CARRIER_CAVEAT}`};
}
export function generatePhoneVariants(value:string|PhoneMetadata){const p=typeof value==='string'?normalizeIndonesianPhone(value):value;const local=p.normalizedLocal;const split=[local.slice(0,4),local.slice(4,8),local.slice(8)].filter(Boolean);return [...new Set([p.e164,p.e164.slice(1),local,split.join('-'),split.join(' '),`+62 ${[p.nationalNumber.slice(0,3),p.nationalNumber.slice(3,7),p.nationalNumber.slice(7)].filter(Boolean).join(' ')}`])];}
export function comparablePhone(value:string){return value.replace(/\D/g,'').replace(/^62/,'0');}
