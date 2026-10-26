// api/waitlist.ts - Vercel Serverless Function for Waitlist Submissions
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { teableClient } from '../../lib/server/teable/client';

const resend = new Resend(process.env.RESEND_API_KEY);

// Teable waitlist table ID from environment
const WAITLIST_TABLE_ID = process.env.TEABLE_WAITLIST_TABLE_ID;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, source = 'website_header' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists in Teable Waitlist
    // We need to use the Teable API directly since we don't have a waitlist table in the client
    const teableApiKey = process.env.TEABLE_API_KEY;
    const teableBaseId = process.env.TEABLE_BASE_ID || 'bseeZUvNX8unS2KrzOE';
    const teableApiBase = process.env.TEABLE_API_BASE || 'https://app.teable.ai/api';
    const waitlistTableId = process.env.TEABLE_WAITLIST_TABLE_ID;

    if (!waitlistTableId) {
      console.error('TEABLE_WAITLIST_TABLE_ID not configured');
      return res.status(500).json({ error: 'Server configuration error: waitlist table not configured' });
    }

    // 1. Check if email already exists in Teable Waitlist
    const checkUrl = new URL(`https://app.teable.ai/api/bases/bseeZUvNX8unS2KrzOE/tables/${process.env.TEABLE_WAITLIST_TABLE_ID}/records`);
    checkUrl.searchParams.set('filter', `Email==${encodeURIComponent(normalizedEmail)}`);
    checkUrl.searchParams.set('pageSize', '1');

    const checkResponse = await fetch(checkUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${process.env.TEABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!checkResponse.ok) {
      console.error('Teable check failed:', await checkResponse.text());
      return res.status(500).json({ error: 'Failed to check waitlist' });
    }

    const checkData = await checkResponse.json();
    if (checkData.records && checkData.records.length > 0) {
      return res.status(200).json({ message: 'You are already on the waitlist!' });
    }

    // 2. Insert new record into Teable Waitlist table
    const insertResponse = await fetch(
      `https://app.teable.ai/api/bases/bseeZUvNX8unS2KrzOE/tables/${process.env.TEABLE_WAITLIST_TABLE_ID}/records`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TEABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                Name: name || 'Valued Visitor',
                Email: normalizedEmail,
                Status: 'Pending',
                Source: source,
                SubmittedAt: new Date().toISOString(),
              },
            },
          ],
        }),
      });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Teable insert failed:', errorText);
      throw new Error('Failed to save record to Teable.');
    }

    // 3. Send Auto-Response Acknowledgment Email to Visitor
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      try {
        await resend.emails.send({
          from: 'The Waldorf Path <thewaldorfpath@gmail.com>',
          to: normalizedEmail,
          subject: 'Welcome to The Waldorf Path Waitlist 🌿',
          html: `
            <div style="font-family: Georgia, serif; color: #3b2a1a; padding: 24px; background: #f5ede0; max-width: 600px; margin: 0 auto; border-radius: 8px;">
              <h2 style="color: #a8492a; font-weight: normal; font-size: 28px; margin-bottom: 16px;">You're on the path.</h2>
              <p style="font-size: 18px; line-height: 1.6; margin-bottom: 16px;">Dear ${name || 'Friend'},</p>
              <p style="font-size: 17px; line-height: 1.6; margin-bottom: 16px;">Thank you for joining the waitlist for <strong>The Waldorf Path</strong>. We have successfully received your registration.</p>
              <p style="font-size: 17px; line-height: 1.6; margin-bottom: 24px;">We are carefully preparing our curated directories, guides, and resources. As soon as your tier opens, we will send your invitation directly to this inbox.</p>
              <hr style="border: none; border-top: 1px dotted #e8d8bd; margin: 24px 0;" />
              <p style="font-size: 14px; color: #6b5840; font-style: italic;">Warm regards,<br/><strong>The Waldorf Path Team</strong><br/><em>Playa del Carmen, Mexico</em></p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the request if email fails - the waitlist entry was created
      }
    }

    return res.status(200).json({ success: true, message: 'Successfully added to waitlist and auto-response sent.' });
  } catch (error) {
    console.error('Waitlist handler error:', error);
    return res.status(500).json({ error: 'Internal server error processing waitlist submission.' });
  }
}