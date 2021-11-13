import { broadlinkToPulesArray, pulesArrayToBroadlink } from 'broadlink-ir-converter';
import * as moment from 'moment';
import { Duration } from 'moment';
import * as request from 'request-promise';
import { CommandsSet } from '../../models/backendInterfaces';
import { DeviceKind, ErrorResponse, Minion, MinionStatus, SwitchOptions, Toggle } from '../../models/sharedInterfaces';
import { CommandsCacheManager } from '../../utilities/cacheManager';
import { DeepCopy } from '../../utilities/deepCopy';
import { logger } from '../../utilities/logger';
import { Delay } from '../../utilities/sleep';
import { BrandModuleBase } from '../brandModuleBase';

export class TasmotaHandler extends BrandModuleBase {
  public readonly brandName: string = 'tasmota';

  public readonly devices: DeviceKind[] = [
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: -1,
      model: 'IR Transmitter as Toggle',
      supportedMinionType: 'toggle',
      isRecordingSupported: true,
      isFetchCommandsAvailable: true,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: 1,
      model: 'switch',
      supportedMinionType: 'switch',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: -1,
      model: 'IR Transmitter as AC',
      supportedMinionType: 'airConditioning',
      isRecordingSupported: false,
      isFetchCommandsAvailable: true,
    },
  ];

  private commandsCacheManager = new CommandsCacheManager(super.cacheFilePath)

  constructor() {
    super();
  }

  public async getStatus(minion: Minion): Promise<MinionStatus | ErrorResponse> {
    switch (minion.minionType) {
      case 'toggle':
        return await this.getBeamStatus(minion);
      case 'switch':
        return await this.getSwitchStatus(minion);
      case 'airConditioning':
        return await this.getBeamStatus(minion);
    }
  }

  public async setStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    switch (minion.minionType) {
      case 'toggle':
        return await this.setToggleStatus(minion, setStatus);
      case 'switch':
        return await this.setSwitchStatus(minion, setStatus);
      case 'airConditioning':
        return await this.setAcStatus(minion, setStatus);
    }
  }

  public async enterRecordMode(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    switch (minion.device.model) {
      case 'IR Transmitter as Toggle':
        return await this.recordRFToggleCommands(minion, statusToRecordFor);
      case 'IR Transmitter as AC':
        return await this.recordIRACommands(minion, statusToRecordFor);
    }
    throw {
      responseCode: 8404,
      message: 'unknown minion model',
    } as ErrorResponse;
  }

  public async generateCommand(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    throw {
      responseCode: 6409,
      message: 'the tasmota module not support any recording mode',
    } as ErrorResponse;
  }

  public async setFetchedCommands(minion: Minion, commandsSet: CommandsSet): Promise<void | ErrorResponse> {
    await this.commandsCacheManager.setFetchedCommands(minion, commandsSet);
  }

  public async refreshCommunication(): Promise<void> {
    // There's nothing to do.
  }

  private async getSwitchStatus(minion: Minion): Promise<MinionStatus | ErrorResponse> {
    try {
      const tasmotaStatus = await request(`http://${minion.device.pysicalDevice.ip}/cm?cmnd=Power`);
      const status = JSON.parse(tasmotaStatus).POWER.toLowerCase() as SwitchOptions;
      return {
        switch: {
          status,
        },
      };
    } catch (error) {
      logger.warn(`Sent Tosmota command ${minion.minionId} fail, ${JSON.stringify(error.message)}`);
      throw {
        responseCode: 1503,
        message: 'tosmota request fail.',
      } as ErrorResponse;
    }
  }

  private async getBeamStatus(minion: Minion): Promise<MinionStatus | ErrorResponse> {
    try {
      await request(`http://${minion.device.pysicalDevice.ip}/cm?cmnd=State`);

    } catch (error) {
      logger.warn(`Sent Tasmota command ${minion.minionId} fail, ${JSON.stringify(error.message)}`);
      throw {
        responseCode: 1503,
        message: 'tasmota request fail.',
      } as ErrorResponse;
    }
    return await this.commandsCacheManager.getCachedStatus(minion);
  }

  private async setSwitchStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    try {
      await request(`http://${minion.device.pysicalDevice.ip}/cm?cmnd=Power%20${setStatus[minion.minionType].status}`);
    } catch (error) {
      logger.warn(`Sent Tasmota command ${minion.minionId} fail, ${JSON.stringify(error.message)}`);
      throw {
        responseCode: 1503,
        message: 'tasmota request fail.',
      } as ErrorResponse;
    }
  }

  private async sendIrCommand(minion: Minion, setStatus: MinionStatus, hexCommandCode: string) {
    try {
      // Convert the broadlink command format to the pules array
      const pulesArray = broadlinkToPulesArray(hexCommandCode);

      // Convert the pules array to string separated by coma
      let pulsString = (pulesArray.reduce((pulesString, pules) => {
        return `${pulesString}${pules},`;
      }, ''));

      // Remove the last coma
      pulsString = pulsString.substring(0, pulsString.length - 1);

      const irSendFullUrl = `http://${minion.device.pysicalDevice.ip}/cm?cmnd=IRsend%20${pulsString}`;
      await request(irSendFullUrl);
      await Delay(moment.duration(1, 'seconds'));
      const rawResults = await request(irSendFullUrl);
      const results = JSON.parse(rawResults);
      if (results.IRSend !== 'Done') {
        throw new Error(`[tasmotaHandler.sendIrCommand] Sending IR command failed ${JSON.stringify(results)}`);
      }
      await this.commandsCacheManager.cacheLastStatus(minion, setStatus);
    } catch (error) {
      logger.warn(`Sent Tasmota command ${minion.minionId} fail, ${JSON.stringify(error.message)}`);
      throw {
        responseCode: 1503,
        message: 'tosmota request fail.',
      } as ErrorResponse;
    }
  }

  private async setToggleStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    const hexCommandCode = await this.commandsCacheManager.getRFToggleCommand(minion, setStatus) as string;
    await this.sendIrCommand(minion, setStatus, hexCommandCode);
  }

  private async setAcStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    const hexCommandCode = await this.commandsCacheManager.getIrCommand(minion, setStatus) as string;
    await this.sendIrCommand(minion, setStatus, hexCommandCode);
  }

  private async recordIRACommands(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    const hexIRCommand = await this.recordCommand(minion);
    await this.commandsCacheManager.cacheIRACommand(minion, statusToRecordFor, hexIRCommand);
  }

  private async recordRFToggleCommands(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    const hexIRCommand = await this.recordCommand(minion);
    await this.commandsCacheManager.cacheRFToggleCommand(minion, statusToRecordFor, hexIRCommand);
  }

  /**
   * Try fetch last IrReceived raw data from the tasmota console
   * Note that this is works way better by the MQTT protocol, without a payload size limitation etc.
   * @param minion The minion to get the code from
   * @returns The HexCommand code in the broadlink format
   */
  private async recordCommand(minion: Minion): Promise<string> {

    const getRawConsoleDataRequest = `http://${minion.device.pysicalDevice.ip}/cs?c2=0`;

    for (let index = 0; index < 5; index++) {
      try {
        await Delay(moment.duration(2, 'seconds'));
        const rawConsoleDataRequest = await request(getRawConsoleDataRequest) as string;
        let rawConsoleLines = rawConsoleDataRequest.split('\n');
        rawConsoleLines = rawConsoleLines.slice(Math.max(rawConsoleLines.length - 3, 0)).reverse();

        for (const rawConsoleLine of rawConsoleLines) {
          const rawData = rawConsoleLine.split(' = ')[1];
          const data = JSON.parse(rawData.endsWith('}1') ? rawData.substring(0, rawData.length - 2) : rawData);
          if (data.IrReceived && data.IrReceived.RawData) {
            return pulesArrayToBroadlink([0, ...data.IrReceived.RawData]);
          }
        }
      } catch (error) {
        logger.debug(`[TasmotaHandler.recordCommand] failed to read or parse IR results, try ${index}, error ${JSON.stringify(error)}`);
      }
    }

    throw {
      responseCode: 6409,
      message: 'fail to get the command',
    } as ErrorResponse;
  }
}
