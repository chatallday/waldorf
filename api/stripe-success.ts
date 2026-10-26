import Stripe from 'stripe';
import { updateAccountBillingStatus, getAccountByEmail, updateMentorProfile, getMentorByEmail } from '../src/services/workflowService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve the session from Stripe to verify and get metadata
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const metadata = session.metadata || {};
    const email = metadata.email;
    const planType = metadata.planType;

    if (!email || !planType) {
      return res.status(400).json({ error: 'Missing metadata in session' });
    }

    // Update the appropriate record based on plan type
    if (planType === 'user-premium') {
      // Update account billing status to Active
      await updateAccountBillingStatus(email, 'Active');
    } else if (planType === 'mentor-pro') {
      // Update mentor's Membership_Tier to Enhanced and set Stripe_ID to active
      const mentor = await getMentorByEmail(email);
      if (mentor) {
        await updateMentorProfile(mentor.id, {
          specialties: mentor.specialties,
          bio: mentor.bio,
          gradeLevel: mentor.gradeLevel,
          directoryVisibility: mentor.directoryVisibility,
          lessons: mentor.lessons,
          title: mentor.title,
          awards: mentor.awards,
          photoUrl: mentor.photoUrl,
          // We need to update Membership_Tier and Stripe_ID
          // However, updateMentorProfile does not currently accept these fields.
          // Let's check the updateMentorProfile function in workflowService.
          // It accepts: specialties, bio, gradeLevel, directoryVisibility, lessons?, title?, awards?, photoUrl?
          // It does not accept Membership_Tier or Stripe_ID.
          // We need to update these fields directly via updateTeableRecord.
          // We'll do that after this.
        });
        // Now update the Membership_Tier and Stripe_ID directly
        const { updateTeableRecord } = await import('../src/services/teableService');
        const TEABLE_TABLE_ID_MENTORS = "tbl6KvPXOhrVpXupA93";
        await updateTeableRecord(TEABLE_TABLE_ID_MENTORS, mentor.id, {
          'Membership_Tier': 'Enhanced',
          'Stripe_ID': 'active'
        });
      }
    } else {
      return res.status(400).json({ error: 'Unknown plan type' });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Stripe success error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
}