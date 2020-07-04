import { ErrorResponse, Timing } from '../../../src/models/sharedInterfaces';

export class TimingsDalMock {
  public mockTimings: Timing[] = [
    {
      isActive: true,
      timingId: 'td1',
      timingName: 'timing a',
      timingProperties: {
        once: {
          date: new Date().getTime(),
        },
      },
      timingType: 'once',
      triggerOperationId: 'o1',
    },
    {
      isActive: true,
      timingId: 'ts1',
      timingName: 'timing as',
      timingProperties: {
        dailySunTrigger: {
          days: ['saturday'],
          durationMinutes: -30,
          sunTrigger: 'sunrise',
        },
      },
      timingType: 'dailySunTrigger',
      triggerOperationId: 'o1',
    },
    {
      isActive: true,
      timingId: 'tt1',
      timingName: 'timing at',
      timingProperties: {
        dailyTimeTrigger: {
          days: ['saturday'],
          hour: 22,
          minutes: 35,
        },
      },
      timingType: 'dailyTimeTrigger',
      triggerOperationId: 'o1',
    },
    {
      isActive: true,
      timingId: 'to1',
      timingName: 'timing to',
      timingProperties: {
        timeout: {
          startDate: new Date().getTime(),
          durationInMinutes: 1,
        },
      },
      timingType: 'timeout',
      triggerOperationId: 'o1',
    },
  ];

  /**
   * Find timing in timings array
   */
  private findTiming(timingId: string): Timing {
    for (const timing of this.mockTimings) {
      if (timing.timingId === timingId) {
        return timing;
      }
    }
  }

  /**
   * Get all timings as array.
   */
  public async getTimings(): Promise<Timing[]> {
    return this.mockTimings;
  }

  /**
   * Get timing by id.
   * @param timingId timing id.
   */
  public async getTimingById(timingId: string): Promise<Timing> {
    const timing = this.findTiming(timingId);

    if (!timing) {
      throw new Error('timing not exist');
    }
    return timing;
  }

  /**
   * Save new timing.
   * @param newTiming timing to create.
   */
  public async createTiming(newTiming: Timing): Promise<void> {
    this.mockTimings.push(newTiming);
  }

  /**
   * Delete timing.
   * @param timing timing to delete.
   */
  public async deleteTiming(timingId: string): Promise<void> {
    const originalMinion = this.findTiming(timingId);

    if (!originalMinion) {
      throw new Error('timing not exist');
    }

    this.mockTimings.splice(this.mockTimings.indexOf(originalMinion), 1);
  }

  /**
   * Update timing.
   * @param timing timing to update.
   */
  public async updateTiming(timing: Timing): Promise<void> {
    const originalMinion = this.findTiming(timing.timingId);

    if (!originalMinion) {
      throw {
        responseCode: 4004,
        message: 'timing not exist',
      } as ErrorResponse;
    }

    this.mockTimings.splice(this.mockTimings.indexOf(originalMinion), 1);
    this.mockTimings.push(timing);
  }
}
