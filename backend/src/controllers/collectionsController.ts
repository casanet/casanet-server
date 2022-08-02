import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Path,
  Post,
  Put,
  Response,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { collectionsService } from '../business-layer/collectionService';
import { Collection, ErrorResponse } from '../models/sharedInterfaces';

/**
 * An collection of items, can be used for view aggregation of any item/s in the system
 */
@Tags('Collections')
@Route('collections')
export class CollectionsController extends Controller {

  /**
   * Get all the collections in the system.
   * @returns Collections array.
   */
  @Security('userAuth')
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Get()
  public async getCollections(): Promise<Collection[]> {
    return await collectionsService.getCollections();
  }

  /**
   * Get collection by id.
   * @returns Collection.
   */
  @Security('userAuth')
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Get('{collectionId}')
  public async getCollection(collectionId: string): Promise<Collection> {
    return await collectionsService.getCollectionById(collectionId);
  }

  /**
   * Update collection properties.
   * @param collectionId Collection id.
   * @param collection Collection object to update to.
   */
  @Security('userAuth')
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Put('{collectionId}')
  public async setCollection(collectionId: string, @Body() collection: Collection): Promise<void> {
    return await collectionsService.setCollection(collectionId, collection);
  }

  /**
   * Delete collection from the system.
   * @param collectionId Collection id.
   */
  @Security('userAuth')
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Delete('{collectionId}')
  public async deleteCollection(collectionId: string): Promise<void> {
    return await collectionsService.deleteCollection(collectionId);
  }

  /**
   *  Creates a new collection.
   * @param collection The new collection to create.
   * @returns The created collection
   */
  @Security('userAuth')
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Post()
  public async createCollection(@Body() collection: Collection): Promise<Collection> {
    return await collectionsService.createCollection(collection);
  }
}
