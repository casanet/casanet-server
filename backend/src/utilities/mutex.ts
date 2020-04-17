import { Semaphore } from 'await-semaphore';
import { logger } from "./logger";

const minionsAccessSemaphore = new Semaphore(1);

export function MutexMinionsAccess(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalValue = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const release = await minionsAccessSemaphore.acquire();
    try {
      logger.debug(`[Mutex] Locking minion access for "${propertyKey}"`);
      const results = await originalValue.apply(this, args);
      logger.debug(`[Mutex] Release minion access for "${propertyKey}"`);
      release();
      return results;
    } catch (error) {
      logger.debug(`[Mutex] Throwing the original error & release minion access for "${propertyKey}"`);
      release();
      throw error;
    }
  }
}