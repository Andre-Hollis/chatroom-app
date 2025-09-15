import React from 'react';

import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useTitle } from '@/shared/hooks/useTitle';
import { getAxiosErrorOrThrow } from '@/shared/utils/error';
import { registerUser } from '@/modules/user/api';
import type { ISignupUser } from '@/modules/user/model';

import '../styles/Signup.scss';

const Signup = () => {
    const [submitting, setSubmitting] = React.useState<boolean>();
    const navigate = useNavigate();


    const {handleSubmit, register} = useForm<ISignupUser>();

    useTitle('Sign up');

    const onSubmit = (signupParams: ISignupUser) => {
        (async () => {
            try {
                setSubmitting(true);
                const user = await registerUser(signupParams);
                navigate('/');
            } catch (error) {
                toast.error(getAxiosErrorOrThrow((error)));
            } finally {
                setSubmitting(false);
            }
        })();
    };

    return (
        <div className="signup-container">
            <form onSubmit={handleSubmit(onSubmit)}>
                <h2>Sign Up</h2>
                <input type="email" placeholder="Email" required {...register('email_address')}/>
                <input type="password" placeholder="Password" required {...register('password')}/>
                <button type="submit" disabled={submitting}>Create Account</button>
            </form>
        </div>
    );
};

export default Signup;
