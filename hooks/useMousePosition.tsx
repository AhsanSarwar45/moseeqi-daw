// Taken from https://www.codedaily.io/tutorials/Create-a-useMousePosition-Hook-with-useEffect-and-useState-in-React

import { RefObject, useEffect, useState } from "react";

export const useMousePosition = <T extends HTMLElement = HTMLElement>(
    target: RefObject<T>
) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const setFromEvent = (event: MouseEvent) =>
            setPosition({ x: event.clientX, y: event.clientY });
        target.current?.addEventListener("mousemove", setFromEvent);

        const targetCopy = target.current;

        return () => {
            targetCopy?.removeEventListener("mousemove", setFromEvent);
        };
    }, []);

    return position;
};
