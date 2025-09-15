import type { ISignupUser, IUser } from '@/modules/user/model';
import { Config } from '@/shared/config';
import { getAxiosOptions } from '@/shared/utils/api';
import { getAccessTokenSilently } from '@/shared/utils/token';
import axios from 'axios';

const getUserUrl = (path: string) => {
    return `${Config.apiURL}/users${path}`;
};

export const registerUser = async (signupData: ISignupUser): Promise<IUser> => {
    const accessToken = await getAccessTokenSilently();
    const response = await axios.post(
        getUserUrl('/'),
        signupData,
        getAxiosOptions(accessToken),
    );
    return response.data;
};