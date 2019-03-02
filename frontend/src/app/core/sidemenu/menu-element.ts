export const menus = [
    {
        'name': 'MINIONS',
        'icon': 'wb_incandescent',
        'link': 'auth/minions',
        // 'access': (user: User): boolean => user.access === 'manager' || (user.linkedSchools && user.linkedSchools.length > 1) ,
        'open': false
    },
    {
        'name': 'OPERATIONS',
        'icon': 'assignment',
        'link': 'auth/operation',
        'open': false
    },
    {
        'name': 'TIMINGS',
        'icon': 'alarm',
        'link': 'auth/timings',
        'open': false
    },
    {
        'name': 'DEVICES',
        'icon': 'devices',
        'link': 'auth/devices',
        'open': false
    },
    {
        'name': 'USERS',
        'icon': 'supervised_user_circle',
        'link': 'auth/users',
        'open': false
    }
];
