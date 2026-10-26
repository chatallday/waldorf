import { updateTeableRecord, fetchTeableRecord, createTeableRecord, fetchTeableRecords, fetchAllTeableRecords, fetchRhythms } from './teableService';
import type { TeableRecord } from './teableService';
import { MENTORS, Mentor } from '../data/mentors';

const TEABLE_TABLE_ID_MENTORS = "tbl6KvPXOhrVpXupA93";
const TEABLE_TABLE_ID_RESOURCES = "tblztNjIsTKuI8mxuPl";
const TEABLE_TABLE_ID_RHYTHMS = "tblyhpS9TM2TMKOGU8B";
const TEABLE_TABLE_ID_ADMIN_ALERTS = "tblbxAGreFEyE7Pi9PE";
const TEABLE_TABLE_ID_ACCOUNTS = "tblgprvMCO9opqRjOFf";
const TEABLE_TABLE_ID_ENQUIRIES = "tblEnquiries";
const TEABLE_TABLE_ID_SPONSOR_OFFERS = "tblSponsorOffers";
const TEABLE_TABLE_ID_BILLING_RECORDS = "tblBillingRecords";
const TEABLE_TABLE_ID_MENTOR_MESSAGES = "tblMentorMessages";

function parseTagList(raw: unknown): string[] {
  if (!raw) return [];
  if (typeof raw === 'string') return raw.split(',').map((s: string) => s.trim()).filter(Boolean);
  if (Array.isArray(raw)) return raw.map((s: unknown) => String(s).trim()).filter(Boolean);
  return [];
}

export async function findTeableRecordByName(tableId: string, name: string): Promise<TeableRecord | null> {
  try {
    const records = await fetchAllTeableRecords(tableId);
    const needle = (name || '').trim().toLowerCase();
    const match = records.find(r => r.fields && r.fields.Name && r.fields.Name.toLowerCase() === needle);
    return match || null;
  } catch (error) {
    console.warn("findTeableRecordByName failed:", error);
    return null;
  }
}

export async function getMentors(): Promise<Mentor[]> {
  try {
    const records = await fetchAllTeableRecords(TEABLE_TABLE_ID_MENTORS);
    const teableMentorsByName: Record<string, any> = {};
    records.forEach(rec => {
      if (rec.fields && rec.fields.Name) {
        teableMentorsByName[rec.fields.Name] = rec;
      }
    });

    let featuredOverrides: Record<string, any> = {};
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('MENTOR_FEATURED_SETTINGS');
      if (raw) {
        try { featuredOverrides = JSON.parse(raw); } catch (e) {}
      }
    }

    // Build a set of all names already in MENTORS + directoryMentors
    const { getDirectoryMentors } = await import('../data/directoryMentors');
    const directoryEntries = await getDirectoryMentors();
    const knownNames = new Set([
      ...MENTORS.map(m => m.name.toLowerCase()),
      ...directoryEntries.map(dm => dm.name.toLowerCase())
    ]);

    // Start with MENTORS, merged with Teable overrides where name matches
    const merged = MENTORS.map(m => {
      const teableRecord = teableMentorsByName[m.name];
      const override = teableRecord ? (featuredOverrides[teableRecord.id] || {}) : (featuredOverrides[m.id] || {});

      let base = m;
      if (teableRecord) {
        base = {
          ...m,
          id: teableRecord.id,
          status: teableRecord.fields.Claim_Status || m.status,
          directoryVisibility: teableRecord.fields.Profile_Visibility ?? m.directoryVisibility,
          subscriptionActive: ['Enhanced', 'pro'].includes(teableRecord.fields.Membership_Tier) || teableRecord.fields.Stripe_ID === 'active' ? true : false,
          lessons: teableRecord.fields.Lessons || m.lessons || '',
          bio: teableRecord.fields.Bio || m.bio,
          gradeLevel: teableRecord.fields.Grade_Level || m.gradeLevel,
          specialties: parseTagList(teableRecord.fields.Specialty ?? m.specialties),
          title: teableRecord.fields.Title || m.title,
          awards: teableRecord.fields.Awards || m.awards,
          directoryEligible: teableRecord.fields.Directory_Eligible ?? true,
          profileType: teableRecord.fields.Profile_Type || 'individual',
          supportModes: teableRecord.fields.Support_Modes || '',
          languages: teableRecord.fields.Languages || 'English',
          topicTags: parseTagList(teableRecord.fields.Topic_Tags ?? m.specialties),
          multilingualAliases: teableRecord.fields.Multilingual_Aliases || '',
          socialLinks: teableRecord.fields.Social_Links || '',
          credentialSummary: teableRecord.fields.Credential_Summary || '',
          exportConsent: !!teableRecord.fields.Export_Consent,
        };
      }
      return {
        ...base,
        featuredActive: override.featuredActive ?? base.featuredActive,
        promoTitle: override.promoTitle ?? base.promoTitle,
        promoDescription: override.promoDescription ?? base.promoDescription,
        promoLink: override.promoLink ?? base.promoLink,
        promoImage: override.promoImage ?? base.promoImage,
        profileTheme: override.profileTheme || 'Classic',
      };
    });

    // Add directory entries not already in MENTORS
    const existingNames = new Set(merged.map(m => m.name.toLowerCase()));
    const newEntries = directoryEntries.filter(dm => !existingNames.has(dm.name.toLowerCase()));
    const withDirectory = [...merged, ...newEntries.map(dm => ({
      id: dm.id, name: dm.name, email: dm.email, bio: dm.bio,
      specialties: dm.specialties, location: dm.location, status: dm.status,
      directoryVisibility: dm.directoryVisibility, subscriptionActive: dm.subscriptionActive,
      gradeLevel: dm.gradeLevel, photoUrl: dm.photoUrl, lessons: dm.lessons,
    }))] as Mentor[];

    // Add Teable-only mentors (not in MENTORS or directoryMentors)
    const teableOnly = records
      .filter(rec => rec.fields && rec.fields.Name && !knownNames.has(rec.fields.Name.toLowerCase()))
      .map(rec => {
        const f = rec.fields || {};
        return {
          id: rec.id,
          name: f.Name || '',
          email: f.Claimant_Email || f.Gated_Contact_Email || '',
          bio: f.Bio || '',
specialties: parseTagList(f.Specialty),
          location: f.Location || '',
          status: f.Claim_Status || 'Unclaimed',
          directoryVisibility: f.Profile_Visibility ?? true,
          subscriptionActive: ['Enhanced', 'pro'].includes(f.Membership_Tier) || f.Stripe_ID === 'active',
          gradeLevel: f.Grade_Level || '',
          photoUrl: f.Photo_URL || `https://i.pravatar.cc/150?u=${encodeURIComponent(f.Name || 'mentor')}`,
          lessons: f.Lessons || '',
          title: f.Title || '',
          awards: f.Awards || '',
          directoryEligible: f.Directory_Eligible ?? true,
          profileType: f.Profile_Type || 'individual',
          supportModes: f.Support_Modes || '',
          languages: f.Languages || 'English',
topicTags: parseTagList(f.Topic_Tags),
          multilingualAliases: f.Multilingual_Aliases || '',
          socialLinks: f.Social_Links || '',
          credentialSummary: f.Credential_Summary || '',
          exportConsent: !!f.Export_Consent,
        } as Mentor;
      });

    return [...withDirectory, ...teableOnly];
  } catch (error) {
    console.warn("Failed to fetch mentors from Teable, falling back to local static data:", error);
    return MENTORS;
  }
}

