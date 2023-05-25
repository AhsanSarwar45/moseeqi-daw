import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface LoadingStoreState {
    isLoading: boolean;
    loadingMessage: string;
    setIsLoading: (isLoading: boolean) => void;
    setLoadingMessage: (loadingMessage: string) => void;
}

export const useLoadingStore = create<LoadingStoreState>()(
    subscribeWithSelector((set) => ({
        isLoading: false,
        loadingMessage: "Loading Instruments ...",
        setIsLoading: (isLoading: boolean) =>
            set((prev) => ({
                isLoading: isLoading,
            })),
        setLoadingMessage: (loadingMessage: string) =>
            set((prev) => ({
                loadingMessage: loadingMessage,
            })),
    }))
);

export const selectIsLoading = (state: LoadingStoreState) => state.isLoading;
export const selectLoadingMessage = (state: LoadingStoreState) =>
    state.loadingMessage;
