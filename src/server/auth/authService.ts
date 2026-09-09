import {randomId,sha256} from '../core/encoding';

export type Role='ADMIN'|'SUPERVISOR'|'ANALYST'|'VIEWER';
export type UserStatus='ACTIVE'|'SUSPENDED';
export interface User{id:string;email:string;displayName:string;status:UserStatus;roles:Role[]}
export interface Session{id:string;userId:string;tokenHash:string;createdAt:string;expiresAt:string;lastSeenAt:string;revokedAt?:string}
export interface AuthRepository{findUserByEmail(email:string):Promise<User|undefined>;getUser(id:string):Promise<User|undefined>;saveSession(session:Session):Promise<void>;findSessionByTokenHash(hash:string):Promise<Session|undefined>;revokeSession(id:string,at:string):Promise<void>}
export interface CredentialVerifier{verify(userId:string,password:string):Promise<boolean>}

export class AuthenticationError extends Error{}

export class AuthService{
 constructor(private repository:AuthRepository,private credentials:CredentialVerifier,private sessionTtlMs=8*60*60*1000){}
 async login(email:string,password:string,now=new Date()){
  const user=await this.repository.findUserByEmail(email.trim().toLowerCase());
  if(!user||user.status!=='ACTIVE'||!await this.credentials.verify(user.id,password))throw new AuthenticationError('Invalid credentials.');
  const token=randomId('zona');const timestamp=now.toISOString();
  const session:Session={id:randomId('ses'),userId:user.id,tokenHash:await sha256(token),createdAt:timestamp,lastSeenAt:timestamp,expiresAt:new Date(now.getTime()+this.sessionTtlMs).toISOString()};
  await this.repository.saveSession(session);return {token,session,user};
 }
 async authenticate(token:string,now=new Date()){
  const session=await this.repository.findSessionByTokenHash(await sha256(token));
  if(!session||session.revokedAt||new Date(session.expiresAt)<=now)throw new AuthenticationError('Session is invalid or expired.');
  const user=await this.repository.getUser(session.userId);
  if(!user||user.status!=='ACTIVE')throw new AuthenticationError('Account is unavailable.');
  return {session,user};
 }
 async logout(token:string,now=new Date()){const session=await this.repository.findSessionByTokenHash(await sha256(token));if(session&&!session.revokedAt)await this.repository.revokeSession(session.id,now.toISOString())}
}
