import { NextPage } from "next";
import dynamic from "next/dynamic";
// import Studio from '@Components/studio/Studio';

const StudioWithNoSSR = dynamic(() => import("@Components/studio/Studio"), {
    ssr: false,
});

const StudioPage: NextPage = () => {
    return <StudioWithNoSSR />;
};

export default StudioPage;
