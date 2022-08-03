import { IDataIO } from '../models/backendInterfaces';
import { Collection, ErrorResponse } from '../models/sharedInterfaces';
import { DataIO } from './dataIO';

const COLLECTIONS_FILE_NAME = 'collections.json';

export class CollectionsDal {
  private dataIo: IDataIO;

  /**
   * Collections.
   */
  private collections: Collection[] = [];

  constructor(dataIo: IDataIO) {
    this.dataIo = dataIo;

    this.collections = dataIo.getDataSync();
  }

  /**
   * Get all Collections as array.
   */
  public async getCollections(): Promise<Collection[]> {
    return this.collections;
  }

  /**
   * Get Collection by id.
   * @param collectionId Collection id.
   */
  public async getCollectionById(collectionId: string): Promise<Collection> {
    const collection = this.findCollection(collectionId);

    if (!collection) {
      throw {
        responseCode: 9404,
        message: 'collection not exist',
      } as ErrorResponse;
    }
    return collection;
  }

  /**
   * Save new Collection.
   * @param newCollection Collection to create.
   */
  public async createCollection(newCollection: Collection): Promise<void> {
    this.collections.push(newCollection);

    await this.dataIo.setData(this.collections).catch(() => {
      this.collections.splice(this.collections.indexOf(newCollection), 1);
      throw new Error('fail to save collection');
    });
  }

  /**
   * Delete collection.
   * @param collectionId Collection to collection.
   */
  public async deleteCollection(collectionId: string): Promise<void> {
    const originalCollection = this.findCollection(collectionId);

    if (!originalCollection) {
      throw {
        responseCode: 10404,
        message: 'collection not exist',
      } as ErrorResponse;
    }

    this.collections.splice(this.collections.indexOf(originalCollection), 1);
    await this.dataIo.setData(this.collections).catch(() => {
      this.collections.push(originalCollection);
      throw new Error('fail to save Collection delete request');
    });
  }

  /**
   * Update Collection.
   * @param collection Collection to update.
   */
  public async updateCollection(collection: Collection): Promise<void> {
    const originalCollection = this.findCollection(collection.collectionId);

    if (!originalCollection) {
      throw {
        responseCode: 10404,
        message: 'Collection not exist',
      } as ErrorResponse;
    }

    this.collections.splice(this.collections.indexOf(originalCollection), 1);
    this.collections.push(collection);
    await this.dataIo.setData(this.collections).catch(() => {
      this.collections.splice(this.collections.indexOf(collection), 1);
      this.collections.push(originalCollection);
      throw new Error('fail to save collection update request');
    });
  }

  /**
   * Find Collection in Collections array
   */
  private findCollection(collectionId: string): Collection {
    for (const collection of this.collections) {
      if (collection.collectionId === collectionId) {
        return collection;
      }
    }
  }
}

export const collectionsDal = new CollectionsDal(new DataIO(COLLECTIONS_FILE_NAME));
