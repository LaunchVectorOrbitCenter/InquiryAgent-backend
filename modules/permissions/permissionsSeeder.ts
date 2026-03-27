import { IPermissions } from "./permissionsInterface";


export const PermissionsSeed: Partial<IPermissions>[] = [
    //* DASHBOARD PERMISSIONS */
    {
        name: 'dashboard.view',
        slug: 'dashboard_view',
        menuName: 'Dashboard',
        menuSlug: 'dashboard',
        description: 'Dashboard view permission',
        apiSlug: 'GET_DASHBOARD_INSIGHTS',
    },
    {
        name: 'dashboard.view_connected_store_insight',
        slug: 'dashboard_view_connected_store_insight',
        menuName: 'Dashboard',
        menuSlug: 'dashboard',
        description: 'Dashboard view connected store insight permission',
        apiSlug: null
    },
    {
        name: 'dashboard.view_responded_emails_insight',
        slug: 'dashboard_view_responded_emails_insight',
        menuName: 'Dashboard',
        menuSlug: 'dashboard',
        description: 'Dashboard view responded emails insight permission',
        apiSlug: null
    },
    {
        name: 'dashboard.view_alerts_insight',
        slug: 'dashboard_view_alerts_insight',
        menuName: 'Dashboard',
        menuSlug: 'dashboard',
        description: 'Dashboard view alerts insight permission',
        apiSlug: null
    },


    //* STORES PERMISSIONS */
    {
        name: 'stores.view',
        slug: 'stores_view',
        menuName: 'Stores',
        menuSlug: 'stores',
        description: 'Stores view permission',
        apiSlug: 'LIST_STORES'
    },

    {
        name: 'stores.create',
        slug: 'stores_create',
        menuName: 'Stores',
        menuSlug: 'stores',
        description: 'Stores create permission',
        apiSlug: 'CREATE_STORE'
    },
    {
        name: 'stores.connect_disconnect_shopify',
        slug: 'stores_connect_disconnect_shopify',
        menuName: 'Stores',
        menuSlug: 'stores',
        description: 'Stores connect disconnect shopify permission',
        apiSlug: 'CONNECT_DISCONNECT_SHOPIFY'
    },
    {
        name: 'stores.connect_disconnect_email',
        slug: 'stores_connect_disconnect_email',
        menuName: 'Stores',
        menuSlug: 'stores',
        description: 'Stores connect disconnect email permission',
        apiSlug: 'CONNECT_DISCONNECT_EMAIL'
    },
    {
        name: 'stores.rename',
        slug: 'stores_rename',
        menuName: 'Stores',
        menuSlug: 'stores',
        description: 'Stores rename permission',
        apiSlug: 'UPDATE_STORE'
    },
    {
        name: 'stores.delete',
        slug: 'stores_delete',
        menuName: 'Stores',
        menuSlug: 'stores',
        description: 'Stores delete permission',
        apiSlug: 'DELETE_STORE'
    },
    {
        name: 'stores.view_analytics',
        slug: 'stores_view_analytics',
        menuName: 'Stores',
        menuSlug: 'stores',
        description: 'Stores view analytics permission',
        apiSlug: 'GET_STORE_ANALYTICS'
    },


    //* EMAILS PERMISSIONS */

    {
        name: 'emails.view',
        slug: 'emails_view',
        menuName: 'Emails',
        menuSlug: 'emails',
        description: 'Emails view permission',
        apiSlug: null
    },
    {
        name: 'emails.list_stores',
        slug: 'emails_list_stores',
        menuName: 'Emails',
        menuSlug: 'emails',
        description: 'Emails list stores permission',
        apiSlug: 'LIST_STORES'
    },
    {
        name: 'emails.view_responded_emails_tab',
        slug: 'emails_view_responded_emails_tab',
        menuName: 'Emails',
        menuSlug: 'emails',
        description: 'Emails view responded emails tab permission',
        apiSlug: 'LIST_EMAIL_QUERIES'
    },
    {
        name: 'emails.view_responded_email',
        slug: 'emails_view_responded_email',
        menuName: 'Emails',
        menuSlug: 'emails',
        description: 'Emails view responded email permission',
        apiSlug: 'GET_EMAIL_QUERY_BY_ID'
    },
    {
        name: 'emails.view_manual_emails_tab',
        slug: 'emails_view_manual_emails_tab',
        menuName: 'Emails',
        menuSlug: 'emails',
        description: 'Emails view responded emails tab permission',
        apiSlug: 'LIST_EMAIL_QUERIES'
    },
    {
        name: 'emails.view_manual_email',
        slug: 'emails_view_manual_email',
        menuName: 'Emails',
        menuSlug: 'emails',
        description: 'Emails view manual email permission',
        apiSlug: 'GET_EMAIL_QUERY_BY_ID'
    },
    {
        name: 'emails.all_status_filter',
        slug: 'emails_all_status_filter',
        menuName: 'Emails',
        menuSlug: 'emails',
        description: 'Emails all status filter permission',
        apiSlug: 'LIST_EMAIL_QUERIES'
    },
    {
        name: 'emails.reply_manual_email',
        slug: 'emails_reply_manual_email',
        menuName: 'Emails',
        menuSlug: 'emails',
        description: 'Emails reply manual email permission',
        apiSlug: 'REPLY_EMAIL'
    },


    //* USERS PERMISSIONS */

    {
        name: 'users.view',
        slug: 'users_view',
        menuName: 'Users',
        menuSlug: 'users',
        description: 'Users view permission',
        apiSlug: 'LIST_USERS'
    },
    {
        name: 'users.create',
        slug: 'users_create',
        menuName: 'Users',
        menuSlug: 'users',
        description: 'Create user permission',
        apiSlug: 'CREATE_USER'
    },
    {
        name: 'users.update',
        slug: 'users_update',
        menuName: 'Users',
        menuSlug: 'users',
        description: 'Update user permission',
        apiSlug: 'UPDATE_USER'
    },


    //* ROLES PERMISSIONS */

    {
        name: 'roles.view',
        slug: 'roles_view',
        menuName: 'Roles',
        menuSlug: 'roles',
        description: 'Roles view permission',
        apiSlug: 'LIST_ROLES'
    },
    {
        name: 'roles.edit_permissions',
        slug: 'roles_edit_permissions',
        menuName: 'Roles',
        menuSlug: 'roles',
        description: 'Update role permission',
        apiSlug: 'GET_PERMISSIONS'
    },
    {
        name: 'roles.save_permissions',
        slug: 'roles_save_permissions',
        menuName: 'Roles',
        menuSlug: 'roles',
        description: 'Save role permission',
        apiSlug: 'ASSIGN_PERMISSIONS'
    }

];