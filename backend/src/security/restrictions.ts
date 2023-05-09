import { MinionsBlSingleton } from "../business-layer/minionsBl";
import { ErrorResponse, Minion as InternalMinion, RestrictionItem, RestrictionType, User } from "../models/sharedInterfaces";
import { DeepCopy } from "../utilities/deepCopy";
import { logger } from "../utilities/logger";

export interface Minion extends InternalMinion {
    /** True if user has only readonly access to current minion */
    readonly?: boolean;
}

export interface MinionsRestrictionOptions {
    /** The permission that not allowed by it to authorize access  */
    restrictPermission: RestrictionType;
    /** The function argument index, to extract from it the minion id */
    elementArgIndex: number;
    /** A function to extract from args payload the minion id  */
    extractMinionIds: (data: any) => (string | string[] | Promise<string> | Promise<string[]>);
}

/**
 * Validate user's action access to a minion, throw error in case not authorized
 * @param user The use who trying to access
 * @param minionId The minion id
 * @param restrictPermission The permission that not allowed by it to authorize access
 * @returns The restriction object, if exists and has access.
 */
async function validateMinionRestriction(user: User, minionId: string, restrictPermission: RestrictionType): Promise<RestrictionItem | undefined> {
    // No restriction applied to admins
    if (user.scope === 'adminAuth') {
        return;
    }

    // Get the minion data
    const minion = await MinionsBlSingleton.getMinionById(minionId);
    // Look for the relevant restriction
    const restriction = minion?.restrictions?.find(r => r.userEmail === user.email);

    // If there is no, abort process
    if (!restriction) {
        return;
    }

    // If user has write access, or action is blocked only for total blocked users, and user has read access
    if (restriction.restrictionType === 'WRITE' || (restrictPermission === 'BLOCK' && restriction.restrictionType === 'READ')) {
        return restriction;
    }

    throw {
        message: 'Object is restricted to current user',
        responseCode: 7403,
    } as ErrorResponse;
}

/**
 * Sanitize minion sensitive data
 * @param user The user who require access to the minion data
 * @param minion The minion full object
 * @returns A sanitized payload of the minion
 */
async function sanitizeMinion(user: User, minion: Minion): Promise<Minion> {

    // First make sure user has no restriction to access read this minion, then get the restriction object belong to the current user
    const restriction = await validateMinionRestriction(user, minion.minionId, 'BLOCK');
    // Copy the payload
    const minionCopy = DeepCopy<Minion>(minion);
    // For now, show device id, and only hide the token
    // delete minionCopy.device.deviceId;
    delete minionCopy.device.token;

    // Non-admin users should not have access to the restrictions data, and may have readonly access 
    if (user.scope != 'adminAuth') {
        // Mark minion as readonly, if there is restriction on it     
        minionCopy.readonly = restriction?.restrictionType === 'READ';
        // Remove restrictions to not be visible to non admin
        delete minionCopy.restrictions;
    }

    return minionCopy;
}

/**
 * Validate minion restriction annotation - activate it before allowing API call to be invoked
 * Make sure user has no restriction to access or modify the given resource.
 * @param options The restriction validator options
 */
export const MinionsRestriction = (options: MinionsRestrictionOptions) => (target: any, key: string, descriptor: PropertyDescriptor) => {
    const { restrictPermission: action, elementArgIndex, extractMinionIds } = options;
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {

        // Extract the minion/s id/s from the original args
        const minionIds = await extractMinionIds(args[elementArgIndex]);

        // If there is only one, validate it, else validate everyone one by one
        if (typeof minionIds === 'string') {
            await validateMinionRestriction(this.request.user, minionIds, action)
        } else if (Array.isArray(minionIds)) {
            for (const minionId of minionIds) {
                await validateMinionRestriction(this.request.user, minionId, action)
            }
        }

        // Validation passed, run the original call
        return await originalMethod.apply(this, args);
    };
    return descriptor;
}

/**
 * Validate minion/s restriction annotation to activate before giving minion's data to the consumer.
 * Used when consumer has restriction to some of minions, this annotation will filter out non-authorized minion from the final response payload
 * @param extractMinionId The callback to extract the minion id from any item in the returned collection payload 
 * @returns The filtered collection
 */
export const MinionsResultsRestriction = <T>(extractMinionId: (data: T) => (string)) => (target: any, key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
        const result = await originalMethod.apply(this, args);

        // No restriction applied to admins
        if (this.request?.user?.scope === 'adminAuth') {
            return result;
        }

        // Crete new collection for all minion that can be sent to the consumer
        const filteredMinions = [];

        for (const item of result) {
            // Extract the minion
            const minionId = extractMinionId(item);

            // If no minion extracted, just skip it
            if (!minionId) {
                continue;
            }

            try {
                const minion = await MinionsBlSingleton.getMinionById(minionId);

                // Find the restriction if there is
                const restriction = minion?.restrictions?.find(r => r.userEmail === this.request.user.email);

                // If user have read access, add the minion to the final collection
                if (restriction?.restrictionType !== 'BLOCK') {
                    filteredMinions.push(item);
                }
            } catch (error) {
                logger.warn(`[MinionsResultsRestriction] Failed to validate minion "${minionId}" restriction, skipping adding to collection err: ${error?.message}`);
            }

        }

        return filteredMinions;
    };
    return descriptor;
}

/**
 * Sanitize minion annotation to activate before giving it to the consumer.
 * @returns The sanitized minion/s object
 */
export const MinionSanitation = () => (target: any, key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        const result = await originalMethod.apply(this, args);

        // If payload is one object of a minion
        if (!Array.isArray(result)) {
            return await sanitizeMinion(this.request.user, result);
        }

        // Crete new collection for all minion that can be sent to the consumer
        const sanitizedMinions = [];

        // Sanitize all minions in the collection and add the sainted minion to the final collection
        for (const minion of result) {
            sanitizedMinions.push(await sanitizeMinion(this.request.user, minion))
        }

        return sanitizedMinions;
    };
    return descriptor;
}