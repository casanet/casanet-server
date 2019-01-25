import { Component, OnInit } from '@angular/core';
import { Minion, SwitchOptions, Toggle, MinionStatus } from '../../../../backend/src/models/sharedInterfaces';

@Component({
    selector: 'app-dashboard-crm',
    templateUrl: './dashboard-crm.component.html',
    styleUrls: ['./dashboard-crm.component.scss']
})

export class DashboardCrmComponent implements OnInit {

    public minionA: Minion[] = [
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {
                switch: {
                    status: 'on',
                }
            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        }
    ];

    public minions: Minion[] = [
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'besteverof efgfeg gfegfe e ert er r',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {
                switch: {
                    status: 'on',
                }
            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {
                airConditioning: {
                    fanStrength: 'auto',
                    mode: 'auto',
                    status: 'on',
                    temperature: 21,
                }
            },
            minionType: 'airConditioning',
            name: 'minion name',
            isProperlyCommunicated: false,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'toggle',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {
                toggle: {
                    status: 'on',
                }
            },
            minionType: 'toggle',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {
                light: {
                    status: 'on',
                    brightness: 16,
                }
            },
            minionType: 'light',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {
                colorLight: {
                    status: 'on',
                    blue: 100,
                    red: 101,
                    brightness: 15,
                    green: 128,
                    temperature: 12,
                }
            },
            minionType: 'colorLight',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {
                temperatureLight: {
                    brightness: 34,
                    status: 'on',
                    temperature: 53,
                }
            },
            minionType: 'temperatureLight',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },
        {
            device: {
                brand: 'b',
                model: 'm',
                pysicalDevice: {
                    mac: 'mac',
                },
            },
            minionId: 'mi',
            minionStatus: {

            },
            minionType: 'switch',
            name: 'minion name',
            isProperlyCommunicated: true,
        },

    ];

    constructor() { }

    ngOnInit() {
    }

    private setDefaultValue(minionStatus: MinionStatus) {

    }

    public getMinionOnOffStatus(minion: Minion): SwitchOptions {
        if (!minion.minionStatus[minion.minionType]) {
            minion.minionStatus[minion.minionType] = {
                status: 'off',
            };
        }

        const minionSwitchStatus = minion.minionStatus[minion.minionType] as Toggle;
        return minionSwitchStatus.status;
    }

    public getMinionColor(minion: Minion): { dark: string, light: string } {
        const switchStatus = this.getMinionOnOffStatus(minion);
        if (minion.minionType !== 'toggle' && (!switchStatus || switchStatus !== 'on')) {
            return {
                light: '#494a4c',
                dark: '#8c8f93'
            };
        }

        switch (minion.minionType) {
            case 'toggle':
                return {
                    light: '#42A5F5',
                    dark: '#64B5F6'
                };
            case 'switch':
                return {
                    light: '#26A69A',
                    dark: '#4DB6AC'
                };
            case 'airConditioning':
                return {
                    light: '#5C6BC0',
                    dark: '#7986CB'
                };
            case 'light':
                return {
                    light: '#66BB6A',
                    dark: '#81C784'
                };
            case 'temperatureLight':
                return {
                    light: '#66BB6A',
                    dark: '#81C784'
                };
            case 'colorLight':
                return {
                    light: '#66BB6A',
                    dark: '#81C784'
                };
        }
    }

    setStatus(minion: Minion, status: SwitchOptions) {

        minion.minionStatus[minion.minionType].status = status;
    }

    reScanMinion(minion: Minion) {

    }
}
