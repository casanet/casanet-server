export const menus = [
    {
        'name': 'MINIONS',
        'icon': 'wb_incandescent',
        'link': 'minions',
        // 'access': (user: User): boolean => user.access === 'manager' || (user.linkedSchools && user.linkedSchools.length > 1) ,
        'open': false
    },
    {
        'name': 'OPERATIONS',
        'icon': 'assignment',
        'link': 'operations',
        'open': false
    },
    {
        'name': 'TIMINGS',
        'icon': 'alarm',
        'link': 'timings',
        'open': false
    },
    {
        'name': 'DEVICES',
        'icon': 'devices',
        'link': 'devices',
        'open': false
    },
    {
        'name': 'USERS',
        'icon': 'supervised_user_circle',
        'link': 'auth/users',
        'open': false
    }
];
