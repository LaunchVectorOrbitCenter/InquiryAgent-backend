import { IMenus } from "./menusInterface";


export const MenusSeed: Partial<IMenus>[] = [
    {
        name: 'Dashboard',
        slug: 'dashboard',
        description: 'Dashboard menu',
        parentSlug: null,
        uri: '/dashboard'
    },
    {
        name: 'Stores',
        slug: 'stores',
        description: 'Stores menu',
        parentSlug: null,
        uri: '/stores'
    },
    {
        name: 'Emails',
        slug: 'emails',
        description: 'Emails menu',
        parentSlug: null,
        uri: '/email'
    },
    {
        name: 'Settings',
        slug: 'settings',
        description: 'Settings menu',
        parentSlug: null,
        uri: '/setting'
    },
    {
        name: 'Users',
        slug: 'users',
        description: 'Users menu',
        parentSlug: null,
        uri: '/users'
    },
    {
        name: 'Roles',
        slug: 'roles',
        description: 'Roles menu',
        parentSlug: null,
        uri: '/roles'
    }
];