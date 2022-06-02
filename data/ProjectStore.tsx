import create from "zustand";

import { defaultProjectLength, defaultProjectName } from "./Defaults";

interface ProjectStoreState {
    projectName: string;
    projectLength: number;
    setProjectName: (name: string) => void;
    setProjectLength: (length: number) => void;
}

export const useProjectStore = create<ProjectStoreState>()((set) => ({
    projectName: defaultProjectName,
    projectLength: defaultProjectLength,
    setProjectName: (projectName: string) =>
        set((prev) => ({
            projectName: projectName,
        })),
    setProjectLength: (projectLength: number) =>
        set((prev) => ({
            projectLength: projectLength,
        })),
}));

export const selectProjectName = (state: ProjectStoreState) =>
    state.projectName;
export const selectProjectLength = (state: ProjectStoreState) =>
    state.projectLength;
