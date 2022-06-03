import { useState, useEffect } from "react";

export function useSsrCompatible<T>(newValue: T, initialValue: T) {
    const [value, setValue] = useState(initialValue);
    useEffect(() => {
        setValue(newValue);
    }, [newValue]);
    return value;
}
