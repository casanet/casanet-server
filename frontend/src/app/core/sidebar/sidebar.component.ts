import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { Clock } from './clock';
import * as  Hebcal from 'hebcal';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'cdk-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit {

    daysInWeek: Array<String> = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'מוצאי שבת קודש'];

    constructor(private router: Router) {

    }

    routerHistory: RouteHistory[] = [];

    hebdate: Object = {};

    updateDayInfo() {
        const now = new Date();
        const hebrewDate = new Hebcal.HDate(now);
        hebrewDate.setLocation(32.083, 34.766);

        const hebrewDateAfetSunset = ((now.getTime() > hebrewDate.sunset())
            ? hebrewDate.next()
            : hebrewDate);


        let holidays = '';

        hebrewDateAfetSunset.holidays().forEach((event) => {
            holidays += event.desc[2] + ' ';
        });
        const zmanim = hebrewDate.getZemanim();
        this.hebdate = {
            day: this.daysInWeek[now.getDay()],
            parasha: `פ' ` + hebrewDateAfetSunset.getSedra('h'),
            todayGregoriany: now.toLocaleDateString(),
            holidays: holidays,
            hebrew_date: hebrewDateAfetSunset.toString('h'),
            dayTime: [
                {
                    title: 'זריחה',
                    time: hebrewDate.sunrise().toLocaleTimeString(),
                },
                {
                    title: 'שקיעה',
                    time: hebrewDate.sunset().toLocaleTimeString(),
                },
                {
                    title: 'עלות השחר',
                    time: zmanim.alot_hashachar.toLocaleTimeString(),
                },
                {
                    title: 'סופ"ז קרי"ש',
                    time: zmanim.sof_zman_shma.toLocaleTimeString(),
                },
                {
                    title: 'סופ"ז תפילה',
                    time: zmanim.sof_zman_tfilla.toLocaleTimeString(),
                },
                {
                    title: 'דף היומי',
                    time: hebrewDate.dafyomi('h'),
                },
                {
                    title: 'חצות היום',
                    time: zmanim.chatzot.toLocaleTimeString(),
                },
                {
                    title: 'מנחה גדולה',
                    time: zmanim.mincha_gedola.toLocaleTimeString(),
                },
                {
                    title: 'מנחה קטנה',
                    time: zmanim.mincha_ketana.toLocaleTimeString(),
                },
                {
                    title: 'פלג המנחה',
                    time: zmanim.plag_hamincha.toLocaleTimeString(),
                },
                {
                    title: 'צאת הכוכבים',
                    time: zmanim.tzeit.toLocaleTimeString(),
                },
                {
                    title: 'חצות הלילה',
                    time: zmanim.chatzot_night.toLocaleTimeString(),
                }
            ]
        };
    }

    ngOnInit() {
        this.updateDayInfo();
        setInterval(this.updateDayInfo.bind(this), 10 * 60 * 1000);
    }

    ngAfterViewInit() {

        // Turn on clock
        const clockCanvas = <HTMLCanvasElement>document.getElementById('clock');
        if (clockCanvas) {
            const clock = new Clock(clockCanvas);
        }
    }

    //   today: number = Date.now();
    // public bufferValue;

    // events = [
    //       {
    //         id: 'id',
    //         title: 'Business Meeting',
    //         time: '05:00 PM',
    //         state: 'state'
    //     },
    //     {
    //         id: 'id',
    //         title: 'Ask for a Vacation',
    //         time: '05:00 PM',
    //         state: 'state'
    //     },
    //     {
    //         id: 'id',
    //         title: 'Dinner with Micheal',
    //         time: '05:00 PM',
    //         state: 'state'
    //     },
    //     {
    //         id: 'id',
    //         title: 'Deadline for Project ABC',
    //         time: '05:00 PM',
    //         state: 'state'
    //     },
    // ];

    // todolists = [
    //       {
    //         id: 'id',
    //         title: 'Get to know Angular more',
    //         time: 'Added:4 days ago',
    //     },
    //     {
    //         id: 'id',
    //         title: 'Configure new Router',
    //         time: 'Added:4 days ago',
    //     },
    //     {
    //         id: 'id',
    //         title: 'Invite Joy to play Carroms',
    //         time: 'Added:4 days ago',
    //     },
    //     {
    //         id: 'id',
    //         title: 'Check SRS of Project X',
    //         time: 'Added:4 days ago',
    //     },
    // ];

    // messages = [
    //     {from: 'Catherin', subject: 'Shopping', content: 'hi there??'},
    //     {from: 'Jack', subject: 'Function', content: 'yes'},
    //     {from: 'Karina', subject: 'Get together', content: 'nice'},
    //     {from: 'Micheal', subject: 'Trip', content: 'ya.. I will'},
    //     {from: 'Ashik', subject: 'Meeting', content: 'Time??'},
    //     {from: 'Joy', subject: 'Party', content: 'Lets enjoy'},
    // ];
}
