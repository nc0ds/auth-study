import React, { useState } from 'react';

import { useAuth } from '../../hooks/useAuth';

import styles from './styles.module.scss';

export const Form: React.FC = () => {
	const { signIn } = useAuth();
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const data = {
			email,
			password,
		};

		await signIn(data);
	};

	return (
		<form className={styles.container} onSubmit={handleSubmit}>
			<h2>Login</h2>
			<input
				type='email'
				placeholder='Email'
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<input
				type='password'
				placeholder='Password'
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<button type='submit'>Sign in</button>
		</form>
	);
};
