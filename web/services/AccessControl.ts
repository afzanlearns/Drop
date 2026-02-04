export enum AccessMode {
    FULL_ACCESS = "full",
    READ_ONLY = "read_only",
    DROP_ONLY = "drop_only"
}

export function canRead(mode: AccessMode): boolean {
    return mode === AccessMode.FULL_ACCESS || mode === AccessMode.READ_ONLY;
}

export function canWrite(mode: AccessMode): boolean {
    return mode === AccessMode.FULL_ACCESS || mode === AccessMode.DROP_ONLY;
}
