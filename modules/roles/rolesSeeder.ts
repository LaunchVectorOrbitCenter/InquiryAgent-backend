import UserRoles from "../../core/enums/userRoles";
import { IRoles } from "./rolesInterface";



export const RolesSeed: Partial<IRoles>[] = [
    {
        name: UserRoles.MANUFACTURER,
        slug: UserRoles.MANUFACTURER,
        permissions: [
            {
                menuSlug: 'dashboard',
                menuUri: '/dashboard',
                menuPermissions: [
                    {
                        'permissionSlug': 'dashboard_view',
                        'apiSlug': 'GET_DASHBOARD_INSIGHTS'
                    },
                    {
                        'permissionSlug': 'dashboard_view_connected_store_insight',
                        'apiSlug': null
                    },
                    {
                        'permissionSlug': 'dashboard_view_responded_emails_insight',
                        'apiSlug': null
                    },
                    {
                        'permissionSlug': 'dashboard_view_alerts_insight',
                        'apiSlug': null
                    },
                ]
            },
            {
                menuSlug: 'stores',
                menuUri: '/stores',
                menuPermissions: [
                    {
                        'permissionSlug': 'stores_view',
                        'apiSlug': 'LIST_STORES'
                    },
                    {
                        'permissionSlug': 'stores_create',
                        'apiSlug': 'CREATE_STORE'
                    },
                    {
                        'permissionSlug': 'stores_connect_disconnect_shopify',
                        'apiSlug': 'CONNECT_DISCONNECT_SHOPIFY'
                    },
                    {
                        'permissionSlug': 'stores_connect_disconnect_email',
                        'apiSlug': 'CONNECT_DISCONNECT_EMAIL'
                    },
                    {
                        'permissionSlug': 'stores_rename',
                        'apiSlug': 'UPDATE_STORE'
                    },
                    {
                        'permissionSlug': 'stores_delete',
                        'apiSlug': 'DELETE_STORE'
                    },
                    {
                        'permissionSlug': 'stores_view_analytics',
                        'apiSlug': 'GET_STORE_ANALYTICS'
                    },
                ]
            },
            {
                menuSlug: 'emails',
                menuUri: '/email',
                menuPermissions: [
                    {
                        'permissionSlug': 'emails_view',
                        'apiSlug': null
                    },
                    {
                        'permissionSlug': 'emails_list_stores',
                        'apiSlug': 'LIST_STORES'
                    },
                    {
                        'permissionSlug': 'emails_view_responded_emails_tab',
                        'apiSlug': 'LIST_EMAIL_QUERIES'
                    },
                    {
                        'permissionSlug': 'emails_view_responded_email',
                        'apiSlug': 'GET_EMAIL_QUERY_BY_ID'
                    },
                    {
                        'permissionSlug': 'emails_view_manual_emails_tab',
                        'apiSlug': 'LIST_EMAIL_QUERIES'
                    },
                    {
                        'permissionSlug': 'emails_view_manual_email',
                        'apiSlug': 'GET_EMAIL_QUERY_BY_ID'
                    },
                    {
                        'permissionSlug': 'emails_reply_manual_email',
                        'apiSlug': 'REPLY_EMAIL'
                    },
                ]
            },
            {
                menuSlug: 'users',
                menuUri: '/users',
                menuPermissions: [
                    {
                        'permissionSlug': 'users_view',
                        'apiSlug': 'LIST_USERS'
                    },
                    {
                        'permissionSlug': 'users_create',
                        'apiSlug': 'CREATE_USER'
                    },
                    {
                        'permissionSlug': 'users_update',
                        'apiSlug': 'UPDATE_USER'
                    }
                ]
            },
            {
                menuSlug: 'roles',
                menuUri: '/roles',
                menuPermissions: [
                    {
                        'permissionSlug': 'roles_view',
                        'apiSlug': 'LIST_ROLES'
                    },
                    {
                        'permissionSlug': 'roles_edit_permissions',
                        'apiSlug': 'GET_PERMISSIONS'
                    },
                    {
                        'permissionSlug': 'roles_save_permissions',
                        'apiSlug': 'ASSIGN_PERMISSIONS'
                    }
                ]
            },

        ]
    },
    {
        name: UserRoles.PLATFORM_ADMIN,
        slug: UserRoles.PLATFORM_ADMIN,
        permissions: [
            {
                menuSlug: 'dashboard',
                menuUri: '/dashboard',
                menuPermissions: [
                    {
                        'permissionSlug': 'dashboard_view',
                        'apiSlug': 'GET_DASHBOARD_INSIGHTS'
                    },
                    {
                        'permissionSlug': 'dashboard_view_connected_store_insight',
                        'apiSlug': null
                    },
                    {
                        'permissionSlug': 'dashboard_view_responded_emails_insight',
                        'apiSlug': null
                    },
                    {
                        'permissionSlug': 'dashboard_view_alerts_insight',
                        'apiSlug': null
                    },
                ]
            },
            {
                menuSlug: 'stores',
                menuUri: '/stores',
                menuPermissions: [
                    {
                        'permissionSlug': 'stores_view',
                        'apiSlug': 'LIST_STORES'
                    },
                    {
                        'permissionSlug': 'stores_create',
                        'apiSlug': 'CREATE_STORE'
                    },
                    {
                        'permissionSlug': 'stores_connect_disconnect_shopify',
                        'apiSlug': 'CONNECT_DISCONNECT_SHOPIFY'
                    },
                    {
                        'permissionSlug': 'stores_connect_disconnect_email',
                        'apiSlug': 'CONNECT_DISCONNECT_EMAIL'
                    },
                    {
                        'permissionSlug': 'stores_rename',
                        'apiSlug': 'UPDATE_STORE'
                    },
                    {
                        'permissionSlug': 'stores_delete',
                        'apiSlug': 'DELETE_STORE'
                    },
                    {
                        'permissionSlug': 'stores_view_analytics',
                        'apiSlug': 'GET_STORE_ANALYTICS'
                    },
                ]
            },
            {
                menuSlug: 'emails',
                menuUri: '/email',
                menuPermissions: [
                    {
                        'permissionSlug': 'emails_view',
                        'apiSlug': null
                    },
                    {
                        'permissionSlug': 'emails_list_stores',
                        'apiSlug': 'LIST_STORES'
                    },
                    {
                        'permissionSlug': 'emails_view_responded_emails_tab',
                        'apiSlug': 'LIST_EMAIL_QUERIES'
                    },
                    {
                        'permissionSlug': 'emails_view_responded_email',
                        'apiSlug': 'GET_EMAIL_QUERY_BY_ID'
                    },
                    {
                        'permissionSlug': 'emails_view_manual_emails_tab',
                        'apiSlug': 'LIST_EMAIL_QUERIES'
                    },
                    {
                        'permissionSlug': 'emails_view_manual_email',
                        'apiSlug': 'GET_EMAIL_QUERY_BY_ID'
                    },
                    {
                        'permissionSlug': 'emails_reply_manual_email',
                        'apiSlug': 'REPLY_EMAIL'
                    },
                ]
            },
            {
                menuSlug: 'users',
                menuUri: '/users',
                menuPermissions: [
                    {
                        'permissionSlug': 'users_view',
                        'apiSlug': 'LIST_USERS'
                    },
                    {
                        'permissionSlug': 'users_create',
                        'apiSlug': 'CREATE_USER'
                    },
                    {
                        'permissionSlug': 'users_update',
                        'apiSlug': 'UPDATE_USER'
                    }
                ]
            },
            {
                menuSlug: 'roles',
                menuUri: '/roles',
                menuPermissions: [
                    {
                        'permissionSlug': 'roles_view',
                        'apiSlug': 'LIST_ROLES'
                    },
                    {
                        'permissionSlug': 'roles_edit_permissions',
                        'apiSlug': 'GET_PERMISSIONS'
                    },
                    {
                        'permissionSlug': 'roles_save_permissions',
                        'apiSlug': 'ASSIGN_PERMISSIONS'
                    }
                ]
            },

        ]
    },
    {
        name: UserRoles.STORE_MANAGER,
        slug: UserRoles.STORE_MANAGER,
        permissions: [],
    },
    {
        name: UserRoles.SUPER_ADMINISTRATOR,
        slug: UserRoles.SUPER_ADMINISTRATOR,
        permissions: [
            {
                menuSlug: 'dashboard',
                menuUri: '/dashboard',
                menuPermissions: [
                    {
                        'permissionSlug': 'dashboard_view',
                        'apiSlug': 'GET_DASHBOARD_INSIGHTS'
                    },
                    {
                        'permissionSlug': 'dashboard_view_connected_store_insight',
                        'apiSlug': null
                    },
                    {
                        'permissionSlug': 'dashboard_view_responded_emails_insight',
                        'apiSlug': null
                    },
                    {
                        'permissionSlug': 'dashboard_view_alerts_insight',
                        'apiSlug': null
                    },
                ]
            },
            {
                menuSlug: 'stores',
                menuUri: '/stores',
                menuPermissions: [
                    {
                        'permissionSlug': 'stores_view',
                        'apiSlug': 'LIST_STORES'
                    },
                    {
                        'permissionSlug': 'stores_create',
                        'apiSlug': 'CREATE_STORE'
                    },
                    {
                        'permissionSlug': 'stores_connect_disconnect_shopify',
                        'apiSlug': 'CONNECT_DISCONNECT_SHOPIFY'
                    },
                    {
                        'permissionSlug': 'stores_connect_disconnect_email',
                        'apiSlug': 'CONNECT_DISCONNECT_EMAIL'
                    },
                    {
                        'permissionSlug': 'stores_rename',
                        'apiSlug': 'UPDATE_STORE'
                    },
                    {
                        'permissionSlug': 'stores_delete',
                        'apiSlug': 'DELETE_STORE'
                    },
                    {
                        'permissionSlug': 'stores_view_analytics',
                        'apiSlug': 'GET_STORE_ANALYTICS'
                    },
                ]
            },
            {
                menuSlug: 'emails',
                menuUri: '/email',
                menuPermissions: [
                    {
                        'permissionSlug': 'emails_view',
                        'apiSlug': null
                    },
                    {
                        'permissionSlug': 'emails_list_stores',
                        'apiSlug': 'LIST_STORES'
                    },
                    {
                        'permissionSlug': 'emails_view_responded_emails_tab',
                        'apiSlug': 'LIST_EMAIL_QUERIES'
                    },
                    {
                        'permissionSlug': 'emails_view_responded_email',
                        'apiSlug': 'GET_EMAIL_QUERY_BY_ID'
                    },
                    {
                        'permissionSlug': 'emails_view_manual_emails_tab',
                        'apiSlug': 'LIST_EMAIL_QUERIES'
                    },
                    {
                        'permissionSlug': 'emails_view_manual_email',
                        'apiSlug': 'GET_EMAIL_QUERY_BY_ID'
                    },
                    {
                        'permissionSlug': 'emails_reply_manual_email',
                        'apiSlug': 'REPLY_EMAIL'
                    },
                ]
            },
        ]
    },
    {
        name: UserRoles.SUPPORT_AGENT,
        slug: UserRoles.SUPPORT_AGENT,
        permissions: [],
    }
]