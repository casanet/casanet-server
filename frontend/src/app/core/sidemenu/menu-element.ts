export const menus = [
    {
        'name': 'MINIONS',
        'icon': 'wb_incandescent',
        'link': 'minions',
        // 'access': (user: User): boolean => user.access === 'manager' || (user.linkedSchools && user.linkedSchools.length > 1) ,
        'show': true,
        'open': false
    },
    {
        'name': 'OPERATIONS',
        'icon': 'assignment',
        'link': 'operations',
        'show': true,
        'open': false
    },
    {
        'name': 'TIMINGS',
        'icon': 'alarm',
        'link': 'timings',
        'show': true,
        'open': false
    },
    {
        'name': 'DEVICES',
        'icon': 'devices',
        'link': 'devices',
        'open': false,
        'show': true,
    },
    {
        'name': 'MUSIC',
        'icon': 'music_note',
        'link': 'music',
        'open': false,
        'show': localStorage.getItem('musicFrameUrl')
    },
    {
        'name': 'USERS',
        'icon': 'supervised_user_circle',
        'link': 'users',
        'open': false,
        'admin': true,
        'show': true,
    }
];
