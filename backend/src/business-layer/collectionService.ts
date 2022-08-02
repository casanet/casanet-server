import * as randomstring from 'randomstring';
import { collectionsDal, CollectionsDal } from '../data-layer/collectionDal';
import { Collection } from '../models/sharedInterfaces';

export class CollectionsService {

	/**
	 * Init CollectionsService . using dependency injection pattern to allow units testings.
	 * @param collectionsDal Inject collections dal.
	 */
	constructor(private collectionsDal: CollectionsDal) {
	}

	/**
	 * Get all collections collection.
	 */
	public async getCollections(): Promise<Collection[]> {
		return await this.collectionsDal.getCollections();
	}

	/**
	 * Get collection by id.
	 * @param collectionId collection id.
	 */
	public async getCollectionById(collectionId: string): Promise<Collection> {
		return await this.collectionsDal.getCollectionById(collectionId);
	}

	/**
	 * Set collection properties.
	 * @param collectionId collection id.
	 * @param collection collection props to set.
	 */
	public async setCollection(collectionId: string, collection: Collection): Promise<void> {
		collection.collectionId = collectionId;
		return await this.collectionsDal.updateCollection(collection);
	}

	/**
	 * Create collection.
	 * @param collection collection to create.
	 */
	public async createCollection(collection: Collection): Promise<Collection> {
		/**
		 * Generate new id. (never trust client....)
		 */
		collection.collectionId = randomstring.generate(6);
		await this.collectionsDal.createCollection(collection);
		return collection;
	}

	/**
	 * Delete collection.
	 * @param collectionId collection id to delete.
	 */
	public async deleteCollection(collectionId: string): Promise<void> {
		return await this.collectionsDal.deleteCollection(collectionId);
	}

}

export const collectionsService = new CollectionsService(collectionsDal);
