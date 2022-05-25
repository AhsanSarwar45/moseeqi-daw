import { useRef } from "react";

type GetIdCallback = () => number;

export const useNumId = (): GetIdCallback => {
    const id = useRef(0);

    return () => {
        return id.current++;
    };
};
