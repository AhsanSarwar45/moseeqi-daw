import { NextPage } from "next";
import dynamic from "next/dynamic";
// import Studio from '@components/studio/Studio';

const StudioWithNoSSR = dynamic(() => import("@components/studio/studio"), {
    ssr: false,
});

const StudioPage: NextPage = () => {
    return <StudioWithNoSSR />;
};

export default StudioPage;
