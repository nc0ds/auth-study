import {
	GetServerSideProps,
	GetServerSidePropsContext,
	GetServerSidePropsResult,
} from 'next';

import { parseCookies } from 'nookies';

export const withSSRGuest = <P>(
	fn: GetServerSideProps<P>
): GetServerSideProps => {
	return async (
		ctx: GetServerSidePropsContext
	): Promise<GetServerSidePropsResult<P>> => {
		const { 'auth-study.token': token } = parseCookies(ctx);

		if (token) {
			return {
				redirect: {
					destination: '/dashboard',
					permanent: false,
				},
			};
		}

		return await fn(ctx);
	};
};
