import { Dimension } from "@Types/Types";

export const StrDimToNum = (dim: Dimension): number => {
    return parseInt(dim as string, 10);
};
