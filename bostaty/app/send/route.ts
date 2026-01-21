import { invitationEmailSchema } from '@/components/EmailTemplates/EmailTemplateInvitation';
import { sendInvitationEmail } from '@/lib/email-handler/invitation-service';
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validated = invitationEmailSchema.safeParse(body);
        if (!validated.success) {
            return Response.json({
                error: 'Invalid request data',
                details: validated.error.issues
            }, { status: 400 });
        }

        const data = await sendInvitationEmail(validated.data);
        return Response.json(data);
    } catch (error: any) {
        return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}