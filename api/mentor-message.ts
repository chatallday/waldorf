import { createMentorMessage } from '../src/services/workflowService';
import { getMentorById } from '../src/services/workflowService';
import { sendEmail } from './emailService';
import { fetchTeableRecords } from '../src/services/teableService';

const TEABLE_TABLE_ID_SEEKERS = "tblgprvMCO9opqRjOFf";
const TEABLE_TABLE_ID_MENTOR_MESSAGES = "tblMentorMessages";

function isProUser(seekerEmail) {
  // In a real implementation, you'd check the Seekers table for active subscription
  // For now, we'll check if the user has a pro flag in the request
  return false; // Default to free tier
}

async function getMonthlyMessageCount(seekerEmail) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    
    const records = await fetchTeableRecords(TEABLE_TABLE_ID_MENTOR_MESSAGES);
    return records.filter(rec => {
      const fields = rec.fields || {};
      const email = fields.Seeker_Email || '';
      const createdAt = fields.Created_At || '';
      return email.toLowerCase() === seekerEmail.toLowerCase() &&
             createdAt >= startOfMonth &&
             createdAt <= endOfMonth;
    }).length;
  } catch (error) {
    console.error('Error fetching monthly message count:', error);
    return 0;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mentorId, seekerEmail, seekerName, subject, message, isPro } = req.body;

    if (!mentorId || !seekerEmail || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check tier-based messaging limits
    const isProUserFlag = isPro === true;
    if (!isProUserFlag) {
      const monthlyCount = await getMonthlyMessageCount(seekerEmail);
      if (monthlyCount >= 3) {
        return res.status(403).json({ 
          error: 'MONTHLY_LIMIT_REACHED',
          message: 'Free tier limited to 3 messages per month. Upgrade to Seeker Pro for unlimited messaging!',
          upgradeUrl: '/api/stripe-create-link'
        });
      }
    }

    // Get mentor details for notification
    const mentor = await getMentorById(mentorId);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Create the message in Teable
    const result = await createMentorMessage({
      mentorId,
      mentorName: mentor.name,
      seekerEmail,
      seekerName: seekerName || '',
      subject,
      message,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error || 'Failed to create message' });
    }

    // Send email notification to mentor
    try {
      await sendEmail({
        to: mentor.email,
        subject: `New Inquiry: ${subject}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7a8c6e;">New Inquiry from The Waldorf Path</h2>
            <p>You have received a new message from <strong>${seekerName || 'a seeker'}</strong> (${seekerEmail}).</p>
            <div style="background: #f7f5f1; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="margin-top: 0;">${subject}</h3>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p><a href="https://waldorf.maistermind.com/profile" style="background: #7a8c6e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View & Reply in Dashboard</a></p>
            <hr style="border: none; border-top: 1px solid #d8d0c4; margin: 24px 0;">
            <p style="font-size: 12px; color: #4a4a4a;">This message was sent through The Waldorf Path mentor directory.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send mentor notification email:', emailError);
      // Don't fail the request if email fails
    }

    return res.status(201).json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('mentor-message API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}