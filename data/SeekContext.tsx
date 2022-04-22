import React from "react";

export const SeekContext = React.createContext({
    seek: 0,
    setSeek: (newSeek: number) => { }
});