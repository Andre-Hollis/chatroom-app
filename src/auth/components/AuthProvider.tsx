import React from 'react';

import { authContext, useAuthProvider } from '@/src/auth/hooks/useAuth';

interface IAuthProviderProps {
    children?: React.ReactNode;
}

export function AuthProvider({children}: IAuthProviderProps) {
    const auth = useAuthProvider();

    return (
        <authContext.Provider value={auth}>{children}</authContext.Provider>
    );
}
