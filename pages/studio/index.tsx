import { NextPage } from 'next';
import dynamic from 'next/dynamic';

const StudioWithNoSSR = dynamic(() => import('@Components/studio/Studio'), { ssr: false });

const StudioPage: NextPage = () => {
	return <StudioWithNoSSR />;
};

export default StudioPage;
