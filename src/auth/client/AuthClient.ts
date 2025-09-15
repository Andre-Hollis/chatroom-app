import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { differenceInSeconds } from "date-fns";

import { Config } from "../../shared/config";
import { getErrorMessage } from "../../shared/utils/error";

export class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthError';
    }
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

    public constructor() {
        this.userEmail = null;
        this.accessToken = null;
        this.isAuthenticated = false;
        this.tokenExpiresAt = null;
        this.storageKey = 'dummy-chat-app.auth';
        this.cookieName = 'dummy-chat-app.is_authenticated';
        this.accessTokenPromise = null;
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
}