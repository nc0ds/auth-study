import axios, { AxiosError, HeadersDefaults } from 'axios';
import { GetServerSidePropsContext } from 'next';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../hooks/useAuth';
import { AuthTokenError } from './errors/AuthTokenError';

interface FailedRequestItemProps {
	onSuccess(token: string): void;
	onFailed(err: AxiosError): void;
}

interface ResponseErrorDataProps {
	code: string;
	error: boolean;
	message: string;
}

interface ApiHeadersProps extends HeadersDefaults {
	Authorization: string;
}

let isRefreshing = false;
let failedRequestQueue: FailedRequestItemProps[] = [];

export const setupAPIClient = (
	ctx: GetServerSidePropsContext | undefined = undefined
) => {
	const { 'auth-study.token': token } = parseCookies(ctx);

	const api = axios.create({
		baseURL: 'http://localhost:3333',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	api.interceptors.response.use(
		(response) => response,
		(error: AxiosError) => {
			const errorData = error.response?.data as ResponseErrorDataProps;
			if (error.response?.status !== 401) {
				return Promise.reject(error);
			}

			if (errorData.code !== 'token.expired') {
				if (typeof window === 'object') {
					signOut();
				} else {
					return Promise.reject(new AuthTokenError());
				}
			}

			const { 'auth-study.refreshToken': refreshToken } = parseCookies(ctx);
			const originalConfig = error.config;

			if (!isRefreshing) {
				isRefreshing = true;

				api
					.post('/refresh', {
						refreshToken,
					})
					.then((response) => {
						const { token, refreshToken: newRefreshToken } = response.data;

						setCookie(ctx, 'auth-study.token', token, {
							maxAge: 60 * 60 * 24 * 30, // 30 days
							path: '/',
						});

						setCookie(ctx, 'auth-study.refreshToken', newRefreshToken, {
							maxAge: 60 * 60 * 24 * 30, // 30 days
							path: '/',
						});

						const apiHeaders = api.defaults.headers as ApiHeadersProps;
						apiHeaders.Authorization = `Bearer ${token}`;

						failedRequestQueue.forEach((item) => item.onSuccess(token));
						failedRequestQueue = [];
					})
					.catch((err) => {
						failedRequestQueue.forEach((item) => item.onFailed(err));
						failedRequestQueue = [];
					})
					.finally(() => {
						isRefreshing = false;
					});
			}

			return new Promise((resolve, reject) => {
				failedRequestQueue.push({
					onSuccess: (token: string) => {
						originalConfig.headers!['Authorization'] = `Bearer ${token}`;

						resolve(api(originalConfig));
					},
					onFailed: (err: AxiosError) => {
						reject(err);
					},
				});
			});
		}
	);

	return api;
};

export const api = setupAPIClient();
