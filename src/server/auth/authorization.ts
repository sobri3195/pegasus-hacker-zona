import type {Role,User} from './authService';

export type Permission='case:create'|'case:read'|'case:update'|'case:admin'|'evidence:read'|'evidence:write'|'provider:admin'|'audit:read';
export type CaseRole='OWNER'|'LEAD'|'ANALYST'|'VIEWER';
export interface CaseMembership{caseId:string;userId:string;role:CaseRole}

const rolePermissions:Record<Role,ReadonlySet<Permission>>={
 ADMIN:new Set(['case:create','case:read','case:update','case:admin','evidence:read','evidence:write','provider:admin','audit:read']),
 SUPERVISOR:new Set(['case:create','case:read','case:update','case:admin','evidence:read','evidence:write','audit:read']),
 ANALYST:new Set(['case:create','case:read','case:update','evidence:read','evidence:write']),
 VIEWER:new Set(['case:read','evidence:read']),
};
const casePermissions:Record<CaseRole,ReadonlySet<Permission>>={OWNER:new Set(['case:read','case:update','case:admin','evidence:read','evidence:write']),LEAD:new Set(['case:read','case:update','case:admin','evidence:read','evidence:write']),ANALYST:new Set(['case:read','case:update','evidence:read','evidence:write']),VIEWER:new Set(['case:read','evidence:read'])};

export class AuthorizationError extends Error{}
export function can(user:User,permission:Permission,membership?:CaseMembership){
 const globallyAllowed=user.roles.some(role=>rolePermissions[role].has(permission));
 if(!membership)return globallyAllowed;
 return globallyAllowed&&membership.userId===user.id&&casePermissions[membership.role].has(permission);
}
export function authorize(user:User,permission:Permission,membership?:CaseMembership){if(!can(user,permission,membership))throw new AuthorizationError(`Permission denied: ${permission}`)}
