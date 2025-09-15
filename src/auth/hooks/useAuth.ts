import { AuthClient, type IPasswordLoginParams } from '@/auth/client/AuthClient';
import type { ITokenData } from '@/auth/models';
import {createContext, useContext, useEffect, useState} from 'react';



interface IUseAuthProviderValue {
    tokenData: ITokenData | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    getAccessTokenSilently: () => Promise<string>;
    signOut: () => Promise<void>;
    authenticateWithCredentials: (loginParams: IPasswordLoginParams) => Promise<string>;
}

interface IUseGuaranteedAuthValue extends IUseAuthProviderValue {
    tokenData: ITokenData;
}

const stub = (): never => {
    throw new Error('You forgot to wrap your component in <AuthProvider>.');
};

const initialAuthContext: IUseAuthProviderValue = {
    isLoading: true,
    isAuthenticated: false,
    tokenData: null,
    getAccessTokenSilently: stub,
    signOut: stub,
    authenticateWithCredentials: stub,
};

interface IUseAuthProviderState {
    tokenData: ITokenData | null;
    searchToken: string | null; 
    isLoading: boolean;
    isAuthenticated: boolean;
}

export const authContext = createContext<IUseAuthProviderValue>(initialAuthContext);

export const useAuth = () => {
    return useContext(authContext);
};

export const useGuaranteedAuth = (): IUseGuaranteedAuthValue => {
    const {tokenData, ...rest} = useContext(authContext);
    if (!tokenData) {
        throw new Error('not authenticated');
    }
    return {
        tokenData,
        ...rest,
    };
};

const getUserFromClient = (client: AuthClient): ITokenData | null => {
    if (client.userEmail && client.scopes) {
        return {
            email: client.userEmail,
            scopes: client.scopes,
        };
    }
    return null;
};

// Provider hook that creates auth object and handles state
export function useAuthProvider(): IUseAuthProviderValue {
    const [client] = useState<AuthClient>(
        new AuthClient(),
    );

    const [authState, setAuthState] = useState<IUseAuthProviderState>({
        tokenData: getUserFromClient(client),
        searchToken: null,
        isAuthenticated: client.isAuthenticated || false,
        isLoading: !client.isAuthenticated,
    });

    // initial check to see if the user is authenticated
    useEffect(() => {
        if (authState.isAuthenticated) {
            return;
        }
        (async (): Promise<void> => {
            try {
                await client.getAccessTokenSilently();
                setAuthState({
                    ...authState,
                    tokenData: getUserFromClient(client),
                    isLoading: false,
                    isAuthenticated: true,
                });
            } catch (error) {
                setAuthState({
                    tokenData: null,
                    searchToken: null,
                    isLoading: false,
                    isAuthenticated: false,
                });
            }
        })();
        // ignore missing dependencies to ensure it only runs once:
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getAccessTokenSilently = async (): Promise<string> => {
        try {
            const accessToken = await client.getAccessTokenSilently();
            setAuthState({
                ...authState,
                tokenData: getUserFromClient(client),
                isLoading: false,
                isAuthenticated: true,
            });
            return accessToken;
        } catch (e) {
            setAuthState({
                tokenData: null,
                searchToken: null,
                isLoading: false,
                isAuthenticated: false,
            });
            throw e;
        }
    };

    const signOut = async () => {
        const isAuthenticated = client.isAuthenticated;
        try {
            await client.signOut();
            setAuthState({
                tokenData: null,
                searchToken: null,
                isLoading: false,
                isAuthenticated: false,
            });
        } catch (error) {
            setAuthState({
                tokenData: null,
                searchToken: null,
                isLoading: false,
                isAuthenticated: false,
            });
        } finally {
            if (isAuthenticated) {
                window.location.reload();
            }
        }
    };

    const authenticateWithCredentials = async (loginParams: IPasswordLoginParams): Promise<string> => {
        try {
            const accessToken = await client.authenticateWithCredentials(loginParams);
            setAuthState({
                ...authState,
                tokenData: getUserFromClient(client),
                isLoading: false,
                isAuthenticated: true,
            });
            return accessToken;
        } catch (error) {
            setAuthState({
                tokenData: null,
                searchToken: null,
                isLoading: false,
                isAuthenticated: false,
            });
            throw error;
        }
    };

    // Return the user object and auth methods
    return {
        tokenData: authState.tokenData,
        isLoading: authState.isLoading,
        isAuthenticated: authState.isAuthenticated,
        getAccessTokenSilently,
        signOut,
        authenticateWithCredentials,
    };
}
