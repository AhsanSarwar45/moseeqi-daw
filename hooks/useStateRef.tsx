import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export function useStateRef<Type>(
    initialValue: Type
): [Type, Dispatch<SetStateAction<Type>>, React.MutableRefObject<Type>] {
    const [value, setValue] = useState(initialValue);

    const ref = useRef<Type>(value);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return [value, setValue, ref];
}
