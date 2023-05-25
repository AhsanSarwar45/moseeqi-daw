import { useRef } from "react";

export type getIdCallback = () => number;

export const useNumId = (): getIdCallback => {
    const id = useRef(0);

    return () => {
        return id.current++;
    };
};
