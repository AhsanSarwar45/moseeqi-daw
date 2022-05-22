import { useRef } from "react";

type GetIdCallback = () => number;

export const useNumId = (): GetIdCallback => {
    const id = useRef(0);

    return () => {
        // console.log(id.current);
        return id.current++;
    };
};
