import { Resend } from 'resend';
import { EmailTemplate, InvitationEmailProps } from '@/components/EmailTemplates/EmailTemplateInvitation';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail(props: InvitationEmailProps) {
    const { data, error } = await resend.emails.send({
        from: 'Bostaty <onboarding@resend.dev>', // Update with your verified domain in production
        to: [props.recipientEmail],
        subject: `You've been invited to join ${props.tenantName} on Bostaty`,
        react: EmailTemplate(props),
    });

    if (error) {
        throw new Error(error.message || 'Failed to send invitation email');
    }

    return data;
}
