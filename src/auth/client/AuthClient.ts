import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { differenceInSeconds } from 'date-fns';

import { Config } from '@/src/shared/config';
import { getErrorMessage } from '@/src/shared/utils/error';
import type { ScopeType } from '@/src/auth/models';

export class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthError';
    }
}

export interface IPasswordLoginParams {
    email_address: string;
    password: string;
}

interface IAuthenticateWithCredentialsProps {
    grant_type: 'password';
    email_address: string;
    password: string;

    [key: string]: string;
}

interface IJwtData {
    sub: string;
    exp: number;
}

export class AuthClient {
    public userEmail: string | null;
    public accessToken: string | null;
    public isAuthenticated: boolean;
    public tokenExpiresAt: Date | null;
    private storageKey: string;
    private cookieName: string;
    private accessTokenPromise: Promise<string> | null;
    public scopes: ScopeType[];

    public constructor() {
        this.userEmail = null;
        this.accessToken = null;
        this.isAuthenticated = false;
        this.tokenExpiresAt = null;
        this.storageKey = 'dummy-chat-app.auth';
        this.cookieName = 'dummy-chat-app.is_authenticated';
        this.accessTokenPromise = null;
        this.scopes = [];
    }

    private setAccessToken(accessToken: string) {
        const {sub, exp} = jwtDecode<IJwtData>(accessToken);
        this.userEmail = sub;
        this.tokenExpiresAt = new Date(exp * 1000);
        localStorage.setItem(this.storageKey, accessToken);
    }

    private async fetchAccessToken(): Promise<string> {
        const formData = new FormData();
        formData.append('grant_type', 'refresh_token');

        try {
            const response = await axios.post(
                `${Config.apiURL}/token/`,
                formData,
                {
                    withCredentials: true,
                },
            );
            const accessToken = response.data.access_token;
            this.setAccessToken(accessToken);
            return accessToken;
        } catch (error) {
            this.clearToken();
            const errorMessage = axios.isAxiosError(error) ? getErrorMessage(error) : (error as Error).message;
            throw new AuthError(errorMessage);
        } finally {
            // clear the promise
            this.accessTokenPromise = null;
        }
    }

    public async getAccessTokenSilently(): Promise<string> {
        if (!this.readIsAuthenticatedCookie()) {
            this.clearToken();
            throw new AuthError('You need to sign in again');
        }

        if (this.accessToken && this.tokenExpiresAt && differenceInSeconds(this.tokenExpiresAt, new Date()) > 30) {
            // TODO: Check whether requested scopes differ from current scopes. If they differ then don't use the
            //  cached token
            return this.accessToken;
        }

        // return existing promise if in progress, or create a new promise
        if (!this.accessTokenPromise) {
            this.accessTokenPromise = this.fetchAccessToken();
        }
        return await this.accessTokenPromise;
    }

    private readIsAuthenticatedCookie(): boolean {
        const cookie = cookieStore.get(this.cookieName);
        return !!cookie;
    }

    /**
    * Clear the current access token
    */
    clearToken(): void {
        // Remove access token from local storage
        if (typeof (Storage) !== 'undefined') {
            // TODO: fix this
            sessionStorage.removeItem(this.storageKey);
        }

        // Remove local variables
        this.userEmail = null;
        this.tokenExpiresAt = null;
        this.accessToken = null;
        this.isAuthenticated = false;
    }

    async authenticate(params: IAuthenticateWithCredentialsProps): Promise<string> {
        const url = `${Config.apiURL}/token/`;

        const formData = new FormData();
        Object.keys(params).forEach(key => formData.append(key, params[key]));

        const response = await axios.post(url, formData, {
            withCredentials: true,
        });

        const accessToken = response.data.access_token;
        this.setAccessToken(accessToken);
        return accessToken;
    }

    async authenticateWithCredentials({email_address, password}: IPasswordLoginParams): Promise<string> {
        return await this.authenticate({
            grant_type: 'password',
            email_address,
            password,
        });
    }

    async signOut(): Promise<void> {
        const wasAuthenticated = this.isAuthenticated;
        try {
            await axios.get(`${Config.apiURL}/logout/`, {
                withCredentials: true,
            });
            this.clearToken();
            if (wasAuthenticated) {
                window.location.pathname = '/';
            }
            return;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(getErrorMessage(error));
            } else if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw error;
        }
    }
}