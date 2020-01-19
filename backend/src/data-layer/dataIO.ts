import * as fse from 'fs-extra';
import * as path from 'path';
import { Configuration } from '../config';
import { IDataIO } from '../models/backendInterfaces';
import { logger } from '../utilities/logger';

/**
 * Used for r/w files.
 */
export class DataIO implements IDataIO {
  public static readonly DATA_DIRACTORY = path.join('./data/', Configuration.runningMode);

  /**
   * File pull path.
   */
  private filePath: string;

  /**
   * Init data IO.
   * @param fileName File name to r/w from.
   */
  constructor(private fileName: string) {
    this.filePath = path.join(DataIO.DATA_DIRACTORY, this.fileName);
  }

  /**
   * Get data sync.
   * Use it in init only. else the app will black until read finish.
   */
  public getDataSync(): any[] {
    try {
      return fse.readJSONSync(this.filePath);
    } catch (error) {
      return [];
    }
  }

  public async getData(): Promise<any[]> {
    const data = await fse.readJSON(this.filePath).catch(err => {
      logger.warn(`Fail to read ${this.fileName} file, ${err}`);
      throw new Error('Fail to read data');
    });
    return data;
  }

  public async setData(data: any[]): Promise<void> {
    await fse.outputFile(this.filePath, JSON.stringify(data, null, 2)).catch(err => {
      logger.warn(`Fail to write ${this.fileName} file, ${err}`);
      throw new Error('Fail to write data');
    });
  }
}