export async function initiateClaimProfile(mentorId: string, mentorName: string, email: string) {
  try {
    let finalRecordId = mentorId;
    if (!mentorId.startsWith('rec')) {
      // Match by name first so imported directory records are claimed in place
      // instead of creating duplicates.
      const existing = await findTeableRecordByName(TEABLE_TABLE_ID_MENTORS, mentorName);
      if (existing) {
        finalRecordId = existing.id;
      } else {
        const localMentor = MENTORS.find(m => m.id === mentorId || m.name.toLowerCase() === mentorName.toLowerCase());
        if (!localMentor) throw new Error(`Mentor not found with ID: ${mentorId}`);
        const newRecord = await createTeableRecord(TEABLE_TABLE_ID_MENTORS, {
          'Name': localMentor.name,
          'Specialty': localMentor.specialties.join(', '),
          'Grade_Level': localMentor.gradeLevel,
          'Bio': localMentor.bio,
          'Photo_URL': localMentor.photoUrl,
          'Claim_Status': 'Pending',
          'Membership_Tier': localMentor.subscriptionActive ? 'Enhanced' : 'Directory',
          'Claimant_Email': email,
          'Profile_Visibility': localMentor.directoryVisibility
        });
        finalRecordId = newRecord.id;
      }
    }
    await updateTeableRecord(TEABLE_TABLE_ID_MENTORS, finalRecordId, {
      'Claim_Status': 'Pending',
      'Claimant_Email': email
    });
    await createTeableRecord(TEABLE_TABLE_ID_ADMIN_ALERTS, {
      'Alert_Type': 'New Mentor Claimed',
      'Description': `Profile claim initiated for mentor ${mentorName} (ID: ${finalRecordId}) by ${email}`,
      'Timestamp': new Date().toISOString(),
      'Status': 'Open'
    });
    return { success: true, message: "Claim submitted for manual approval." };
  } catch (error) {
    console.error("Claim Error:", error);
    throw error;
  }
}

export async function syncMentorTier(mentorId: string, tier: 'basic' | 'pro') {
  try {
    await updateTeableRecord(TEABLE_TABLE_ID_MENTORS, mentorId, {
      'Membership_Tier': tier === 'pro' ? 'Enhanced' : 'Directory'
    });
  } catch (error) {
    console.error("Tier sync Error:", error);
    throw error;
  }
}

