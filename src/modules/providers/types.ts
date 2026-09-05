export interface ProviderResult<T=unknown>{data:T;provider:string;retrievedAt:string;mocked:boolean}
export interface IntelligenceProvider<I=string,O=unknown>{name:string;type:string;enabled:boolean;mocked:boolean;search(input:I):Promise<ProviderResult<O>>}
