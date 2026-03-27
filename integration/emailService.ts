import nodemailer, { Transporter } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';
import { HttpStatusCode } from 'axios';
import { IEmailTemplates, optimizedEmailTemplatesResponseFields } from '../modules/emailTemplates/emailTemplatesInterface';
import { Application } from '../app';
import { Logger } from '../utils/helpers/logger';
import { CustomError } from '../core/errors/custom';
import { NodemailerSMTP } from '../core/interfaces/appConfig';
import { IEmailAttachment } from '../core/interfaces/generalInterface';
import EmailTemplatesRepository from '../modules/emailTemplates/emailTemplatesRepository';

class EmailService {

    private static instance: EmailService;
    private transporter: Transporter;

    private constructor() { }

    public async init(config: NodemailerSMTP) {
        const emailConfig = config;
        this.transporter = nodemailer.createTransport(emailConfig);
        await this.verify();
    }


    async verify() {
        this.transporter.verify((error, success) => {
            if (error) {
                console.error(error.message);
            } else {
                Logger.Console(`SMTP Server Connected Successfully!`, 'info');
            }
        });
    }

    public static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    public async sendMail(recepient: string, templateSlug: string, placeholders: Record<string, any>, subject: string, attachments: IEmailAttachment[]): Promise<void> {
        try {
            const emailTemplate: IEmailTemplates = await EmailTemplatesRepository.getInstance().GetOneByParam({ param: 'slug', value: templateSlug }, optimizedEmailTemplatesResponseFields);

            if (!emailTemplate) throw new CustomError(HttpStatusCode.NotFound, 'No email template defined for this operation');

            const data = this.prepareEmailContent(recepient, emailTemplate, placeholders, subject);

            const mailOptions: MailOptions = {
                from: Application.conf.SERVICES.email.nodeMailer.auth.user,
                ...data,
                attachments
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`Email sent to ${recepient}`);
        } catch (error) {
            console.error(`Error sending email: ${error}`);
            throw new Error('Error sending email');
        }
    }

    private prepareEmailContent(
        recepient: string,
        template: IEmailTemplates,
        placeholders: Record<string, any>,
        subject: string = null
    ) {
        let content: string | null = null;

        if (Object.keys(placeholders).length > 0) {
            if (template.html) {
                content = this.replacePlaceholders(template.html, placeholders);
            } else if (template.text) {
                content = this.replacePlaceholders(template.text, placeholders);
            }
        } else {
            content = template.html || template.text || null;
        }

        return {
            to: recepient,
            subject: subject || template.subject,
            ...(template.html ? { html: content } : { text: content }),
        };
    }


    private replacePlaceholders(content: string, placeholders: Record<string, any>) {
        Object.keys(placeholders).forEach((key) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, placeholders[key]);
        });
        return content;
    }

}

export default EmailService;