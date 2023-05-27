import { Dimension } from "@types/types";

export const StrDimToNum = (dim: Dimension): number => {
    return parseInt(dim as string, 10);
};