export async function getVerseOfTheDay(season: string = 'Spring') {
  try {
    const rhythms = await fetchRhythms(TEABLE_TABLE_ID_RHYTHMS, season);
    if (rhythms && rhythms.length > 0) {
      const rhythm = rhythms[0];
      return {
        title: rhythm.fields.Verse_Text ? rhythm.fields.Verse_Text.split('\n')[0] || rhythm.fields.Season : rhythm.fields.Season,
        content: rhythm.fields.Verse_Text || '',
        season: rhythm.fields.Season || season
      };
    }
  } catch (error) {
    console.warn("Verse fetch error (falling back):", error);
  }
  return {
    title: "The Morning Sun",
    content: "The morning sun is shining bright,\nIt fills the world with golden light.\nWith head and heart and busy hands,\nWe work and play throughout the lands.",
    season: season
  };
}

export function findNextQualifiedMentor(targetMentor: Mentor, allMentors: Mentor[]): Mentor | null {
  const claimedMentors = allMentors.filter(m => m.status === 'Verified' && m.id !== targetMentor.id);
  if (claimedMentors.length === 0) return null;
  let bestMentor: Mentor | null = null;
  let bestScore = -1;
  claimedMentors.forEach(candidate => {
    let score = 0;
    candidate.specialties.forEach(spec => {
      if (targetMentor.specialties.some(s => s.toLowerCase().trim() === spec.toLowerCase().trim())) score += 10;
    });
    if (candidate.gradeLevel && targetMentor.gradeLevel &&
        candidate.gradeLevel.toLowerCase().trim() === targetMentor.gradeLevel.toLowerCase().trim()) score += 5;
    if (candidate.location && targetMentor.location &&
        candidate.location.toLowerCase().trim() === targetMentor.location.toLowerCase().trim()) score += 3;
    if (score > bestScore) { bestScore = score; bestMentor = candidate; }
  });
  return bestMentor || claimedMentors[0];
}

export async function sendMentorInquiry(mentorId: string, mentorName: string, senderName: string, senderEmail: string, message: string, isPro: boolean = false) {
  try {
    // Call the new API endpoint for creating mentor messages
    const response = await fetch('/api/mentor-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mentorId,
        mentorName,
        senderName,
        senderEmail,
        subject: `Inquiry from ${senderName}`,
        message,
        isPro,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.error === 'MONTHLY_LIMIT_REACHED') {
        throw { type: 'MONTHLY_LIMIT_REACHED', message: error.message, upgradeUrl: error.upgradeUrl };
      }
      throw new Error(error.error || 'Failed to send message');
    }

    const result = await response.json();
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("sendMentorInquiry Error:", error);
    throw error;
  }
}

export interface WaldorfResource {
  id: string;
  title: string;
  category: string;
  grade: string;
  fileLink: string;
  isFree: boolean;
  mentorId?: string | null;
  contentType?: string;
  description?: string;
  topicTags?: string[];
  language?: string;
  country?: string;
}

export async function getResources(): Promise<WaldorfResource[]> {
  try {
    const records = await fetchAllTeableRecords(TEABLE_TABLE_ID_RESOURCES);
    const teableResources = records
      .filter(rec => rec.fields && rec.fields.Title && rec.fields.Title.trim() !== '')
      .map(rec => ({
        id: rec.id,
        title: rec.fields.Title || '',
        category: rec.fields.Category || '',
        grade: rec.fields.Grade || '',
        fileLink: rec.fields.File_Link || '#',
        isFree: rec.fields.Is_Free ?? true,
        mentorId: rec.fields.Mentor_ID || null,
        contentType: rec.fields.Content_Type || 'resource',
        description: rec.fields.Description || '',
        topicTags: parseTagList(rec.fields.Topic_Tags),
        language: rec.fields.Language || 'English',
        country: rec.fields.Country || '',
      }));
    try {
      const { getLocalResources } = await import('../data/contentRegistry');
      const local = getLocalResources();
      return [...teableResources, ...local.map(r => ({
        id: r.id, title: r.title, category: r.category, grade: r.grade,
        fileLink: r.fileLink, isFree: r.isFree, contentType: r.contentType,
        description: r.description, topicTags: r.topicTags, language: r.language,
      }))];
    } catch {
      return teableResources;
    }
  } catch (error) {
    console.warn("Failed to fetch resources from Teable:", error);; 
    try {
      const { getLocalResources } = await import('../data/contentRegistry');
      return getLocalResources().map(r => ({
        id: r.id, title: r.title, category: r.category, grade: r.grade,
        fileLink: r.fileLink, isFree: r.isFree, contentType: r.contentType,
        description: r.description, topicTags: r.topicTags, language: r.language,
      }));
    } catch {
      return [];
    }
  }
}

export async function getArticles(category?: string): Promise<WaldorfResource[]> {
  const resources = await getResources();
  const articleResources = resources.filter(r => r.contentType === 'article');
  try {
    const { getLocalArticles, getArticlesByCategory } = await import('../data/contentRegistry');
    const localArticles = category
      ? getArticlesByCategory(category).map(a => ({
          id: a.id, title: a.title, description: a.description, category: a.category,
          grade: a.grade || 'All Grades', fileLink: a.filePath, isFree: true,
          contentType: 'article' as const, topicTags: a.topicTags, language: a.language,
        }))
      : getLocalArticles();
    if (category) return localArticles;
    const existingIds = new Set(articleResources.map(r => r.id));
    return [...articleResources, ...localArticles.filter(a => !existingIds.has(a.id))];
  } catch {
    return articleResources;
  }
}

