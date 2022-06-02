const Select = (...keys: Array<string>) => {
    return (state: any) =>
        keys.reduce((obj: any, key) => {
            obj[key] = state[key];
            return obj;
        }, {});
};

export default Select;
