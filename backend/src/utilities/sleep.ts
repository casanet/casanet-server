import { Duration as momentDuration } from 'moment';
import { Duration as unitsnetDuration } from "unitsnet-js";

/**
 * Simple utility to sleep by promise.
 * @param delayDuration Time duration to delay.
 */
export const Delay = (delayDuration: momentDuration): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, delayDuration.asMilliseconds());
  });
};

/**
 * Simple utility to sleep by promise.
 * @param delayDuration Time duration to delay.
 */
 export const sleep = (delayDuration: unitsnetDuration): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, delayDuration.Milliseconds);
  });
};