export async function getArticleById(id: string): Promise<WaldorfResource | null> {
  try {
    const { getArticleById: getLocalArticle } = await import('../data/contentRegistry');
    const article = getLocalArticle(id);
    if (!article) return null;
    return {
      id: article.id, title: article.title, category: article.category,
      grade: article.grade || 'All Grades', fileLink: article.filePath,
      isFree: true, contentType: article.contentType, description: article.description,
      topicTags: article.topicTags, language: article.language,
    };
  } catch {
    return null;
  }
}

export async function getMentorById(id: string): Promise<Mentor | null> {
  try {
    const records = await fetchTeableRecords(TEABLE_TABLE_ID_MENTORS);
    const match = records.find(rec => rec.id === id);
    if (match) {
      const localMentor = MENTORS.find(m => m.name.toLowerCase() === match.fields.Name.toLowerCase());
      let featuredOverrides: Record<string, any> = {};
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('MENTOR_FEATURED_SETTINGS');
        if (raw) { try { featuredOverrides = JSON.parse(raw); } catch (e) {} }
      }
      const override = featuredOverrides[match.id] || (localMentor ? featuredOverrides[localMentor.id] : null) || {};
      return {
        id: match.id, name: match.fields.Name,
        email: match.fields.Claimant_Email || (localMentor ? localMentor.email : ''),
        specialties: parseTagList(match.fields.Specialty),
        gradeLevel: match.fields.Grade_Level || '',
        bio: match.fields.Bio || '',
        photoUrl: match.fields.Photo_URL || (localMentor ? localMentor.photoUrl : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150'),
        location: localMentor ? localMentor.location : 'Global',
        status: match.fields.Claim_Status || 'Pending',
        directoryVisibility: match.fields.Profile_Visibility ?? true,
        subscriptionActive: ['Enhanced', 'pro'].includes(match.fields.Membership_Tier) || match.fields.Stripe_ID === 'active',
        lessons: match.fields.Lessons || (localMentor ? localMentor.lessons : ''),
        featuredActive: override.featuredActive ?? (localMentor ? localMentor.featuredActive : false),
        promoTitle: override.promoTitle ?? (localMentor ? localMentor.promoTitle : ''),
        promoDescription: override.promoDescription ?? (localMentor ? localMentor.promoDescription : ''),
        promoLink: override.promoLink ?? (localMentor ? localMentor.promoLink : ''),
        promoImage: override.promoImage ?? (localMentor ? localMentor.promoImage : ''),
        profileTheme: override.profileTheme || 'Classic',
        directoryEligible: match.fields.Directory_Eligible ?? true,
        profileType: match.fields.Profile_Type || 'individual',
        supportModes: match.fields.Support_Modes || '',
        languages: match.fields.Languages || 'English',
        topicTags: parseTagList(match.fields.Topic_Tags),
        multilingualAliases: match.fields.Multilingual_Aliases || '',
        socialLinks: match.fields.Social_Links || '',
        credentialSummary: match.fields.Credential_Summary || '',
        exportConsent: !!match.fields.Export_Consent,
      };
    }
    return null;
  } catch (error) {
    console.error("getMentorById Error:", error);
    throw error;
  }
}

export async function getMentorByEmail(email: string): Promise<Mentor | null> {
  try {
    const records = await fetchTeableRecords(TEABLE_TABLE_ID_MENTORS);
    const match = records.find(rec => rec.fields.Claimant_Email && rec.fields.Claimant_Email.toLowerCase() === email.toLowerCase());
    if (match) {
      const localMentor = MENTORS.find(m => m.name.toLowerCase() === match.fields.Name.toLowerCase());
      let featuredOverrides: Record<string, any> = {};
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('MENTOR_FEATURED_SETTINGS');
        if (raw) { try { featuredOverrides = JSON.parse(raw); } catch (e) {} }
      }
      const override = featuredOverrides[match.id] || (localMentor ? featuredOverrides[localMentor.id] : null) || {};
      return {
        id: match.id, name: match.fields.Name,
        email: match.fields.Claimant_Email || email || (localMentor ? localMentor.email : ''),
        specialties: parseTagList(match.fields.Specialty),
        gradeLevel: match.fields.Grade_Level || '', bio: match.fields.Bio || '',
        photoUrl: match.fields.Photo_URL || (localMentor ? localMentor.photoUrl : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150'),
        location: localMentor ? localMentor.location : 'Global',
        status: match.fields.Claim_Status || 'Pending',
        directoryVisibility: match.fields.Profile_Visibility ?? true,
        subscriptionActive: ['Enhanced', 'pro'].includes(match.fields.Membership_Tier),
        lessons: match.fields.Lessons || (localMentor ? localMentor.lessons : ''),
        featuredActive: override.featuredActive ?? (localMentor ? localMentor.featuredActive : false),
        promoTitle: override.promoTitle ?? '', promoDescription: override.promoDescription ?? '',
        promoLink: override.promoLink ?? '', promoImage: override.promoImage ?? '',
      };
    }
    return null;
  } catch (error) {
    console.error("getMentorByEmail Error:", error);
    throw error;
  }
}

