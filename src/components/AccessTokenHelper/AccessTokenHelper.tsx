import { useAuth } from '@/auth/hooks/useAuth';
import { setAccessTokenSilently } from '@/shared/utils/token';


/**
 * Sets the value of 'getAccessTokenSilentily' so it is available outside of React
 */
export const AccessTokenHelper = () => {
    const {getAccessTokenSilently} = useAuth();

    // this makes the `getAccessTokenSilently` function available outside of React components
    setAccessTokenSilently(getAccessTokenSilently);

    return null;
};
