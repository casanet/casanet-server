export const menus = [
    {
        'name': 'MINIONS',
        'icon': 'settings_remote',
        'link': 'tables/minions',
        // 'access': (user: User): boolean => user.access === 'manager' || (user.linkedSchools && user.linkedSchools.length > 1) ,
        'open': false
    },
    {
        'name': 'OPERATIONS',
        'icon': 'assignment',
        'link': 'tables/operation',
        'open': false
    },
    {
        'name': 'TIMINGS',
        'icon': 'alarm',
        'link': 'tables/timings',
        'open': false
    },
    {
        'name': 'DEVICES',
        'icon': 'devices',
        'link': 'tables/devices',
        'open': false
    },
    {
        'name': 'USERS',
        'icon': 'supervised_user_circle',
        'link': 'tables/users',
        'open': false
    }
];
