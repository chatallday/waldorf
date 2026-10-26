import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

const TEABLE_API_KEY = process.env.TEABLE_API_KEY || "teable_accv7ta35BisOwLmbLa_l/dfUp2sm+wLeH4Ozl+lgTjF0cP/jUrQH9fMwIl9MoQ=";
const TEABLE_TABLE_ID_MENTORS = "tbl6KvPXOhrVpXupA93";

async function runExport() {
  console.log("🌿 Initiating Mentor Invitation Export worker...");
  
  try {
    const url = `https://app.teable.io/api/table/${TEABLE_TABLE_ID_MENTORS}/record`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TEABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch records: ${response.statusText}`);
    }

    const data = await response.json();
    const records = data.records || [];

    console.log(`🔍 Found ${records.length} total mentors on Teable.`);

    const unclaimed = records.filter((rec: any) => rec.fields && rec.fields.Claim_Status === 'Unclaimed');
    console.log(`🎯 Filtering: ${unclaimed.length} mentors are currently Unclaimed.`);

    let csvContent = "Name,Email,Record_ID,LoginTokenLink,InvitationEmail\n";

    for (const rec of unclaimed) {
      const id = rec.id;
      const name = rec.fields.Name || "Waldorf Practitioner";
      const rawEmail = rec.fields.Claimant_Email || "";
      const email = rawEmail.includes('@') ? rawEmail : "info@thewaldorfpath.com";
      const specialties = rec.fields.Specialty || "Alternative Education";
      
      const loginLink = `https://github-files-opal.vercel.app/profile?loginToken=${id}&role=mentor`;
      
      const emailBody = `Subject: 🌿 We pre-populated your profile on The Waldorf Path directory!

Dear ${name},

I am reaching out to share that we have officially launched The Waldorf Path, an intelligent, property-aware global matching directory and resource hub connecting parents directly with Steiner-trained educators.

To ensure families can discover trusted practitioners from day one, our curation team has pre-populated an initial listing for you highlighting your expertise in ${specialties}.

Your profile card is currently live but completely locked to editing. To claim ownership, upload your custom profile photo, update your specialties, list your direct social links, or toggle your availability, please use your unique dashboard token link below:

👉 ${loginLink}

Warmly,
Nina & The Waldorf Path Team`;

      // Escape fields for CSV formatting
      const escapedName = `"${name.replace(/"/g, '""')}"`;
      const escapedEmail = `"${email.replace(/"/g, '""')}"`;
      const escapedId = `"${id.replace(/"/g, '""')}"`;
      const escapedLink = `"${loginLink.replace(/"/g, '""')}"`;
      const escapedBody = `"${emailBody.replace(/"/g, '""')}"`;

      csvContent += `${escapedName},${escapedEmail},${escapedId},${escapedLink},${escapedBody}\n`;
    }

    const outputFilePath = path.join(process.cwd(), 'scripts', 'invitations.csv');
    fs.writeFileSync(outputFilePath, csvContent, 'utf-8');
    console.log(`✅ Success! Generated invitation list at: ${outputFilePath}`);
    console.log(`📄 Exported ${unclaimed.length} invitations ready for email dispatch.`);

  } catch (err) {
    console.error("❌ Export failed:", err);
  }
}

runExport();
