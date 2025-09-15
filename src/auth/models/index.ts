export const Scope = {
    SYSTEM: 'SYSTEM',
    SYSTEM_ADMIN: 'SYSTEM_ADMIN',
    TENANT_ADMIN: 'TENANT_ADMIN',
    USER: 'USER',
} as const;

export type ScopeType = (typeof Scope)[keyof typeof Scope];

export interface ITokenData {
    email: string;
    scopes: ScopeType[];
}
