export interface IEmailTemplates {
    _id: string,
    templateName: string,
    templateType: string,
    slug: string,
    subject: string,
    text: string,
    html: string,
    createdAt: string,
    updatedAt: string,
    createdBy: string,
    updatedBy: string,
    deletedAt: string
}


export const optimizedEmailTemplatesResponseFields = [
    '_id',
    'templateName',
    'slug',
    'templateType',
    'subject',
    'html',
    'text',
    'createdAt'
];