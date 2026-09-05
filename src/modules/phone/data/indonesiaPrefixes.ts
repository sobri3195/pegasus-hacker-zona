export interface IndonesianPrefix {prefix:string;operator:string;numberType:'Mobile';network:string;notes:string}
const mobile=(prefixes:string[],operator:string,network:string,notes:string):IndonesianPrefix[]=>prefixes.map(prefix=>({prefix,operator,numberType:'Mobile',network,notes}));
export const INDONESIAN_MOBILE_PREFIXES:IndonesianPrefix[]=[
 ...mobile(['0811','0812','0813','0821','0822','0823','0851','0852','0853'],'Telkomsel','GSM/LTE/5G','Numbering allocation associated with Telkomsel.'),
 ...mobile(['0814','0815','0816','0855','0856','0857','0858'],'Indosat / IM3','GSM/LTE/5G','Numbering allocation associated with Indosat Ooredoo Hutchison.'),
 ...mobile(['0817','0818','0819','0859','0877','0878'],'XL','GSM/LTE/5G','Numbering allocation associated with XL Axiata.'),
 ...mobile(['0831','0832','0833','0838'],'AXIS','GSM/LTE','Numbering allocation associated with AXIS / XL Axiata.'),
 ...mobile(['0881','0882','0883','0884','0885','0886','0887','0888','0889'],'Smartfren','LTE/5G','Numbering allocation associated with Smartfren.'),
 ...mobile(['0895','0896','0897','0898','0899'],'Tri','GSM/LTE/5G','Numbering allocation associated with Tri / Indosat Ooredoo Hutchison.'),
];
export const CARRIER_CAVEAT='Carrier identification is based on numbering allocation/prefix data. Mobile Number Portability or provider changes may affect current accuracy.';
export function findPrefix(local:string){return [...INDONESIAN_MOBILE_PREFIXES].sort((a,b)=>b.prefix.length-a.prefix.length).find(item=>local.startsWith(item.prefix));}
