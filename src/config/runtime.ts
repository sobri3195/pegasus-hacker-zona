export const APP_VERSION='0.4.0';
export type RuntimeMode='PRODUCTION'|'DEVELOPMENT'|'DEMO';
const requested=String(import.meta.env.VITE_APP_MODE??(import.meta.env.DEV?'DEVELOPMENT':'PRODUCTION')).toUpperCase();
export const RUNTIME_MODE:RuntimeMode=requested==='DEMO'?'DEMO':requested==='DEVELOPMENT'?'DEVELOPMENT':'PRODUCTION';
