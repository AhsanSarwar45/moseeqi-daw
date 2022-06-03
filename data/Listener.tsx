const Listener = () => {
    let isListenerAttached = false;

    const Add = (
        target: any,
        event: string,
        callback: (event: Event) => any
    ) => {
        if (!isListenerAttached) {
            target.addEventListener(event, callback);
            isListenerAttached = true;
            console.log("listener attached");
        }
    };

    const Remove = (
        target: any,
        event: string,
        callback: (event: Event) => any
    ) => {
        target.removeEventListener(event, callback);
        isListenerAttached = false;
        console.log("listener removed");
    };

    return [Add, Remove];
};

export default Listener;
