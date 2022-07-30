import type { NextPage } from 'next';
import Head from 'next/head';
import { withSSRGuest } from '../utils/withSSRGuest';

import { Form } from '../components/Form';

const Home: NextPage = () => {
	return (
		<>
			<Head>
				<title>Auth Study</title>
			</Head>
			<Form />
		</>
	);
};

export const getServerSideProps = withSSRGuest(async () => {
	return {
		props: {},
	};
});

export default Home;
