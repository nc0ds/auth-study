import React, { useState, createContext, useContext, useEffect } from 'react';
import Router from 'next/router';
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import { api } from '../services/api';
import { HeadersDefaults } from 'axios';

interface SignInCredentialsType {
	email: string;
	password: string;
}

interface UserType {
	email: string;
	permissions: string[];
	roles: string[];
}

interface AuthContextData {
	signIn(credentials: SignInCredentialsType): Promise<void>;
	signOut(): void;
	isAuthenticated: boolean;
	user: UserType;
}

interface AuthContextProviderProps {
	children: React.ReactNode;
}

interface ApiHeadersProps extends HeadersDefaults {
	Authorization: string;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

let authChannel: BroadcastChannel;

export const signOut = (): void => {
	destroyCookie(undefined, 'auth-study.token');
	destroyCookie(undefined, 'auth-study.refreshToken');

	authChannel.postMessage('signOut');

	Router.push('/');
};

export const AuthProvider: React.FC<AuthContextProviderProps> = ({
	children,
}) => {
	const [user, setUser] = useState<UserType>({} as UserType);

	const isAuthenticated = !!user;

	const signIn = async ({
		email,
		password,
	}: SignInCredentialsType): Promise<void> => {
		try {
			const { data } = await api.post('/sessions', {
				email,
				password,
			});

			const { permissions, roles, token, refreshToken } = data;

			setUser({
				email,
				permissions,
				roles,
			});

			setCookie(undefined, 'auth-study.token', token, {
				maxAge: 60 * 60 * 24 * 30, // 30 days
				path: '/',
			});

			setCookie(undefined, 'auth-study.refreshToken', refreshToken, {
				maxAge: 60 * 60 * 24 * 30, // 30 days
				path: '/',
			});

			Router.push('/dashboard');

			const apiHeaders = api.defaults.headers as ApiHeadersProps;

			apiHeaders.Authorization = `Bearer ${token}`;

			authChannel.postMessage('signIn');
		} catch (err: any) {
			console.log('Deu bosta');
		}
	};

	useEffect(() => {
		const { 'auth-study.token': token } = parseCookies();
		authChannel = new BroadcastChannel('auth');

		if (token) {
			api
				.get('/me')
				.then(({ data }) =>
					setUser({
						email: data.email,
						permissions: data.permissions,
						roles: data.roles,
					})
				)
				.catch(() => {
					signOut();
				});
		}

		authChannel.onmessage = (message) => {
			switch (message.data) {
				case 'signOut':
				case 'signIn':
					window.location.reload();
					break;

				default:
					break;
			}
		};
	}, []);

	return (
		<AuthContext.Provider value={{ isAuthenticated, signIn, signOut, user }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextData => {
	const context = useContext(AuthContext);

	return context;
};
