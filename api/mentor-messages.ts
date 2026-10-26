import { getMentorMessagesByMentorId, getMentorByEmail } from '../src/services/workflowService';
import { updateMentorMessageReadStatus } from '../src/services/workflowService';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get mentor email from query or header
    const mentorEmail = req.query.mentorEmail || req.headers['x-mentor-email'];
    
    if (!mentorEmail) {
      return res.status(401).json({ error: 'Mentor email required' });
    }

    // Look up mentor by email
    const mentor = await getMentorByEmail(mentorEmail);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    if (req.method === 'GET') {
      // Fetch messages for this mentor
      const messages = await getMentorMessagesByMentorId(mentor.id);
      return res.status(200).json({ messages });
    }

    if (req.method === 'PATCH') {
      // Mark message as read
      const { messageId, status } = req.body;
      if (!messageId || !status) {
        return res.status(400).json({ error: 'Missing messageId or status' });
      }
      await updateMentorMessageReadStatus(messageId, status);
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error('mentor-messages API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}