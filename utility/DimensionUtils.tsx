import { Dimension } from "@Interfaces/Dimensions";

export const StrDimToNum = (dim: Dimension): number => {
    return parseInt(dim as string, 10);
};
