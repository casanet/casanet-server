import { Action, ActionSet, ActionApply, ErrorResponse, Minion, MinionFeed } from '../models/sharedInterfaces';
import { actionsDal, ActionsDal } from '../data-layer/actionsDal';
import { logger } from '../utilities/logger';
import { MinionsBl, MinionsBlSingleton } from './minionsBl';
import { Duration } from 'unitsnet-js';
import isequal = require('lodash.isequal');
import * as randomstring from 'randomstring';
import { DeepCopy } from '../utilities/deepCopy';

const ACTIONS_ACTIVATION = Duration.FromSeconds(1);

export class ActionsService {

	/**
	 * Init ActionsService . using dependency injection pattern to allow units testings.
	 * @param actionsDal Inject actions dal.
	 * @param minionsService Inject the minion service.
	 */
	constructor(private actionsDal: ActionsDal, private minionsService: MinionsBl) {
		// Subscribe to each minion change
		this.minionsService.minionFeed.attach((minionFeed) => { this.onMinionStatusChange(minionFeed); });
		// Run in interval to force the action set, in case of ActionApply permanent.
		setInterval(() => { this.forceActionsActions(); }, ACTIONS_ACTIVATION.Milliseconds);
	}

	/**
	 * Force the permanent actions
	 */
	private async forceActionsActions() {
		// Get all actions in system
		const actions = await this.actionsDal.getActions();

		// Filter out all action that are not permanent
		const permanentActions = actions.filter(action => action.apply === 'permanent');

		// Check all action force set
		for (const action of permanentActions) {
			await this.detectActionTrigger(action);
		}

	}

	/**
	 * Detect if action need to be triggered
	 * @param action The action to detect 
	 */
	private async detectActionTrigger(action: Action) {
		// Get the minion of this action trigger, along with his status...
		const minion = await this.minionsService.getMinionById(action.minionId);
		// Get the minion trigger status
		const triggerStatus = action.ifStatus[minion.minionType];
		// Get the current minion status
		const status = minion.minionStatus[minion.minionType];
		// If status is not the status that should trigger the action, abort process
		if (!isequal(triggerStatus, status)) {
			return;
		}

		// If action is inactive, skip it
		if (!action.active) {
			logger.info(`[ActionsService.applyAction] action ${action.actionId}, "${action.name}" is inactive, skipping..."`);
			return;
		}

		logger.info(`[ActionsService.applyAction] action ${action.actionId} "${action.name}" triggered due to minion ${minion.minionId} status "${JSON.stringify(status)}" ..."`);
		// Apply the action 'then' part
		await this.applyAction(action.thenSet);
	}

	/**
	 * Handle minion update event
	 * @param minionFeed The minions feed object
	 */
	private async onMinionStatusChange(minionFeed: MinionFeed) {
		// If it's not an update, do nothing
		if (minionFeed.event !== 'update') {
			return;
		}

		// Trigger actions for this updated minion
		await this.triggerMinionStatusChangedActions(minionFeed.minion);
	}


	/** Trigger 'statusChange' of a certain minion that his status updated */
	private async triggerMinionStatusChangedActions(minion: Minion) {

		// Get all minion actions
		const minionActions = await this.getMinionActions(minion.minionId);
		logger.info(`[ActionsService.triggerMinionStatusChangedActions] Triggering minion ${minion.minionId} ${minionActions?.length} actions..."`);

		// Detect all of them if need to be triggered
		for (const minionAction of minionActions) {
			logger.info(`[ActionsService.triggerMinionStatusChangedActions] Triggering minion ${minion.minionId} action ${minionAction.actionId}..."`);
			await this.detectActionTrigger(minionAction);
		}
		logger.info(`[ActionsService.triggerMinionStatusChangedActions] Triggering minion ${minion.minionId} actions done"`);
	}

