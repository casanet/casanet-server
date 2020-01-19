import { Duration } from 'moment';

/**
 * Simple utility to sleep by promise.
 * @param delayDuration Time duration to delay.
 */
export const Delay = (delayDuration: Duration): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, delayDuration.asMilliseconds());
  });
};
