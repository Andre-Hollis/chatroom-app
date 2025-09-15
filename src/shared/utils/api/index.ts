import { Config } from '@/shared/config';

export const getApiUrlForPath = (path: string) => {
    return `${Config.apiURL}${path}`;
};

export const getAuthorizationHeader = (accessToken: string) => {
    return `Bearer ${accessToken}`;
};

export const getAxiosOptions = (accessToken: string) => {
    return {
        headers: getAxiosHeaders(accessToken),
    };
};

export const getAxiosHeaders = (accessToken: string) => {
    return {
        'Authorization': getAuthorizationHeader(accessToken),
    };
};

export const serializeArrayParams = (paramName: string, valArray: number[]): string => {
    return valArray.map(val => `${paramName}=${val}`).join('&');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getQueryIdsParams = (filters: Record<string, any>): string => {
    let listQueryURL: string = '';
    Object.entries(filters).forEach(([key, val]) => {
        if (Array.isArray(val) && !!val.length) {
            if (listQueryURL) {
                const idsParams = val.map(item => `${key}=${item}`).join('&');
                listQueryURL = `${listQueryURL}&${idsParams}`;
            } else {
                const idsParams = val.map(item => `${key}=${item}`).join('&');
                listQueryURL = `?${idsParams}`;
            }
        }
    });
    return listQueryURL;
};