export async function updateMentorProfile(mentorId: string, fields: { specialties: string[], bio: string, gradeLevel: string, directoryVisibility: boolean, lessons?: string, title?: string, awards?: string, photoUrl?: string, socialLinks?: string, exportConsent?: boolean }) {
  try {
    const patchObj: Record<string, any> = {
      'Specialty': fields.specialties.join(', '), 'Bio': fields.bio,
      'Grade_Level': fields.gradeLevel, 'Profile_Visibility': fields.directoryVisibility,
      'Lessons': fields.lessons || '', 'Title': fields.title || '',
      'Awards': fields.awards || '', 'Photo_URL': fields.photoUrl || '',
      'Social_Links': fields.socialLinks || '',
      'Export_Consent': !!fields.exportConsent
    };
    await updateTeableRecord(TEABLE_TABLE_ID_MENTORS, mentorId, patchObj);
    return { success: true };
  } catch (error) {
    console.error("updateMentorProfile Error:", error);
    throw error;
  }
}

export interface AdminAlert {
  id: string; alertType: string; description: string; timestamp: string; status: string;
}

export async function getAdminAlerts(): Promise<AdminAlert[]> {
  try {
    const records = await fetchTeableRecords(TEABLE_TABLE_ID_ADMIN_ALERTS);
    return records
      .filter(rec => rec.fields && rec.fields.Alert_Type && rec.fields.Timestamp)
      .map(rec => ({
        id: rec.id, alertType: rec.fields.Alert_Type || '',
        description: rec.fields.Description || '',
        timestamp: rec.fields.Timestamp || '', status: rec.fields.Status || 'Open'
      })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error("Failed to fetch admin alerts:", error);
    return [];
  }
}

export interface EnquiryMessage {
  id: string; 
  accountEmail: string; 
  senderName?: string; 
  senderEmail?: string;
  mentorId: string; 
  message: string; 
  timestamp: string; 
  status: string; 
  direction: string;
}

export async function getMentorMessages(mentorId: string): Promise<EnquiryMessage[]> {
  try {
    const records = await fetchTeableRecords(TEABLE_TABLE_ID_ENQUIRIES);
    return records
      .filter(rec => rec.fields && rec.fields.Mentor_ID === mentorId)
      .map(rec => {
        const f = rec.fields || {};
        return {
          id: rec.id, 
          accountEmail: f.Account_ID || '',
          senderName: f.Sender_Name || '',
          senderEmail: f.Sender_Email || f.Account_ID || '',
          mentorId: f.Mentor_ID || '', 
          message: f.Message || '', 
          timestamp: f.Timestamp || '', 
          status: f.Status || 'Unread', 
          direction: f.Direction || 'seeker_to_mentor'
        };
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error("Failed to fetch enquiries:", error);
    return [];
  }
}

export async function resolveAlert(alertId: string) {
  await updateTeableRecord(TEABLE_TABLE_ID_ADMIN_ALERTS, alertId, { 'Status': 'Resolved' });
  return { success: true };
}

export async function approveClaim(mentorId: string, alertId: string) {
  await updateTeableRecord(TEABLE_TABLE_ID_MENTORS, mentorId, { 'Claim_Status': 'Verified' });
  await updateTeableRecord(TEABLE_TABLE_ID_ADMIN_ALERTS, alertId, { 'Status': 'Resolved' });
  return { success: true };
}

export async function addMentorReply(messageId: string, replyText: string) {
  try {
    await createTeableRecord(TEABLE_TABLE_ID_ENQUIRIES, {
      'ID': messageId, 'Message': replyText,
      'Timestamp': new Date().toISOString(), 'Direction': 'mentor_to_seeker'
    });
    return { success: true };
  } catch (error) {
    console.error('Reply Error:', error);
    throw error;
  }
}

export async function updateMentorMessageStatus(messageId: string, status: string) {
  await updateTeableRecord(TEABLE_TABLE_ID_ENQUIRIES, messageId, { 'Status': status });
  return { success: true };
}

export interface MentorMessage {
  id: string;
  mentorId: string;
  mentorName?: string;
  seekerEmail: string;
  seekerName?: string;
  subject: string;
  message: string;
  status: 'New' | 'Read' | 'Replied' | 'Closed';
  reply?: string;
  createdAt: string;
  repliedAt?: string;
}

export async function getMentorMessagesByMentorId(mentorId: string): Promise<MentorMessage[]> {
  try {
    const records = await fetchTeableRecords(TEABLE_TABLE_ID_MENTOR_MESSAGES);
    return records
      .filter(rec => rec.fields && rec.fields.Mentor_ID === mentorId)
      .map(rec => {
        const f = rec.fields || {};
        return {
          id: rec.id,
          mentorId: f.Mentor_ID || '',
          mentorName: f.Mentor_Name || '',
          seekerEmail: f.Seeker_Email || '',
          seekerName: f.Seeker_Name || '',
          subject: f.Subject || '',
          message: f.Message || '',
          status: f.Status || 'New',
          reply: f.Reply || '',
          createdAt: f.Created_At || '',
          repliedAt: f.Replied_At || '',
        };
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Failed to fetch mentor messages:", error);
    return [];
  }
}

export async function getMentorMessageById(messageId: string): Promise<MentorMessage | null> {
  try {
    const record = await fetchTeableRecord(TEABLE_TABLE_ID_MENTOR_MESSAGES, messageId);
    if (!record || !record.fields) return null;
    const f = record.fields;
    return {
      id: record.id,
      mentorId: f.Mentor_ID || '',
      mentorName: f.Mentor_Name || '',
      seekerEmail: f.Seeker_Email || '',
      seekerName: f.Seeker_Name || '',
      subject: f.Subject || '',
      message: f.Message || '',
      status: f.Status || 'New',
      reply: f.Reply || '',
      createdAt: f.Created_At || '',
      repliedAt: f.Replied_At || '',
    };
  } catch (error) {
    console.error("getMentorMessageById Error:", error);
    return null;
  }
}

export async function createMentorMessage(fields: {
  mentorId: string;
  mentorName: string;
  seekerEmail: string;
  seekerName: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const newRec = await createTeableRecord(TEABLE_TABLE_ID_MENTOR_MESSAGES, {
      'Mentor_ID': fields.mentorId,
      'Mentor_Name': fields.mentorName,
      'Seeker_Email': fields.seekerEmail,
      'Seeker_Name': fields.seekerName,
      'Subject': fields.subject,
      'Message': fields.message,
      'Status': 'New',
      'Created_At': new Date().toISOString(),
    });
    return { success: true, messageId: newRec.id };
  } catch (error) {
    console.error("createMentorMessage Error:", error);
    return { success: false, error: String(error) };
  }
}

export async function replyToMentorMessage(messageId: string, replyText: string): Promise<{ success: boolean; error?: string }> {
  try {
    await updateTeableRecord(TEABLE_TABLE_ID_MENTOR_MESSAGES, messageId, {
      'Reply': replyText,
      'Status': 'Replied',
      'Replied_At': new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error("replyToMentorMessage Error:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateMentorMessageReadStatus(messageId: string, status: 'New' | 'Read'): Promise<{ success: boolean }> {
  try {
    await updateTeableRecord(TEABLE_TABLE_ID_MENTOR_MESSAGES, messageId, { 'Status': status });
    return { success: true };
  } catch (error) {
    console.error("updateMentorMessageReadStatus Error:", error);
    return { success: false };
  }
}

export async function createResource(fields: { title: string, category: string, grade: string, fileLink: string, isFree: boolean, mentorId?: string }) {
  const newRec = await createTeableRecord(TEABLE_TABLE_ID_RESOURCES, {
    'Title': fields.title, 'Category': fields.category, 'Grade': fields.grade,
    'File_Link': fields.fileLink, 'Is_Free': fields.isFree, 'Mentor_ID': fields.mentorId || ''
  });
  return newRec;
}

export async function saveFeaturedPromoSettings(mentorId: string, promo: { featuredActive: boolean, promoTitle: string, promoDescription: string, promoLink: string, promoImage: string }) {
  if (typeof window !== 'undefined') {
    let settings: Record<string, any> = {};
    const raw = localStorage.getItem('MENTOR_FEATURED_SETTINGS');
    if (raw) { try { settings = JSON.parse(raw); } catch (e) {} }
    settings[mentorId] = { ...settings[mentorId], ...promo };
    localStorage.setItem('MENTOR_FEATURED_SETTINGS', JSON.stringify(settings));
  }
  await createTeableRecord(TEABLE_TABLE_ID_ADMIN_ALERTS, {
    'Alert_Type': 'Featured Mentor Upgrade',
    'Description': `[Featured Profile] Mentor ID: ${mentorId}. Title: "${promo.promoTitle}". Link: ${promo.promoLink}`,
    'Timestamp': new Date().toISOString(), 'Status': 'Open'
  });
  return { success: true };
}

export async function saveMentorProBranding(mentorId: string, branding: { profileTheme: string }) {
  if (typeof window !== 'undefined') {
    let settings: Record<string, any> = {};
    const raw = localStorage.getItem('MENTOR_FEATURED_SETTINGS');
    if (raw) { try { settings = JSON.parse(raw); } catch (e) {} }
    settings[mentorId] = { ...settings[mentorId], profileTheme: branding.profileTheme };
    localStorage.setItem('MENTOR_FEATURED_SETTINGS', JSON.stringify(settings));
  }
  return { success: true };
}

export async function submitSponsorInquiry(brandName: string, email: string, website: string, description: string, logoUrl: string, tier: string) {
  await createTeableRecord(TEABLE_TABLE_ID_ADMIN_ALERTS, {
    'Alert_Type': 'Sponsor Inquiry',
    'Description': `[Sponsor] Brand: ${brandName}. Email: ${email}. Website: ${website}. Tier: ${tier}`,
    'Timestamp': new Date().toISOString(), 'Status': 'Open'
  });
  return { success: true };
}

export async function submitSponsorOffer(email: string, brandName: string, website: string, description: string, logoUrl: string, tier: string, price: string) {
  await createTeableRecord(TEABLE_TABLE_ID_SPONSOR_OFFERS, {
    'Account_ID': email, 'Brand_Name': brandName, 'Email': email,
    'Website': website, 'Description': description, 'Logo_URL': logoUrl,
    'Tier': tier, 'Price': price, 'Payment_Status': 'pending', 'Placement_Status': 'pending'
  });
  return { success: true };
}

export async function logSponsorPayment(tier: string) {
  await createTeableRecord(TEABLE_TABLE_ID_ADMIN_ALERTS, {
    'Alert_Type': 'Sponsor Payment',
    'Description': `[Sponsor Payment Completed] Tier: ${tier}`,
    'Timestamp': new Date().toISOString(), 'Status': 'Open'
  });
  return { success: true };
}

export interface Account {
  id: string; email: string; role: string; subscriptionActive: boolean; fullName?: string;
}

export async function getAccountByEmail(email: string): Promise<Account | null> {
  try {
    const records = await fetchTeableRecords(TEABLE_TABLE_ID_ACCOUNTS);
    const match = records.find(rec => rec.fields.Email && rec.fields.Email.toLowerCase() === email.toLowerCase());
    if (match) {
      return {
        id: match.id, email: match.fields.Email,
        role: match.fields.Roles || 'user',
        subscriptionActive: match.fields.Billing_Status === 'Active' || ['Enhanced', 'pro'].includes(match.fields.Membership_Tier),
        fullName: match.fields.Display_Name || '',
      };
    }
    return null;
  } catch (error) {
    console.warn("Failed to fetch account:", error);
    return null;
  }
}

export async function createAccount(email: string, role: 'user' | 'mentor', fullName: string): Promise<Account> {
  const fields: Record<string, any> = {
    'Email': email, 'Roles': role,
    'Display_Name': fullName, 'Registered_At': new Date().toISOString(),
    'Account_Status': 'Active', 'Billing_Status': 'Free',
    'Terms_Accepted_At': new Date().toISOString(),
  };
  const newRec = await createTeableRecord(TEABLE_TABLE_ID_ACCOUNTS, fields);
  return { id: newRec.id, email, role, subscriptionActive: false, fullName };
}

export async function updateAccountBillingStatus(email: string, status: 'Active' | 'Past due' | 'Canceled' | 'Free'): Promise<void> {
  try {
    const account = await getAccountByEmail(email);
    if (!account) throw new Error('Account not found');
    await updateTeableRecord(TEABLE_TABLE_ID_ACCOUNTS, account.id, {
      'Billing_Status': status
    });
  } catch (error) {
    console.error("updateAccountBillingStatus Error:", error);
    throw error;
  }
}

export interface SystemAdminUser {
  id: string;
  email: string;
  password?: string;
}

export async function getSystemAdmins(): Promise<SystemAdminUser[]> {
  // Try server-side endpoint first (hides passwords from client)
  try {
    const res = await fetch('/api/admin-auth', { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((a: any) => ({ id: a.id, email: a.email, password: '' }));
      }
    }
  } catch {}
  // Fallback: direct Teable (exposes passwords — only for local dev without API route)
  try {
    const records = await fetchTeableRecords(TEABLE_TABLE_ID_ADMIN_ALERTS);
    const adminRecs = records.filter(rec => rec.fields && rec.fields.Alert_Type === 'Admin User');
    if (adminRecs.length === 0) {
      return [{ id: 'default', email: 'admin@thewaldorfpath.com', password: '' }];
    }
    return adminRecs.map(rec => {
      let email = 'admin@thewaldorfpath.com';
      let password = '';
      try {
        const parsed = JSON.parse(rec.fields.Description || '{}');
        email = parsed.email || email;
        password = parsed.password || password;
      } catch (e) {}
      return { id: rec.id, email, password };
    });
  } catch (error) {
    console.warn("Failed to fetch admins:", error);
    return [{ id: 'local', email: 'admin@thewaldorfpath.com', password: '' }];
  }
}

export async function verifyAdminCredentials(email: string, password: string): Promise<{ success: boolean; admin?: SystemAdminUser; error?: string }> {
  try {
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', email, password }),
    });
    const data = await res.json();
    if (data.success) return { success: true, admin: data.admin };
    return { success: false, error: data.error || 'Invalid credentials' };
  } catch (e) {
    // Fallback to client-side check (dev without API)
    try {
      const admins = await getSystemAdmins();
      const match = admins.find(a => a.email.toLowerCase() === email.toLowerCase() && (a as any).password === password);
      if (match) return { success: true, admin: match };
    } catch {}
    return { success: false, error: 'Verification unavailable' };
  }
}

export async function updateSystemAdmin(id: string, email: string, password: string): Promise<void> {
  const fields = {
    'Alert_Type': 'Admin User',
    'Description': JSON.stringify({ email, password }),
    'Timestamp': new Date().toISOString(),
    'Status': 'Resolved'
  };
  if (id === 'default' || id === 'local') {
    await createTeableRecord(TEABLE_TABLE_ID_ADMIN_ALERTS, fields);
  } else {
    await updateTeableRecord(TEABLE_TABLE_ID_ADMIN_ALERTS, id, fields);
  }
}

export async function createMentor(email: string, name: string): Promise<Mentor> {
  const newRecord = await createTeableRecord(TEABLE_TABLE_ID_MENTORS, {
    'Name': name, 'Specialty': 'General Waldorf Guidance', 'Grade_Level': 'All Ages',
    'Bio': 'Waldorf mentor and guide.', 'Photo_URL': 'https://i.pravatar.cc/150?u=new',
    'Claim_Status': 'Verified', 'Membership_Tier': 'Directory',
    'Claimant_Email': email, 'Profile_Visibility': true, 'Export_Consent': false
  });
  return {
    id: newRecord.id, name, email, specialties: ['General Waldorf Guidance'],
    gradeLevel: 'All Ages', bio: 'Waldorf mentor and guide.',
    photoUrl: 'https://i.pravatar.cc/150?u=new', location: 'Global',
    status: 'Verified', directoryVisibility: true, subscriptionActive: false,
    lessons: '', featuredActive: false, promoTitle: '', promoDescription: '',
    promoLink: '', promoImage: '', profileTheme: 'Classic', directoryEligible: false,
    profileType: 'individual', supportModes: '', languages: 'English',
    topicTags: [], multilingualAliases: '', socialLinks: '', credentialSummary: '', exportConsent: false,
  };
}

export interface ExportRow {
  [key: string]: string | number;
}

function flattenArray(value: any): string {
  if (Array.isArray(value)) return value.join(', ');
  if (value && typeof value === 'object') return JSON.stringify(value);
  return value ?? '';
}

export async function getMentorExportRows(onlyConsented: boolean = false): Promise<ExportRow[]> {
  const records = await fetchAllTeableRecords(TEABLE_TABLE_ID_MENTORS);
  let filtered = records.filter(rec => rec.fields && rec.fields.Name);
  if (onlyConsented) {
    filtered = filtered.filter(rec => rec.fields.Export_Consent === true);
  }
  return filtered
    .map(rec => {
      const f = rec.fields || {};
      const paid = f.Membership_Tier === 'Enhanced' || f.Billing_Status === 'Active';
      return {
        'Record ID': rec.id,
        'Name': flattenArray(f.Name),
        'Claim Email': flattenArray(f.Claimant_Email),
        'Contact Email': flattenArray(f.Gated_Contact_Email),
        'Contact Phone': flattenArray(f.Gated_Contact_Phone),
        'Contact Address': flattenArray(f.Gated_Contact_Address),
        'Website': f.Website_URL || '',
        'Social Links': flattenArray(f.Social_Links),
        'Location': flattenArray(f.Location),
        'Specialty': flattenArray(f.Specialty),
        'Grade Level': flattenArray(f.Grade_Level),
        'Languages': flattenArray(f.Languages),
        'Support Modes': flattenArray(f.Support_Modes),
        'Claim Status': flattenArray(f.Claim_Status),
        'Membership': paid ? 'Paid' : (f.Membership_Tier || 'Free'),
        'Billing Status': flattenArray(f.Billing_Status || 'Free'),
        'Featured Status': flattenArray(f.Featured_Status || 'Not requested'),
        'Publish Status': flattenArray(f.Publish_Status),
        'Profile Visibility': f.Profile_Visibility === true ? 'Visible' : 'Hidden',
        'Credential Review': flattenArray(f.Credential_Review_Status),
        'Credential Summary': flattenArray(f.Credential_Summary),
        'Export Consent': f.Export_Consent ? 'Yes' : 'No',
        'Data Source': flattenArray(f.Data_Source),
        'Bio': flattenArray(f.Bio),
      };
    });
}

export async function getAccountExportRows(): Promise<ExportRow[]> {
  const records = await fetchAllTeableRecords(TEABLE_TABLE_ID_ACCOUNTS);
  return records
    .filter(rec => rec.fields && (rec.fields.Email || rec.fields.Display_Name))
    .map(rec => {
      const f = rec.fields || {};
      return {
        'Record ID': rec.id,
        'Email': flattenArray(f.Email),
        'Display Name': flattenArray(f.Display_Name),
        'Roles': flattenArray(f.Roles),
        'Billing Status': flattenArray(f.Billing_Status),
        'Account Status': flattenArray(f.Account_Status),
        'Registered At': flattenArray(f.Registered_At),
        'Terms Accepted At': flattenArray(f.Terms_Accepted_At),
        'Legacy Created At': flattenArray(f.Legacy_Created_At),
      };
    });
}
