
export const GetNewPartStartColumn = (column: number) => {
    return Math.floor(column / 8) * 8;
}