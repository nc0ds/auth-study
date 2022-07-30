import { NextPage } from 'next';
import Head from 'next/head';
import { withSSRAuthed } from '../utils/withSSRAuthed';

export const Metrics: NextPage = () => {
	return (
		<>
			<Head>
				<title>Metrics</title>
			</Head>
			<h1>Metrics</h1>
		</>
	);
};

export const getServerSideProps = withSSRAuthed(
	async () => {
		return {
			props: {},
		};
	},
	{
		roles: ['editor'],
	}
);

export default Metrics;
