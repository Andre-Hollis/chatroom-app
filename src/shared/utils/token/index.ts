const _getAccessTokenSilentlyStub = () => {
    return new Promise<string>((resolve, reject) => {
        reject('Not authenticated');
    });
};
let _getAccessTokenSilently: (() => Promise<string>) = _getAccessTokenSilentlyStub;

export const getAccessTokenSilently = () => _getAccessTokenSilently();
export const setAccessTokenSilently = (func: () => Promise<string>) => (_getAccessTokenSilently = func);