	/**
	 * Apply action set
	 * @param actionsAct The set to invoke 
	 */
	private async applyAction(actionsAct: ActionSet[]) {
		logger.info(`[ActionsService.applyAction] applying action set ..."`);
		for (const actionAct of actionsAct) {
			logger.info(`[ActionsService.applyAction] applying action set for ${actionAct.minionId}... "`);
			await this.minionsService.setMinionStatus(actionAct.minionId, actionAct.setStatus, 'action');
		}
		logger.info(`[ActionsService.applyAction] applying action set done"`);
	}

	/**
	 * Verify validity of action minion, statuses etc.
	 * @param action The action to validate
	 */
	private async validateActionParams(action: Action) {

		// Make sure the minion it self, is not in the trigger list...
		if (action.thenSet.find(set => set.minionId === action.minionId)) {
			logger.error(`[ActionsService.validateActionParams] Action is invalid, unable to set minion ${action.minionId} as trigger to it self`);
			throw {
				responseCode: 11405,
				message: 'setting self minion status by action is invalid',
			} as ErrorResponse;
		}

		// TODO: Make sure to abort circular action. (recursive walk...)
		// TODO: Make sure to not set same status, trigger same device twice...

		logger.info(`[ActionsService.validateActionParams] validating action..."`);

		// First get the triggered minion
		const minion = await this.minionsService.getMinionById(action.minionId);
		// Extract the status by the type 
		const ifStatus = action.ifStatus[minion.minionType];
		// If it's not there, the status is broken...
		if (!ifStatus) {
			logger.error(`[ActionsService.validateActionParams] Action trigger validation failed, no valid status for minion ${minion.minionId} in status "${JSON.stringify(action.ifStatus)}"`);
			throw {
				responseCode: 8405,
				message: 'action if status not contained triggered minion status type',
			} as ErrorResponse;
		}

		// Do the same test of the status, for each action set in the action
		for (const actionSet of action.thenSet) {
			const minionToSet = await this.minionsService.getMinionById(actionSet.minionId);
			const setStatus = actionSet.setStatus[minionToSet.minionType];
			if (!setStatus) {
				logger.error(`[ActionsService.validateActionParams] Action set validation failed, no valid status for minion ${actionSet.minionId} in status "${JSON.stringify(actionSet.setStatus)}"`);
				throw {
					responseCode: 9405,
					message: 'action set item status not contained target minion status type',
				} as ErrorResponse;
			}
		}


	}

	/**
	 * Get actions by minion
	 * @param minionId 
	 * @returns 
	 */
	public async getMinionActions(minionId: string) {
		const actions = await this.actionsDal.getActions();
		const minionActions = actions.filter(action => action.minionId === minionId);
		logger.info(`[ActionsService.getMinionActions] minion ${minionId} has ${minionActions.length} actions`);
		return minionActions;
	}

	/**
	 * Get all actions collection.
	 */
	public async getActions(): Promise<Action[]> {
		return await this.actionsDal.getActions();
	}

	/**
	 * Get action by id.
	 * @param actionId action id.
	 */
	public async getActionById(actionId: string): Promise<Action> {
		return await this.actionsDal.getActionById(actionId);
	}

	/**
	 * Set action properties.
	 * @param actionId action id.
	 * @param action action props to set.
	 */
	public async setAction(actionId: string, action: Action): Promise<void> {
		await this.validateActionParams(action);
		action.actionId = actionId;
		return await this.actionsDal.updateAction(action);
	}

	public async setActionActive(actionId: string, active: boolean): Promise<void> {
		const action = await this.getActionById(actionId);
		const actionCopy = DeepCopy(action);
		actionCopy.active = active;
		return await this.actionsDal.updateAction(actionCopy);
	}

	/**
	 * Create action.
	 * @param action action to create.
	 */
	public async createAction(action: Action): Promise<Action> {
		await this.validateActionParams(action);

		/**
		 * Generate new id. (never trust client....)
		 */
		action.actionId = randomstring.generate(6);
		await this.actionsDal.createAction(action);
		return action;
	}

	/**
	 * Delete action.
	 * @param actionId action id to delete.
	 */
	public async deleteAction(actionId: string): Promise<void> {
		return await this.actionsDal.deleteAction(actionId);
	}

}

export const actionsService = new ActionsService(actionsDal, MinionsBlSingleton);
