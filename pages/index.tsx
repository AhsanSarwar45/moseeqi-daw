import { NextPage } from 'next';
import { NavBar } from '../src/components/NavBar';
import { Container } from '@chakra-ui/layout';

const Home: NextPage = () => {
	return (
		<Container maxWidth="full" padding={0}>
			<NavBar />
		</Container>
	);
};

export default Home;
