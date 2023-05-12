import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Path,
  Post,
  Put,
  Query,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { Action, ErrorResponse } from '../models/sharedInterfaces';
import { actionsService } from '../business-layer/actionsService';
import { MinionsRestriction } from '../security/restrictions';

@Tags('Actions')
@Route('actions')
export class ActionsController extends Controller {

  /**
   * Get all the actions in the system.
   * @returns Actions array.
   */
  @Security('userAuth')
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Get()
  public async getActions(): Promise<Action[]> {
    return await actionsService.getActions();
  }

  /**
   * Get action by id.
   * @returns Action.
   */
  @Security('userAuth')
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
	@MinionsRestriction({ requirePermission: 'READ', elementArgIndex: 0, extractMinionIds: async (actionId: string) => (await actionsService.getActionById(actionId)).minionId })
  @Get('{actionId}')
  public async getAction(actionId: string): Promise<Action> {
    return await actionsService.getActionById(actionId);
  }

  /**
  * Get minion's actions.
  * @returns Action.
  */
  @Security('userAuth')
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
	@MinionsRestriction({ requirePermission: 'READ', elementArgIndex: 0, extractMinionIds: (minionId: string) => minionId })
  @Get('/minion/{minionId}')
  public async getActionByMinion(minionId: string): Promise<Action[]> {
    return await actionsService.getMinionActions(minionId);
  }

  /**
   * Update action properties.
   * @param actionId Action id.
   * @param action Action object to update to.
   */
  @Security('userAuth')
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
	@MinionsRestriction({ requirePermission: 'WRITE', elementArgIndex: 0, extractMinionIds: async (actionId: string) => (await actionsService.getActionById(actionId)).minionId })
	@MinionsRestriction({ requirePermission: 'WRITE', elementArgIndex: 1, extractMinionIds: (action: Action) => action.minionId })
  @Put('{actionId}')
  public async setAction(actionId: string, @Body() action: Action): Promise<void> {
    return await actionsService.setAction(actionId, action);
  }

  /**
   * Set action active mode
   * @param actionId The action to set
   * @param active The mode to set
   */
  @Security('userAuth')
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
	@MinionsRestriction({ requirePermission: 'WRITE', elementArgIndex: 0, extractMinionIds: async (actionId: string) => (await actionsService.getActionById(actionId)).minionId })
  @Put('set-active/{actionId}')
  public async setActionActive(actionId: string, @Query() active: boolean): Promise<void> {
    return await actionsService.setActionActive(actionId, active);
  }

  /**
   * Delete action from the system.
   * @param actionId Action id.
   */
  @Security('userAuth')
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
	@MinionsRestriction({ requirePermission: 'WRITE', elementArgIndex: 0, extractMinionIds: async (actionId: string) => (await actionsService.getActionById(actionId)).minionId })
  @Delete('{actionId}')
  public async deleteAction(actionId: string): Promise<void> {
    return await actionsService.deleteAction(actionId);
  }

  /**
   *  Creates a new action.
   * @param action The new action to create.
   * @returns The created action
   */
  @Security('userAuth')
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
	@MinionsRestriction({ requirePermission: 'WRITE', elementArgIndex: 0, extractMinionIds: async (action: Action) => action.minionId })
  @Post()
  public async createAction(@Body() action: Action): Promise<Action> {
    return await actionsService.createAction(action);
  }
}
