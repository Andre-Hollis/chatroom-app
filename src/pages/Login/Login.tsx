import React from 'react';

import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router';
import { useAtom } from 'jotai';

import './styles.scss';
import { useTitle } from '@/src/shared/hooks/useTitle';

export const Login = () => {
    const [submitting, setSubmitting] = React.useState<boolean>();
    const navigate = useNavigate();

    const {authenticateWithCredentials} = useAuth();

    const {handleSubmit, register} = useForm<IPasswordLoginParams>();

    const [authRedirect, setAuthRedirect] = useAtom(authRedirectAtom);
    const {search} = useLocation();

    React.useEffect(() => {
        const searchParams = new URLSearchParams(search);
        const redirect = searchParams.get('redirect');
        setAuthRedirect(redirect || '/dashboard');
    }, [search, setAuthRedirect]);

    useTitle('Log In');

    const onSubmit = (loginParams: IPasswordLoginParams) => {
        (async () => {
            try {
                setSubmitting(true);
                await authenticateWithCredentials(loginParams);
                navigate(authRedirect || '/');
            } catch (error) {
                toast.error(getAxiosErrorOrThrow((error)));
            } finally {
                setSubmitting(false);
            }
        })();
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <div className="logo">
                    <div className="icon">
                        {/*  */}
                    </div>
                    <div className="text">Acuity</div>
                </div>
                <h2>Log in to your account</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <label>Email</label>
                    <input type="email" placeholder="user@example.com" {...register('email_address')}/>

                    <label>Password</label>
                    <div className="password-field">
                        <input type="password" placeholder="Enter your password" {...register('password')}/>
                        <button type="button">Show</button>
                    </div>

                    <button
                        className="submit-btn"
                        type='submit'
                        disabled={submitting}
                    >
                        {submitting ? 'Logging in' : 'Log in'}
                    </button>

                    <div className="helper-links">
                        <div><a href="#">Forgot password?</a></div>
                        <div className="signup">
                            Don’t have an account? <a href="#">Sign up</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};