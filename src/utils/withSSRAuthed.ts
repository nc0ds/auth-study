import {
	GetServerSideProps,
	GetServerSidePropsContext,
	GetServerSidePropsResult,
} from 'next';

import { destroyCookie, parseCookies } from 'nookies';

import jwtDecode from 'jwt-decode';
import { validateUserPermissions } from './validateUserPermissions';

interface WithSSRAuthedOptions {
	permissions?: string[];
	roles?: string[];
}

export const withSSRAuthed = <P>(
	fn: GetServerSideProps<P>,
	options: WithSSRAuthedOptions = {}
): GetServerSideProps => {
	return async (
		ctx: GetServerSidePropsContext
	): Promise<GetServerSidePropsResult<P>> => {
		const { 'auth-study.token': token } = parseCookies(ctx);

		if (!token) {
			return {
				redirect: {
					destination: '/',
					permanent: false,
				},
			};
		}

		if (options) {
			const user = jwtDecode<{ permissions: string[]; roles: string[] }>(token);
			const { permissions, roles } = options;

			const userHasValidPermissions = validateUserPermissions({
				user,
				permissions,
				roles,
			});

			if (!userHasValidPermissions) {
				return {
					redirect: {
						destination: '/dashboard',
						permanent: false,
					},
				};
			}
		}

		try {
			return await fn(ctx);
		} catch (err) {
			destroyCookie(ctx, 'auth-study.token');
			destroyCookie(ctx, 'auth-study.refreshToken');

			return {
				redirect: {
					destination: '/',
					permanent: false,
				},
			};
		}
	};
};
