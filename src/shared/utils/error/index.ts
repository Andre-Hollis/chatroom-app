import axios, {AxiosError, type AxiosResponse} from 'axios';
import {toast} from 'react-toastify';

export function formatAxiosErrorOrThrow(prefix: string, error: unknown): string {
    return `${prefix}: ${getAxiosErrorOrThrow(error)}`;
}

export function getErrorMessage(error: AxiosError) {
    const responseError = error.response ? getResponseError(error.response) : null;
    if (responseError) {
        return responseError;
    } else {
        if (error.message && error.response?.statusText) {
            return `${error.message}: ${error.response.statusText}`;
        } else {
            return error.message;
        }
    }
}

export function getResponseError(response: AxiosResponse) {
    try {
        const data = response.data;
        if (typeof data == 'string') {
            return data;
        } else if ('detail' in data && typeof data.detail == 'string') {
            return data.detail;
        } else if ('detail' in data && Array.isArray(data.detail)) {
            const detail = data.detail;
            const name = detail[0].loc[detail[0].loc.length - 1];
            const message = detail[0].msg;
            return `${name}: ${message}`;
        }
    } catch {
        return null;
    }
}

export const getAxiosErrorOrThrow = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return getErrorMessage(error);
    } else if (error instanceof Error) {
        return error.message;
    } else {
        throw error;
    }
};

export const toastAxiosError = (error: unknown): void => {
    if (axios.isAxiosError(error)) {
        toast.error(getErrorMessage(error));
    } else {
        throw error;
    }
};
