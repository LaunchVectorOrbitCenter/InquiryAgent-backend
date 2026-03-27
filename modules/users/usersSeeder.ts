import StatusTypes from "../../core/enums/statusTypes"
import UserRoles from "../../core/enums/userRoles"
import { Utils } from "../../utils/utils"
import { IUsers } from "./usersInterface"




export const UsersSeed: Partial<IUsers>[] = [
    {
        email: 'admin@fleekbiz.com',
        username: 'Platform Admin',
        role: UserRoles.PLATFORM_ADMIN,
        password: '$2a$12$x0ZPt7aphSeoRhj4rGB3PO7mfJWQ3CPMehMGglBkmmmkTEsZdNNZS',
        isActive: true,
        accountStatus: StatusTypes.ACTIVE,
        createdAt: Utils.getCurrentDate(),
        createdBy: 'System',
        updatedAt: null,
        updatedBy: null,
        deletedAt: null
    },
    {
        email: 'zac@launchvector.com',
        username: 'Zac Richman',
        role: UserRoles.MANUFACTURER,
        password: '$2a$12$x0ZPt7aphSeoRhj4rGB3PO7mfJWQ3CPMehMGglBkmmmkTEsZdNNZS',
        isActive: true,
        profilePicImage: null,
        accountStatus: StatusTypes.ACTIVE,
        tenantId: Utils.UUIDGenerator(),
        createdAt: Utils.getCurrentDate(),
        createdBy: 'System',
        updatedAt: null,
        updatedBy: null,
        deletedAt: null
    }

]