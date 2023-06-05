import { Dimension } from "@custom-types/types";

export const StrDimToNum = (dim: Dimension): number => {
    return parseInt(dim as string, 10);
};
