/**
 * Copy Json object/array by *val*.
 * @param fromData data to copy from.
 * @returns A totaly new copy of data.
 */
export const DeepCopy = <T>(fromData: T): T => {
    return JSON.parse(JSON.stringify(fromData)) as T;
};
