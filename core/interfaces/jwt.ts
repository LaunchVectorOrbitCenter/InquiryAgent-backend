interface IJWTPayload {
    id: string,
    username: string,
    email: string,
    role?: string,
    tenantId?: string,
    allowedStores?: string[],
    jwtType: string,
    userUtcOffset?: number | null
}


export default IJWTPayload;