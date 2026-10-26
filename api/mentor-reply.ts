import { replyToMentorMessage, getMentorByEmail, getMentorMessageById } from '../src/services/workflowService';
import { sendEmail } from './emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const mentorEmail = req.headers['x-mentor-email'];
    
    if (!mentorEmail) {
      return res.status(401).json({ error: 'Mentor email required' });
    }

    const mentor = await getMentorByEmail(mentorEmail);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    const { messageId, reply } = req.body;

    if (!messageId || !reply) {
      return res.status(400).json({ error: 'Missing messageId or reply' });
    }

    // Update the message with reply in Teable
    const result = await replyToMentorMessage(messageId, reply);
    if (!result.success) {
      return res.status(500).json({ error: result.error || 'Failed to save reply' });
    }

    // Fetch original message to get seeker email for notification
    const originalMessage = await getMentorMessageById(messageId);
    if (originalMessage && originalMessage.seekerEmail) {
      try {
        await sendEmail({
          to: originalMessage.seekerEmail,
          subject: `Reply from ${mentor.name}: ${originalMessage.subject}`,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7a8c6e;">Reply from ${mentor.name}</h2>
              <p>You have received a reply to your inquiry: <strong>${originalMessage.subject}</strong></p>
              <div style="background: #f7f5f1; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="white-space: pre-wrap; margin: 0;">${reply}</p>
              </div>
              <p><a href="https://waldorf.maistermind.com/profile" style="background: #7a8c6e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Conversation</a></p>
              <hr style="border: none; border-top: 1px solid #d8d0c4; margin: 24px 0;">
              <p style="font-size: 12px; color: #4a4a4a;">This is a reply to your message sent through The Waldorf Path mentor directory.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send seeker notification email:', emailError);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('mentor-reply API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}