import { IDataIO } from '../models/backendInterfaces';
import { Action, ErrorResponse } from '../models/sharedInterfaces';
import { DataIO } from './dataIO';

const ACTIONS_FILE_NAME = 'actions.json';

export class ActionsDal {
  private dataIo: IDataIO;

  /**
   * Actions.
   */
  private actions: Action[] = [];

  constructor(dataIo: IDataIO) {
    this.dataIo = dataIo;

    this.actions = dataIo.getDataSync();
  }

  /**
   * Get all Actions as array.
   */
  public async getActions(): Promise<Action[]> {
    return this.actions;
  }

  /**
   * Get Action by id.
   * @param actionId Action id.
   */
  public async getActionById(actionId: string): Promise<Action> {
    const action = this.findAction(actionId);

    if (!action) {
      throw {
        responseCode: 9404,
        message: 'action not exist',
      } as ErrorResponse;
    }
    return action;
  }

  /**
   * Save new Action.
   * @param newAction Action to create.
   */
  public async createAction(newAction: Action): Promise<void> {
    this.actions.push(newAction);

    await this.dataIo.setData(this.actions).catch(() => {
      this.actions.splice(this.actions.indexOf(newAction), 1);
      throw new Error('fail to save action');
    });
  }

  /**
   * Delete action.
   * @param actionId Action to action.
   */
  public async deleteAction(actionId: string): Promise<void> {
    const originalAction = this.findAction(actionId);

    if (!originalAction) {
      throw {
        responseCode: 9404,
        message: 'action not exist',
      } as ErrorResponse;
    }

    this.actions.splice(this.actions.indexOf(originalAction), 1);
    await this.dataIo.setData(this.actions).catch(() => {
      this.actions.push(originalAction);
      throw new Error('fail to save Action delete request');
    });
  }

  /**
   * Update Action.
   * @param action Action to update.
   */
  public async updateAction(action: Action): Promise<void> {
    const originalAction = this.findAction(action.actionId);

    if (!originalAction) {
      throw {
        responseCode: 9404,
        message: 'Action not exist',
      } as ErrorResponse;
    }

    this.actions.splice(this.actions.indexOf(originalAction), 1);
    this.actions.push(action);
    await this.dataIo.setData(this.actions).catch(() => {
      this.actions.splice(this.actions.indexOf(action), 1);
      this.actions.push(originalAction);
      throw new Error('fail to save action update request');
    });
  }

  /**
   * Find Action in Actions array
   */
  private findAction(actionId: string): Action {
    for (const action of this.actions) {
      if (action.actionId === actionId) {
        return action;
      }
    }
  }
}

export const actionsDal = new ActionsDal(new DataIO(ACTIONS_FILE_NAME));
