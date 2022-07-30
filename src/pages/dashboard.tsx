import { NextPage } from 'next';
import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';
import { withSSRAuthed } from '../utils/withSSRAuthed';

import { Can } from '../components/Can';

const Dashboard: NextPage = () => {
	const { user, signOut } = useAuth();

	return (
		<>
			<Head>
				<title>Dashboard</title>
			</Head>
			<h1>Dashboard: {user?.email}</h1>
			<button onClick={signOut}>Sign Out</button>
			<Can roles={['editor', 'administrator']}>
				<h2>Métricas</h2>
			</Can>
		</>
	);
};

export const getServerSideProps = withSSRAuthed(async (ctx) => {
	return {
		props: {},
	};
});

export default Dashboard;
