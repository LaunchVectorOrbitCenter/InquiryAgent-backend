import EmailTemplateTypes from "../../core/enums/emailTemplateTypes";
import { IEmailTemplates } from "../../modules/emailTemplates/emailTemplatesInterface";
import { Utils } from "../../utils/utils";



export const EmailTemplatesSeed: Partial<IEmailTemplates>[] = [
    {
        templateName: 'Store Disconnected',
        templateType: EmailTemplateTypes.STORE_DISCONNECTED,
        slug: EmailTemplateTypes.STORE_DISCONNECTED,
        subject: 'Store Disconnected',
        html: `<strong>Dear Admin</strong><p>Your store <strong>{{storeName}}</strong> has been disconnected. Please connect your store again.</p><br><strong>Disconnectivity Reason: </strong>{{disconnectivityReason}}<br><br><strong>Regards,<br>Inquiry Agent</strong>`,
        createdAt: Utils.getCurrentDate(),
        createdBy: 'System',
        updatedAt: null,
        updatedBy: null,
        deletedAt: null
    },
    {
        templateName: 'New Account Creation',
        templateType: EmailTemplateTypes.ACCOUNT_CREATED,
        slug: EmailTemplateTypes.ACCOUNT_CREATED,
        subject: 'Account Created',
        html: `<strong>Dear {{username}}</strong><p>Welcome to <strong>Inquiry Agent</strong>! Your account has been created.</p></p>Your account credentials are:<br><br><strong>Email: </strong>{{email}}<br><strong>Password: </strong>{{password}}<br><p>To log-in to your account visit <a href='https://inquiryagent.ai/login' target='_blank'>Inquiry Agent</a></p><br><strong>Regards,<br>Inquiry Agent</strong>`,
        createdAt: Utils.getCurrentDate(),
        createdBy: 'System',
        updatedAt: null,
        updatedBy: null,
        deletedAt: null
    },
    {
        templateName: 'Forgot Password',
        templateType: EmailTemplateTypes.FORGOT_PASSWORD,
        slug: EmailTemplateTypes.FORGOT_PASSWORD,
        subject: 'Password Reset Request',
        html: `<p>You requested a password reset. Click the button below to reset your password:</p><a href="{{passwordResetLink}}" target="_blank" style="display: inline-block; background: linear-gradient(to right, #0FD2CB, #088A8A); border: none; padding: 14px 25px; color: black; text-align: center; text-decoration: none; cursor: pointer; font-weight: bold; border-radius: 5px;">Reset Password</a>`,
        createdAt: Utils.getCurrentDate(),
        createdBy: 'System',
        updatedAt: null,
        updatedBy: null,
        deletedAt: null
    },
    {
        templateName: 'Email Acknowledgment',
        templateType: EmailTemplateTypes.EMAIL_ACKNOWLEDGMENT,
        slug: EmailTemplateTypes.EMAIL_ACKNOWLEDGMENT,
        subject: 'We Have Received Your Inquiry',
        html: `
            <p>Dear {{customerName}},</p>

            <p>Thank you for contacting <strong>{{storeName}}</strong>. We have successfully received your email and our team is currently reviewing your request.</p>

            <p><strong>Email ID:</strong> {{emailId}}</p>

            <p>If you have any additional information to share, please feel free to reply to this email or contact our support team at <strong>{{supportTeamEmail}}</strong>.</p>

            <br>

            <p>Regards,<br>
            Inquiry Agent<br>
            {{storeName}}</p>
        `,
        createdAt: Utils.getCurrentDate(),
        createdBy: 'System',
        updatedAt: null,
        updatedBy: null,
        deletedAt: null
    }
];