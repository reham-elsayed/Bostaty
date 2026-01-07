import * as React from 'react';
import { z } from 'zod';

export const invitationEmailSchema = z.object({
    recipientEmail: z.string().email(),
    inviterName: z.string().min(1),
    tenantName: z.string().min(1),
    inviteLink: z.string().url(),
});

export type InvitationEmailProps = z.infer<typeof invitationEmailSchema>;

export function EmailTemplate({
    inviterName,
    tenantName,
    inviteLink,
}: InvitationEmailProps) {
    return (
        <div style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: '#f9fafb',
            padding: '40px 20px',
            color: '#111827'
        }}>
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '40px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb'
            }}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    marginBottom: '24px',
                    color: '#111827'
                }}>
                    You've been invited to join {tenantName}
                </h1>
                <p style={{
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#4b5563',
                    marginBottom: '32px'
                }}>
                    Hi there,
                </p>
                <p style={{
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#4b5563',
                    marginBottom: '32px'
                }}>
                    <strong>{inviterName}</strong> has invited you to collaborate on <strong>{tenantName}</strong>.
                    Click the button below to accept the invitation and get started.
                </p>
                <a href={inviteLink} style={{
                    display: 'inline-block',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '16px',
                    textAlign: 'center',
                    marginBottom: '32px'
                }}>
                    Accept Invitation
                </a>
                <hr style={{
                    border: '0',
                    borderTop: '1px solid #e5e7eb',
                    marginBottom: '32px'
                }} />
                <p style={{
                    fontSize: '14px',
                    color: '#9ca3af',
                    lineHeight: '20px'
                }}>
                    If you were not expecting this invitation, you can safely ignore this email.
                </p>
                <p style={{
                    fontSize: '14px',
                    color: '#9ca3af',
                    marginTop: '16px'
                }}>
                    &copy; {new Date().getFullYear()} Bostaty. All rights reserved.
                </p>
            </div>
        </div>
    );
}