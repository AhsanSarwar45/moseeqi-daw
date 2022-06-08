import { useEffect } from "react";

export const useEvent = (
    event: string,
    callback: EventListenerOrEventListenerObject,
    element: any = window
) => {
    useEffect(() => {
        console.log("added");
        element.addEventListener(event, callback);
        return () => element.removeEventListener(event, callback);
    }, [event, callback, element]);
};
