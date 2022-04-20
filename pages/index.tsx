import { NextPage } from 'next';
import { Navbar } from '@Components/NavBar';
import { Container } from '@chakra-ui/layout';

const Landing: NextPage = () => {
	return (
		<Container maxWidth="full" padding={0}>
			<Navbar />
		</Container>
	);
};

export default Landing;
