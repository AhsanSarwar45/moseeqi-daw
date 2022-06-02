const createId = () => {
    let state = 0;

    const getState = () => state++;

    return getState;
};

export default createId;
