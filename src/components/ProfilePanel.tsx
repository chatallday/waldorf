import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Save, 
  CreditCard, 
  Eye, 
  EyeOff, 
  Settings, 
  Check, 
  Trash2, 
  ArrowLeft, 
  Sparkles, 
  X, 
  Download, 
  Database, 
  Loader2, 
  FileSpreadsheet 
} from 'lucide-react';
import { Mentor } from '../data/mentors';
import { showSuccess, showError } from '../utils/toastUtils';
import {
  getMentorByEmail,
  getMentorById,
  updateMentorProfile,
  syncMentorTier,
  getAdminAlerts,
  resolveAlert,
  approveClaim,
  AdminAlert,
  getMentors,
  getMentorMessages,
  getMentorMessagesByMentorId,
  replyToMentorMessage,
  updateMentorMessageReadStatus,
  MentorMessage,
  createResource,
  saveFeaturedPromoSettings,
  saveMentorProBranding,
  getAccountByEmail,
  createAccount,
  createMentor,
  getSystemAdmins,
  verifyAdminCredentials,
  updateSystemAdmin,
  SystemAdminUser
} from '../services/workflowService';

// Helper to prettify mentor IDs to Names in the admin display
function formatAlertDescription(description: string, mentors: Mentor[]) {
  if (!mentors || mentors.length === 0) return description;
  
  let formatted = description;
  mentors.forEach(m => {
    const safeId = m.id.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    // Replace "mentor ID <id>" first
    const mentorIdPattern = new RegExp(`mentor ID\\s+${safeId}`, 'gi');
    if (mentorIdPattern.test(formatted)) {
      formatted = formatted.replace(mentorIdPattern, `${m.name} (ID: ${m.id})`);
    } else {
      const plainIdPattern = new RegExp(`\\b${safeId}\\b`, 'g');
      if (plainIdPattern.test(formatted) && !formatted.toLowerCase().includes(m.name.toLowerCase())) {
        formatted = formatted.replace(plainIdPattern, `${m.name} (ID: ${m.id})`);
      }
    }
  });
  return formatted;
}

// Helper to extract teacher name and claimant email from claims log description
function parseClaimAlert(description: string) {
  const match = description.match(/Profile claim initiated for mentor (.*?) \(ID:.*?\)\s+by\s+(\S+)/i);
  if (match) {
    return {
      mentorName: match[1].trim(),
      mentorEmail: match[2].trim()
    };
  }
  return {
    mentorName: 'Teacher',
    mentorEmail: ''
  };
}

export function ProfilePanel() {
  const [loading, setLoading] = useState(false);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [email, setEmail] = useState('');

  // Dashboard mode: 'login' | 'mentor' | 'admin' | 'seeker'
  const [viewMode, setViewMode] = useState<'login' | 'mentor' | 'admin' | 'seeker' | 'sales_gate'>('login');
  const [loginRole, setLoginRole] = useState<'user' | 'mentor' | 'admin' | 'seeker'>('user');
  const [userEmail, setUserEmail] = useState('');
  const [userSubscribed, setUserSubscribed] = useState(false);
  const [userId, setUserId] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');

  // Admin Login and Management States
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [editAdminEmail, setEditAdminEmail] = useState('');
  const [editAdminPassword, setEditAdminPassword] = useState('');
  const [activeAdminUser, setActiveAdminUser] = useState<SystemAdminUser | null>(null);

  // Admin view tabs & config states
  const [adminTab, setAdminTab] = useState<'claims' | 'inquiries' | 'settings' | 'sponsors_policies' | 'export'>('claims');
  const [geminiKey, setGeminiKey] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') || '' : ''));
  const [openaiKey, setOpenaiKey] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('OPENAI_API_KEY') || '' : ''));

  // Load server-backed keys on mount (Teable) — keeps dash in sync with what /api/gemini actually uses
  useEffect(() => {
    fetch('/api/ai-config')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        if (data.geminiApiKey && data.geminiApiKey !== geminiKey) {
          setGeminiKey(data.geminiApiKey);
          try { localStorage.setItem('GEMINI_API_KEY', data.geminiApiKey); } catch {}
        }
        if (data.openaiApiKey && data.openaiApiKey !== openaiKey) {
          setOpenaiKey(data.openaiApiKey);
          try { localStorage.setItem('OPENAI_API_KEY', data.openaiApiKey); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Policies Settings
  const [adminPrivacyText, setAdminPrivacyText] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('SITE_POLICY_PRIVACY') || '' : ''));
  const [adminTermsText, setAdminTermsText] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('SITE_POLICY_TERMS') || '' : ''));
  const [adminCookiesText, setAdminCookiesText] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('SITE_POLICY_COOKIES') || '' : ''));
  const [adminSponsorText, setAdminSponsorText] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('SITE_POLICY_SPONSOR') || '' : ''));

  // CSV Export state
  const [exportType, setExportType] = useState<'mentors' | 'accounts' | 'all'>('mentors');
  const [onlyConsented, setOnlyConsented] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const { getMentorExportRows, getAccountExportRows } = await import('../services/workflowService');
      const { rowsToCsv, downloadCsv } = await import('../utils/csvUtils');
      if (exportType === 'mentors' || exportType === 'all') {
        const rows = await getMentorExportRows(onlyConsented);
        downloadCsv(rowsToCsv(rows), `waldorf-path-mentors-${new Date().toISOString().slice(0, 10)}.csv`);
      }
      if (exportType === 'accounts' || exportType === 'all') {
        const rows = await getAccountExportRows();
        downloadCsv(rowsToCsv(rows), `waldorf-path-accounts-${new Date().toISOString().slice(0, 10)}.csv`);
      }
      showSuccess(exportType === 'all' ? 'Both CSVs downloaded.' : 'CSV downloaded.');
    } catch (err) {
      console.error('Export failed:', err);
      showError('Export failed — please check the console.');
    } finally {
      setExporting(false);
    }
  };

  // Initialize defaults if empty on first loading
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('SITE_POLICY_PRIVACY')) {
        const txt = `Privacy Policy for The Waldorf Path\n\nLast updated: June 2026\n\nAt The Waldorf Path, we take the privacy of our directory guides and visitors seriously. \n\n1. Information We Collect\nWe collect email addresses only when profile claims or sponsor inquiries are initiated. This information is used solely to establish communication and verify identity.\n\n2. Messaging and Inquiries\nSeeker inquiry messages and contact logs are stored securely in our system. We do not sell, distribute, or share personal contact information with third parties.\n\n3. System Logs & Security\nAccess to the admin back-office is strictly password-protected. All credentials and configuration keys are stored in secure formats.\n\nIf you have questions about your listing data or wish to request removal, please contact the administrator.`;
        setAdminPrivacyText(txt);
        localStorage.setItem('SITE_POLICY_PRIVACY', txt);
      }
      if (!localStorage.getItem('SITE_POLICY_TERMS')) {
        const txt = `Terms & Conditions for The Waldorf Path\n\nLast updated: June 2026\n\nBy claiming a profile or using this directory, you agree to:\n\n1. Directory Listings & Claiming\nProvide accurate, verified credentials when claiming guide profiles. Claiming profiles under false email addresses or unauthorized identities is strictly prohibited and subject to immediate removal.\n\n2. Acceptable Conduct\nRespect our members and avoid spamming or soliciting guides for commercial operations. All messages sent through guide contact forms must represent genuine parent-teacher or guidance inquiries.\n\n3. Subscriptions & Billing\nUpgrade packages (such as Featured profiles) and sponsorships are billed on recurring cycles. Simulation pathways do not represent final live billing agreements.\n\nNina's Back-office reserves the right to unpublish listings that violate Waldorf education values.`;
        setAdminTermsText(txt);
        localStorage.setItem('SITE_POLICY_TERMS', txt);
      }
      if (!localStorage.getItem('SITE_POLICY_COOKIES')) {
        const txt = `Cookies & Local Storage Policy\n\nLast updated: June 2026\n\nThe Waldorf Path uses essential local storage mechanisms to:\n\n1. Developer & Admin Settings\nSave custom API keys (Gemini and OpenAI) configurations locally within your browser. These keys are never transmitted to third parties except when making direct model invocation calls.\n\n2. Session States\nManage active claimant session data and keep track of active dashboard panel states.\n\n3. Settings Cache\nStore your customized policy texts and active sponsor items list.\n\nNo tracking or promotional profiling cookies are deployed.`;
        setAdminCookiesText(txt);
        localStorage.setItem('SITE_POLICY_COOKIES', txt);
      }
      if (!localStorage.getItem('SITE_POLICY_SPONSOR')) {
        const txt = `🌟 Position Your Brand at the Heart of the Waldorf Community

Connect directly with thousands of passionate parents, dedicated teachers, homeschoolers, and Steiner institutions worldwide. Our scrolling sponsor ticker on the homepage is the premier space to showcase your school, organic supply store, teacher training academy, or anthroposophic services.

Choose your visibility level:
- Home Page Ticker Slot: $15/month (Includes logo image, brand name, short description, and direct link to your website/shop).
- Ultimate Ticker + Dedicated Highlight Slot: $35/month (Get standard ticker inclusion plus featured priority ranking banner).

Select a pricing tier below to continue with Stripe checkout:`;
        setAdminSponsorText(txt);
        localStorage.setItem('SITE_POLICY_SPONSOR', txt);
      }
    }
  }, []);

  // Sponsors List
  const [adminSponsors, setAdminSponsors] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('SITE_SPONSORS_LIST');
      if (raw) {
        try { return JSON.parse(raw); } catch (e) {}
      }
      return [
        { name: "Sunbridge Institute", description: "Waldorf Teacher Training and summer workshops.", logoUrl: "https://i.pravatar.cc/100?u=Sunbridge", link: "https://sunbridge.edu" },
        { name: "Simplicity Parenting", description: "Warm discipline and simplicity rhythm coaching.", logoUrl: "https://i.pravatar.cc/100?u=Simplicity", link: "https://simplicityparenting.com" },
        { name: "TeachingWaldorf", description: "Grade lesson planners, booklets, and art guides.", logoUrl: "https://i.pravatar.cc/100?u=TeachingWaldorf", link: "https://teachingwaldorf.com" },
        { name: "Waldorf Modern UK", description: "International teacher seminars and drama courses.", logoUrl: "https://i.pravatar.cc/100?u=WaldorfModern", link: "https://waldorfmodern.uk" }
      ];
    }
    return [];
  });

  const [newSponsorName, setNewSponsorName] = useState('');
  const [newSponsorLink, setNewSponsorLink] = useState('');
  const [newSponsorLogo, setNewSponsorLogo] = useState('');
  const [newSponsorDesc, setNewSponsorDesc] = useState('');

  // Featured promotion form states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [featuredPaymentSimulated, setFeaturedPaymentSimulated] = useState(false);

  // Seeker & Mentor Pro modal states
  const [showSeekerUpgradeModal, setShowSeekerUpgradeModal] = useState(false);
  const [showMentorProUpgradeModal, setShowMentorProUpgradeModal] = useState(false);
  const [featuredPromoSubmitted, setFeaturedPromoSubmitted] = useState(false);
  const [featuredPromoTitle, setFeaturedPromoTitle] = useState('');
  const [featuredPromoDesc, setFeaturedPromoDesc] = useState('');
  const [featuredPromoLink, setFeaturedPromoLink] = useState('');
  const [featuredPromoImage, setFeaturedPromoImage] = useState('');

  // Email draft modal states
  const [activeDraft, setActiveDraft] = useState<{
    type: 'id_proof' | 'approval';
    mentorName: string;
    mentorEmail: string;
  } | null>(null);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copied draft to clipboard!');
  };

  // Form states
  const [specialtiesText, setSpecialtiesText] = useState('');
  const [bioText, setBioText] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [visibility, setVisibility] = useState(true);
  const [lessonsText, setLessonsText] = useState('');
  const [titleText, setTitleText] = useState('');
  const [awardsText, setAwardsText] = useState('');
  const [socialLinksText, setSocialLinksText] = useState('');
  const [exportConsent, setExportConsent] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Custom Profile Theme selection state
  const [selectedTheme, setSelectedTheme] = useState('Classic');

  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [mentorsList, setMentorsList] = useState<Mentor[]>([]);

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const [alertsData, mentorsData] = await Promise.all([
        getAdminAlerts(),
        getMentors()
      ]);
      setAlerts(alertsData);
      setMentorsList(mentorsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const handleAddSponsorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSponsorName || !newSponsorLink || !newSponsorLogo || !newSponsorDesc) {
      alert("Please fill in all sponsor fields.");
      return;
    }
    const updated = [...adminSponsors, { name: newSponsorName, description: newSponsorDesc, logoUrl: newSponsorLogo, link: newSponsorLink }];
    setAdminSponsors(updated);
    localStorage.setItem('SITE_SPONSORS_LIST', JSON.stringify(updated));
    showSuccess('New sponsor added to ticker!');
    setNewSponsorName('');
    setNewSponsorLink('');
    setNewSponsorLogo('');
    setNewSponsorDesc('');
  };

  const handleDeleteSponsor = (indexToDelete: number) => {
    const updated = adminSponsors.filter((_, idx) => idx !== indexToDelete);
    setAdminSponsors(updated);
    localStorage.setItem('SITE_SPONSORS_LIST', JSON.stringify(updated));
    showSuccess('Sponsor deleted.');
  };

  const handleFeaturedStripeCheckout = async () => {
    const confirmPayment = window.confirm("Proceed to simulated Stripe Checkout ($10.00/month)?");
    if (confirmPayment) {
      try {
        setFeaturedPaymentSimulated(true);
        showSuccess("Featured subscription simulated successfully!");
      } catch (err) {
        showError("Simulation failed");
      }
    }
  };

  // Create a Stripe payment link for subscription
  const handleCreateStripePaymentLink = async (planType: 'seeker-pro' | 'mentor-pro') => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe-create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create payment link: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Redirect to the Stripe checkout page
      window.location.href = data.url;
    } catch (error: any) {
      showError(`Failed to initiate payment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedPromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentor) return;
    try {
      const payload = {
        featuredActive: true,
        promoTitle: featuredPromoTitle,
        promoDescription: featuredPromoDesc,
        promoLink: featuredPromoLink,
        promoImage: featuredPromoImage
      };
      await saveFeaturedPromoSettings(mentor.id, payload);
      setFeaturedPromoSubmitted(true);
      showSuccess("Promotion configurations saved!");
      setMentor({
        ...mentor,
        ...payload
      });
    } catch (err) {
      showError("Failed to save promotion settings");
    }
  };

  const handleSaveBranding = async (theme: string) => {
    if (!mentor) return;
    try {
      await saveMentorProBranding(mentor.id, { profileTheme: theme });
      setSelectedTheme(theme);
      setMentor({
        ...mentor,
        profileTheme: theme
      });
      showSuccess(`Profile theme updated to ${theme}!`);
    } catch (err) {
      showError("Failed to save theme settings");
    }
  };

  // Auto-login from unique URL parameter ?email=... and session caching
  useEffect(() => {
    if (viewMode === 'admin') {
      fetchAlerts();
      getSystemAdmins().then(admins => {
        if (admins && admins.length > 0) {
          setActiveAdminUser(admins[0]);
          setEditAdminEmail(admins[0].email);
          setEditAdminPassword(admins[0].password || '');
        }
      }).catch(err => console.error("Failed to load admin credentials:", err));
    }
  }, [viewMode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const loginToken = params.get('loginToken');
    const isAdminView = window.location.pathname === '/admin' || params.get('view') === 'admin';

    if (isAdminView) {
      setLoginRole('admin' as any);
      setViewMode('login');
    } else if (loginToken || emailParam) {
      setLoading(true);
      setErrorMsg('');
      
      const authPromise = loginToken 
        ? getMentorById(loginToken.trim()) 
        : getMentorByEmail(emailParam!.trim());

      authPromise
        .then(data => {
          if (data) {
            setMentor(data);
setSpecialtiesText(data.specialties.join(', '));
            setBioText(data.bio);
            setGradeLevel(data.gradeLevel);
            setVisibility(data.directoryVisibility);
            setLessonsText(data.lessons || '');
            setTitleText(data.title || '');
            setAwardsText(data.awards || '');
            setSocialLinksText(data.socialLinks || '');
            setExportConsent(!!data.exportConsent);
            setPhotoPreview(data.photoUrl || '');
            setFeaturedPromoTitle(data.promoTitle || '');
            setFeaturedPromoDesc(data.promoDescription || '');
            setFeaturedPromoLink(data.promoLink || `${window.location.origin}?mentorId=${data.id}`);
            setFeaturedPromoImage(data.promoImage || '');
            setFeaturedPaymentSimulated(data.featuredActive || false);
            setSelectedTheme(data.profileTheme || 'Classic');
            setViewMode('mentor');
            localStorage.setItem('LOGGED_IN_USER', JSON.stringify({ email: data.email, role: 'mentor', subscriptionActive: data.subscriptionActive, id: data.id }));
          } else {
            if (emailParam) {
              const targetEmail = emailParam.trim();
              setUserEmail(targetEmail);
              getAccountByEmail(targetEmail).then(async aData => {
                let currentAccount = aData;
                if (!currentAccount) {
                  currentAccount = await createAccount(targetEmail, 'user', '');
                }
                setUserId(currentAccount.id);
                setUserSubscribed(currentAccount.subscriptionActive);
                setViewMode('seeker');
                localStorage.setItem('LOGGED_IN_USER', JSON.stringify({ email: targetEmail, role: 'user', subscriptionActive: currentAccount.subscriptionActive, id: currentAccount.id, fullName: currentAccount.fullName }));
              });
            } else {
              setErrorMsg("No listing matches this claimant login token.");
            }
          }
        })
        .catch(err => {
          setErrorMsg(`Failed to authenticate: ${err?.message || err}`);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Check for cached session
      const cached = localStorage.getItem('LOGGED_IN_USER');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.role === 'mentor') {
            setEmail(parsed.email);
            getMentorByEmail(parsed.email).then(data => {
              if (data) {
                setMentor(data);
setSpecialtiesText(data.specialties.join(', '));
            setBioText(data.bio);
            setGradeLevel(data.gradeLevel);
            setVisibility(data.directoryVisibility);
            setLessonsText(data.lessons || '');
            setTitleText(data.title || '');
            setAwardsText(data.awards || '');
            setSocialLinksText(data.socialLinks || '');
            setExportConsent(!!data.exportConsent);
            setPhotoPreview(data.photoUrl || '');
                setFeaturedPromoTitle(data.promoTitle || '');
                setFeaturedPromoDesc(data.promoDescription || '');
                setFeaturedPromoLink(data.promoLink || `${window.location.origin}?mentorId=${data.id}`);
                setFeaturedPromoImage(data.promoImage || '');
                setFeaturedPaymentSimulated(data.featuredActive || false);
                setSelectedTheme(data.profileTheme || 'Classic');
                setViewMode('mentor');
              }
            });
          } else if (parsed.role === 'user') {
            setUserEmail(parsed.email);
            setUserId(parsed.id || '');
            getAccountByEmail(parsed.email).then(aData => {
              if (aData) {
                setUserId(aData.id);
                setUserSubscribed(aData.subscriptionActive);
                localStorage.setItem('LOGGED_IN_USER', JSON.stringify({ email: parsed.email, role: 'user', subscriptionActive: aData.subscriptionActive, id: aData.id, fullName: aData.fullName }));
              } else {
                setUserSubscribed(parsed.subscriptionActive);
              }
            });
            setViewMode('seeker');
          } else if (parsed.role === 'admin') {
            setAdminEmail(parsed.email);
            setViewMode('admin');
          }
        } catch (e) {
          console.error("Failed to restore cached user session:", e);
        }
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (loginRole === ('admin' as any)) {
      setLoading(true);
      try {
        const result = await verifyAdminCredentials(adminEmail.trim(), adminPassword);
        if (result.success && result.admin) {
          setViewMode('admin');
          localStorage.setItem('LOGGED_IN_USER', JSON.stringify({ email: result.admin.email, role: 'admin', id: result.admin.id }));
          showSuccess("Nina's Back-office activated.");
        } else {
          setErrorMsg(result.error || "Incorrect admin email or password.");
        }
      } catch (err: any) {
        setErrorMsg(`Failed to validate admin: ${err?.message || err}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email) return;
    setLoading(true);
    setErrorMsg('');
    try {
      if (loginRole === 'mentor') {
        let data = await getMentorByEmail(email);
        let isNewSignup = false;

        if (!data) {
          if (isSignUp) {
            if (!fullName.trim()) {
              throw new Error("Full Name is required for registration.");
            }
            data = await createMentor(email, fullName.trim());
            isNewSignup = true;
          } else {
            setErrorMsg("No listing matches this claimant email. Verify spelling or switch to Sign Up.");
            setLoading(false);
            return;
          }
        }

        if (data) {
          setMentor(data);
          setSpecialtiesText(data.specialties.join(', '));
          setBioText(data.bio);
          setGradeLevel(data.gradeLevel);
          setVisibility(data.directoryVisibility);
          setLessonsText(data.lessons || '');
          setTitleText(data.title || '');
          setAwardsText(data.awards || '');
          setSocialLinksText(data.socialLinks || '');
            setExportConsent(!!data.exportConsent);
          setPhotoPreview(data.photoUrl || '');
          setFeaturedPromoTitle(data.promoTitle || '');
          setFeaturedPromoDesc(data.promoDescription || '');
          setFeaturedPromoLink(data.promoLink || `${window.location.origin}?mentorId=${data.id}`);
          setFeaturedPromoImage(data.promoImage || '');
          setFeaturedPaymentSimulated(data.featuredActive || false);
          setSelectedTheme(data.profileTheme || 'Classic');
          setViewMode(isNewSignup ? 'sales_gate' : 'mentor');
          localStorage.setItem('LOGGED_IN_USER', JSON.stringify({ email, role: 'mentor', subscriptionActive: data.subscriptionActive, id: data.id }));
          showSuccess(isNewSignup ? "Mentor profile registered!" : "Mentor workspace activated.");
        }
      } else {
        // User Login (was Seeker)
        setUserEmail(email);
        let currentAccount = await getAccountByEmail(email);
        let isNewSignup = false;
        if (!currentAccount) {
          currentAccount = await createAccount(email, 'user', fullName || '');
          isNewSignup = true;
        }
        setUserId(currentAccount.id);
        setUserSubscribed(currentAccount.subscriptionActive);
        setViewMode(isNewSignup ? 'sales_gate' : 'seeker');
        localStorage.setItem('LOGGED_IN_USER', JSON.stringify({ email, role: 'user', subscriptionActive: currentAccount.subscriptionActive, id: currentAccount.id, fullName: currentAccount.fullName }));
        showSuccess(isNewSignup ? "Account created! Welcome to The Waldorf Path." : "Account loaded.");
      }
    } catch (err: any) {
      setErrorMsg(`Failed to authenticate: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminForgotPassword = async () => {
    if (!adminEmail.trim()) {
      alert("Please enter your admin email first to request a password reminder.");
      return;
    }
    setLoading(true);
    try {
      const admins = await getSystemAdmins();
      const match = admins.find(a => a.email.toLowerCase() === adminEmail.trim().toLowerCase());
      if (match) {
        alert(`Admin email verified (${match.email}). For security, passwords are no longer displayed in the browser. Please use your configured password, or reset it directly in the Teable admin table (Admin Alerts table, Alert_Type = 'Admin User').`);
        showSuccess("Admin email verified.");
      } else {
        alert("This email address is not pre-authorized as a system administrator.");
      }
    } catch (err: any) {
      alert(`Error recovering password: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('LOGGED_IN_USER');
    setMentor(null);
    setUserEmail('');
    setUserSubscribed(false);
    setEmail('');
    setViewMode('login');
showSuccess("Logged out successfully.");
   };

   const handleUserStripeToggle = async () => {
    const targetStatus = !userSubscribed;
    if (userSubscribed) {
      const confirmed = window.confirm('Cancel your Premium subscription? You will lose mentor contact access.');
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm('Proceed to Stripe Checkout for Waldorf Premium ($9.99/month)?');
      if (!confirmed) return;
    }

    if (userSubscribed) {
      setLoading(true);
      try {
        let finalUserId = userId;
        if (!finalUserId) {
          const aData = await getAccountByEmail(userEmail);
          if (aData) { finalUserId = aData.id; setUserId(aData.id); }
        }
        setUserSubscribed(targetStatus);
        localStorage.setItem('LOGGED_IN_USER', JSON.stringify({ email: userEmail, role: 'user', subscriptionActive: targetStatus, id: finalUserId }));
        showSuccess(targetStatus ? "Premium activated!" : "Premium cancelled.");
      } catch (err: any) {
        console.error(err);
        showError(`Update failed: ${err?.message || err}`);
      } finally {
        setLoading(false);
      }
    } else {
      if (userId) {
        await handleCreateStripePaymentLink('seeker-pro');
        showSuccess("Redirecting to Stripe checkout...");
      } else { showError("Please save your profile first"); }
    }
  };



  const convertToWebP = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas context not available');
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/webp');
        resolve(dataUrl);
        URL.revokeObjectURL(url);
      };
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const webpDataUrl = await convertToWebP(file);
      setPhotoPreview(webpDataUrl);
      setPhotoFile(file);
    } catch (err) {
      console.error('Image conversion failed', err);
      showError('Failed to convert image to WebP');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentor) return;
    setSaving(true);
    try {
      const specialties = specialtiesText.split(',').map(s => s.trim()).filter(Boolean);
      const payload: any = {
        specialties,
        bio: bioText,
        gradeLevel,
        directoryVisibility: visibility,
        lessons: lessonsText,
        title: titleText,
        awards: awardsText,
        photoUrl: photoPreview,
        socialLinks: socialLinksText,
        exportConsent
      };
      await updateMentorProfile(mentor.id, payload);
      showSuccess('Profile saved successfully');
      setSaveSuccess(true);
      setMentor({
        ...mentor,
        specialties,
        bio: bioText,
        gradeLevel,
        directoryVisibility: visibility,
        lessons: lessonsText,
        title: titleText,
        awards: awardsText,
        socialLinks: socialLinksText,
        exportConsent,
        photoUrl: photoPreview
      });
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      showError(`Failed to save changes: ${err?.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleStripeToggle = async () => {
    if (!mentor) return;
    const currentActive = mentor.subscriptionActive;
    const targetStatus = !currentActive;
    if (currentActive) {
      const confirmed = window.confirm('Are you sure you want to cancel your Mentor Pro subscription? You will revert to the Basic Free Tier (cannot upload premium resources, manage custom themes, or view visitor analytics).');
      if (!confirmed) return;
      // For cancellation, we still use the sync function as it just updates the status in our DB
      setLoading(true);
      try {
        await syncMentorTier(mentor.id, targetStatus ? 'pro' : 'basic');
        const updated = await getMentorByEmail(email);
        if (updated) {
          setMentor(updated);
          setVisibility(updated.directoryVisibility);
          setLessonsText(updated.lessons || '');
          localStorage.setItem('LOGGED_IN_USER', JSON.stringify({ email: updated.email, role: 'mentor', subscriptionActive: targetStatus, id: updated.id }));
        }
        alert(`Mentor Pro subscription ${targetStatus ? 'activated' : 'cancelled'}.`);
      } catch (err: any) {
        console.error(err);
        alert(`Failed to cancel subscription: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    } else {
      const confirmed = window.confirm('Proceed to create Stripe Checkout for Mentor Pro ($19.99/month)?');
      if (!confirmed) return;
      await handleCreateStripePaymentLink('mentor-pro');
      // Note: The actual subscription activation will happen after successful payment
      // via webhook or redirect handling, which would need to be implemented separately
      showSuccess("Redirecting to Stripe checkout...");
    }
  };

  const handleApproveClaim = async (alertObj: AdminAlert) => {
    const match = alertObj.description.match(/\b(rec[a-zA-Z0-9]+)\b/) || alertObj.description.match(/ID:?\s*([a-zA-Z0-9]+)/i) || alertObj.description.match(/mentor ID (\S+)/);
    if (!match) {
      alert("Could not identify mentor ID in claim description.");
      return;
    }
    const mentorId = match[1];
    setLoading(true);
    try {
      await approveClaim(mentorId, alertObj.id);
      alert("Claim request approved successfully! Teacher verified.");
      await fetchAlerts();
    } catch (e: any) {
      console.error(e);
      alert(`Failed to approve claim: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    setLoading(true);
    try {
      await resolveAlert(alertId);
      alert("Alert marked as resolved.");
      await fetchAlerts();
    } catch (e: any) {
      console.error(e);
      alert(`Failed to resolve alert: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-white/20">
      <div className="p-8 border-b border-waldorf-secondary-container/30 bg-white/40 flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-serif text-waldorf-primary mb-1 font-semibold">
            {viewMode === 'admin' 
              ? "Nina's Back-office" 
              : viewMode === 'seeker' 
                ? "Seeker Dashboard" 
                : viewMode === 'mentor' 
                  ? "Guide Workspace" 
                  : "Welcome to The Waldorf Path"}
          </h2>
          <p className="text-base text-waldorf-outline italic">
            {viewMode === 'admin' 
              ? "Approve claims and inspect message logs in the System Admin table" 
              : viewMode === 'seeker'
                ? "Manage your Premium subscription and access premium resources"
                : viewMode === 'mentor'
                  ? "Update specialties, upload community resources, and manage Pro features"
                  : "Sign in to manage your Waldorf guide profile or subscription"}
          </p>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {viewMode === 'login' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="watercolor-card p-8 max-w-md mx-auto mt-8 space-y-6"
          >
            <div className="text-center">
              <Shield className="mx-auto text-waldorf-secondary mb-3" size={40} />
              <h3 className="font-serif text-xl text-waldorf-primary font-semibold">Enter the Waldorf Path</h3>
              <p className="text-xs text-waldorf-outline mt-2 leading-relaxed font-sans">
                {loginRole === 'user' 
                  ? "🌿 Welcome, Parents & Educators! Sign in to browse mentors, access resources, and connect with Waldorf specialists." 
                  : "🌻 Welcome, Waldorf Guides & Mentors! Claim or sign in to your profile workspace to customize your listing, share resources, and connect with families."}
              </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="flex border-b border-waldorf-outline/25 pb-1 justify-around gap-2 font-sans">
              <button 
                type="button"
                onClick={() => { setLoginRole('seeker'); setErrorMsg(''); }}
                className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none bg-transparent ${
                  loginRole === 'user' 
                    ? 'text-waldorf-primary border-b-2 border-waldorf-primary font-bold' 
                    : 'text-waldorf-outline hover:text-waldorf-primary'
                }`}
              >
                Parents & Educators
              </button>
              <button 
                type="button"
                onClick={() => { setLoginRole('mentor'); setErrorMsg(''); }}
                className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none bg-transparent ${
                  loginRole === 'mentor' 
                    ? 'text-waldorf-primary border-b-2 border-waldorf-primary font-bold' 
                    : 'text-waldorf-outline hover:text-waldorf-primary'
                }`}
              >
                Guides & Mentors
              </button>
              {(window.location.pathname === '/admin' || new URLSearchParams(window.location.search).get('view') === 'admin' || loginRole === 'admin') && (
                <button 
                  type="button"
                  onClick={() => { setLoginRole('admin' as any); setErrorMsg(''); }}
                  className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none bg-transparent ${
                    loginRole === 'admin' 
                      ? 'text-waldorf-primary border-b-2 border-waldorf-primary font-bold' 
                      : 'text-waldorf-outline hover:text-waldorf-primary'
                  }`}
                >
                  System Admin
                </button>
              )}
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginRole === ('admin' as any) ? (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">
                      Admin Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-waldorf-outline" size={16} />
                      <input 
                        type="email" 
                        placeholder="admin@thewaldorfpath.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-lazure-rose/50 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">
                      Admin Password
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 text-waldorf-outline" size={16} />
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-lazure-rose/50 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <button 
                      type="button"
                      onClick={handleAdminForgotPassword}
                      className="text-xs font-bold text-waldorf-secondary hover:underline cursor-pointer border-none bg-transparent"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {isSignUp && loginRole === 'mentor' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 text-waldorf-outline" size={16} />
                        <input 
                          type="text" 
                          placeholder="e.g. Sariah Moon"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-lazure-rose/50 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">
                      {loginRole === 'user' ? 'Email Address' : 'Registered / Claim Email'}
                    </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-waldorf-outline" size={16} />
                  <input 
                    type="email" 
                    placeholder={loginRole === 'user' ? 'parent@example.com' : 'teacher@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-lazure-rose/50 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
                  />
                </div>
              </div>
              {errorMsg && (
                <div className="text-xs text-waldorf-secondary bg-lazure-rose/40 px-3 py-2 rounded-xl border border-lazure-rose/50 flex gap-2 items-start font-sans">
                  <AlertTriangle className="shrink-0 mt-0.5" size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}
                  </>
              )}
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-waldorf-primary text-white text-sm font-bold rounded-xl hover:bg-waldorf-primary/95 transition-all shadow-md disabled:opacity-50 cursor-pointer font-sans border-none"
              >
                {loading ? "Verifying..." : loginRole === ('admin' as any) ? "Enter Admin Dashboard" : isSignUp ? "Sign Up & Register" : loginRole === 'user' ? "Enter Seeker Hub" : "Enter Guide Workspace"}
              </button>
            </form>
            {loginRole !== ('admin' as any) && (
              <div className="text-center mt-4 font-sans">
                <button 
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
                  className="text-xs font-bold text-waldorf-secondary hover:underline cursor-pointer border-none bg-transparent"
                >
                  {isSignUp ? "Already have an account? Sign In" : "Need to register? Sign Up"}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {viewMode === 'sales_gate' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="watercolor-card p-8 max-w-xl mx-auto space-y-6 bg-white/90 border border-gold/30 rounded-3xl text-center font-sans animate-fadeIn"
          >
            <div className="w-16 h-16 rounded-full bg-[#fdf0d0] text-[#7a4f1a] flex items-center justify-center mx-auto text-2xl">🌟</div>
            <h3 className="font-serif text-3xl text-waldorf-primary font-bold">Nourish Your Journey</h3>
            
            {loginRole === 'user' ? (
              <div className="space-y-4 text-left font-sans">
                <p className="text-sm text-ink-soft leading-relaxed font-sans">
                  Unlock the full Waldorf resource ecosystem! Upgrade to <strong>Waldorf Premium</strong> today for just <strong>$9.99/month</strong>:
                </p>
<ul className="space-y-2.5 text-xs text-ink-soft pl-4 list-disc font-semibold font-sans">
  <li><strong>Instant Access to Premium Resources</strong>: Download our complete library of hand-crafted seasonal rhythms, lesson plans, and teaching materials - all designed by experienced Waldorf educators.</li>
  <li><strong>Enrich Your Teaching & Parenting</strong>: Access specialized materials including pentatonic music notation, storytelling collections, and grade-specific curriculum guides that bring Waldorf principles to life.</li>
  <li><strong>Support Authentic Waldorf Education</strong>: Your subscription directly supports the creation and preservation of genuine Waldorf educational resources by our global community of educators.</li>
  <li><strong>Save Time & Money</strong>: Get ready-to-use, professionally developed materials that would take countless hours to create yourself - all for less than the cost of a single specialty book per month.</li>
</ul>
                <div className="border-t border-border/30 my-4 font-sans" />
                <div className="flex flex-col gap-3 font-sans">
                  <button 
                    onClick={async () => {
                      const confirmed = window.confirm("Proceed to simulated Stripe Checkout for Waldorf Premium ($9.99/month)?");
                      if (confirmed) {
                        setLoading(true);
                        try {
                          setUserSubscribed(true);
                          localStorage.setItem('LOGGED_IN_USER', JSON.stringify({ email: userEmail, role: 'user', subscriptionActive: true, id: userId }));
                          showSuccess("Waldorf Premium activated!");
                          setViewMode('seeker');
                        } catch (err: any) {
                          showError(`Subscription failed: ${err.message}`);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                    className="w-full py-3 bg-[#d4a84b] hover:bg-[#b8943f] text-white font-bold rounded-xl transition-all shadow-md font-sans text-sm cursor-pointer border-none animate-pulse"
                  >
                    Upgrade to Waldorf Premium ($9.99/mo)
                  </button>
                  <button 
                    onClick={() => setViewMode('seeker')}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-ink-soft font-bold rounded-xl transition-all font-sans text-xs cursor-pointer border-none"
                  >
                    Continue with Free Access
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-left font-sans">
                <p className="text-sm text-ink-soft leading-relaxed font-sans">
                  Maximize your reach and guidance impact! Upgrade to <strong>Mentor Pro</strong> or <strong>Featured Guide</strong>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                  <div className="p-4 bg-[#fdfaf2] border border-[#d4a84b]/30 rounded-2xl font-sans">
                    <h4 className="font-serif text-sm font-bold text-[#7a4f1a] mb-1">Mentor Pro ($19.99/mo)</h4>
                    <p className="text-[11px] text-ink-soft leading-relaxed font-sans">Transform your practice with professional analytics, personalized branding, and monetization tools that help you reach more families and grow your Waldorf educational impact.</p>
                  </div>
                  <div className="p-4 bg-[#edf2f8] border border-[#b0c4d8]/30 rounded-2xl font-sans">
                    <h4 className="font-serif text-sm font-bold text-[#2c4a6e] mb-1">Featured Upgrade ($10/mo)</h4>
                    <p className="text-[11px] text-ink-soft leading-relaxed font-sans">Get top-of-directory pinning, gold badge highlights, custom promo cards, and prioritised AI Concierge placement.</p>
                  </div>
                </div>
                <div className="border-t border-border/30 my-4 font-sans" />
                <div className="flex flex-col gap-3 font-sans">
                  <button 
                    onClick={async () => {
                      const confirmed = window.confirm("Proceed to simulated Stripe Checkout for Mentor Pro ($19.99/month)?");
                      if (confirmed) {
                        setLoading(true);
                        try {
                          await syncMentorTier(mentor!.id, 'pro');
                          const updated = await getMentorByEmail(email);
                          if (updated) {
                            setMentor(updated);
                            localStorage.setItem('LOGGED_IN_USER', JSON.stringify({ email: updated.email, role: 'mentor', subscriptionActive: true, id: updated.id }));
                          }
                          showSuccess("Mentor Pro activated!");
                          setViewMode('mentor');
                        } catch (err: any) {
                          showError(`Subscription failed: ${err.message}`);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                    className="w-full py-3 bg-waldorf-primary hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-md font-sans text-sm cursor-pointer border-none"
                  >
Upgrade to Mentor Pro ($19.99/mo)
                  </button>
                  <button 
                    onClick={() => setViewMode('mentor')}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-ink-soft font-bold rounded-xl transition-all font-sans text-xs cursor-pointer border-none"
                  >
                    Continue with Free Listing
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {viewMode === 'seeker' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Seeker Status Card */}
            <div className="watercolor-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-sage/15 border border-sage/30 flex items-center justify-center shrink-0 text-sage">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-waldorf-primary font-bold">Seeker Account</h3>
                  <p className="text-xs text-waldorf-outline uppercase tracking-wider mt-0.5 font-sans">{userEmail}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-300 transition-all cursor-pointer border-none font-sans font-semibold"
              >
                Sign Out
              </button>
            </div>

            {/* Seeker Subscription Card */}
            <div className="watercolor-card p-6 bg-white/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1 font-sans">
                <h4 className="font-serif text-lg text-waldorf-primary font-bold">Account Membership</h4>
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-xs font-bold text-waldorf-outline font-sans">Current Tier:</span>
                  {userSubscribed ? (
                    <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1 font-sans">
                      <CheckCircle size={10} /> Premium Active ($9.99/mo)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-lazure-rose text-waldorf-secondary text-xs font-bold rounded-full border border-lazure-rose/40 flex items-center gap-1 font-sans">
                      <AlertTriangle size={10} /> Free Member Tier
                    </span>
                  )}
                </div>
              </div>

              {userSubscribed ? (
                <button
                  type="button"
                  onClick={handleUserStripeToggle}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-300 transition-all cursor-pointer border-none font-sans"
                >
                  Cancel Subscription
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSeekerUpgradeModal(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-waldorf-secondary text-white text-xs font-bold rounded-xl hover:bg-waldorf-secondary/95 transition-all shadow-md cursor-pointer border-none font-sans"
                >
                  <CreditCard size={12} /> Learn More & Upgrade ($13.99/mo)
                </button>
              )}
            </div>

            {/* Access Callout */}
            <div className="watercolor-card p-6 bg-white/70 space-y-4">
              <h4 className="font-serif text-lg text-waldorf-primary font-bold">🌿 Start Exploring</h4>
              <p className="text-xs text-waldorf-outline leading-relaxed font-sans">
                {userSubscribed 
                  ? "✓ Your Premium membership is active! Head over to the Resources tab to browse and download all premium materials without locks." 
                  : "You are currently on the Free plan. You can view all listings and free resources. Upgrade to Premium to access all premium resources and contact mentors."}
              </p>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    const event = new CustomEvent('navigate-view', { detail: 'resources' });
                    window.dispatchEvent(event);
                  }}
                  className="px-4 py-2 bg-waldorf-primary text-white text-xs font-bold rounded-xl hover:bg-waldorf-primary/95 transition-all cursor-pointer border-none font-sans"
                >
                  Browse Resource Hub
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    const event = new CustomEvent('navigate-view', { detail: 'directory' });
                    window.dispatchEvent(event);
                  }}
                  className="px-4 py-2 bg-white border border-border text-ink-soft hover:bg-gray-50 text-xs font-bold rounded-xl transition-all cursor-pointer font-sans"
                >
                  Explore Mentors
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'mentor' && mentor && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Account Status Card */}
            <div className="watercolor-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-lazure-rose/50 shrink-0">
                  {mentor.status === 'Pending' || mentor.status === 'Unclaimed' || !mentor.subscriptionActive ? (
                    <svg viewBox="0 0 100 100" className="w-full h-full bg-[#fdfaf2] p-1.5 text-sage" aria-hidden="true">
                      <defs>
                        <radialGradient id="waterGradProfile" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#f7f9f5" stopOpacity="1" />
                          <stop offset="50%" stopColor="#eaf2e3" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#dcecd0" stopOpacity="0.1" />
                        </radialGradient>
                      </defs>
                      <circle cx="50" cy="50" r="40" fill="url(#waterGradProfile)" />
                      <path d="M50 30 C40 30 32 38 32 48 C32 60 50 74 50 74 C50 74 68 60 68 48 C68 38 60 30 50 30 Z" fill="none" stroke="#7a8c6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="50" cy="48" r="6" fill="#7a8c6e" />
                    </svg>
                  ) : (
                    <img src={mentor.photoUrl} alt={mentor.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-xl text-waldorf-primary font-bold">{mentor.name}</h3>
                  <p className="text-xs text-waldorf-outline uppercase tracking-wider mt-0.5">{mentor.location} • Status: {mentor.status}</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-4 shrink-0 w-full md:w-auto font-sans">
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 font-sans">
                    <span className="text-xs font-bold text-waldorf-outline">Membership Tier:</span>
                    {mentor.subscriptionActive ? (
                      <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1 font-sans">
                        <CheckCircle size={10} /> Mentor Pro Active ($19.99/mo)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-lazure-rose text-waldorf-secondary text-xs font-bold rounded-full border border-lazure-rose/40 flex items-center gap-1 font-sans">
                        <AlertTriangle size={10} /> Basic Free
                      </span>
                    )}
                  </div>
                  {mentor.subscriptionActive ? (
                    <button
                      type="button"
                      onClick={handleStripeToggle}
                      disabled={loading}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-300 transition-all cursor-pointer border-none font-sans w-full text-center"
                    >
                      Cancel Pro Subscription
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowMentorProUpgradeModal(true)}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-waldorf-secondary text-white text-xs font-bold rounded-lg hover:bg-waldorf-secondary/95 transition-all shadow-sm w-full cursor-pointer border-none font-sans"
                    >
                      <CreditCard size={12} /> Learn More & Upgrade ($19.99/mo)
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-300 transition-all cursor-pointer border-none font-sans w-full md:w-auto text-center"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Pro Performance Analytics Box */}
            <div className="relative overflow-hidden rounded-[28px] border border-waldorf-secondary-container/10">
              <div className={`p-6 bg-white/70 grid grid-cols-2 md:grid-cols-4 gap-4 ${!mentor.subscriptionActive ? 'blur-sm select-none pointer-events-none' : ''}`}>
                <div className="bg-white/90 p-4 rounded-2xl border border-lazure-rose/20 text-center font-sans">
                  <span className="text-[10px] text-waldorf-outline block uppercase tracking-wider font-bold">Profile Views</span>
                  <span className="font-serif text-3xl font-bold text-waldorf-primary block mt-1">148</span>
                  <span className="text-[9px] text-green-600 font-bold block mt-0.5">↑ +12% this month</span>
                </div>
                <div className="bg-white/90 p-4 rounded-2xl border border-lazure-rose/20 text-center font-sans">
                  <span className="text-[10px] text-waldorf-outline block uppercase tracking-wider font-bold">Guidance Enquiries</span>
                  <span className="font-serif text-3xl font-bold text-waldorf-primary block mt-1">
                    {alerts.filter(al => al.description.includes(mentor.id)).length + 2}
                  </span>
                  <span className="text-[9px] text-waldorf-outline block mt-0.5">Inbox total records</span>
                </div>
                <div className="bg-white/90 p-4 rounded-2xl border border-lazure-rose/20 text-center font-sans">
                  <span className="text-[10px] text-waldorf-outline block uppercase tracking-wider font-bold">Direct URL Shares</span>
                  <span className="font-serif text-3xl font-bold text-waldorf-primary block mt-1">34</span>
                  <span className="text-[9px] text-green-600 font-bold block mt-0.5">↑ +8% CTR</span>
                </div>
                <div className="bg-white/90 p-4 rounded-2xl border border-lazure-rose/20 text-center font-sans">
                  <span className="text-[10px] text-waldorf-outline block uppercase tracking-wider font-bold">Inquiry Click Rate</span>
                  <span className="font-serif text-3xl font-bold text-waldorf-primary block mt-1">9.2%</span>
                  <span className="text-[9px] text-green-600 font-bold block mt-0.5">High resonance</span>
                </div>
              </div>
              
              {!mentor.subscriptionActive && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <Shield size={28} className="text-waldorf-secondary mb-2" />
                  <h4 className="font-serif text-lg font-bold text-waldorf-primary">📈 Unlock Advanced Visitor Insights</h4>
                  <p className="text-xs text-waldorf-outline max-w-sm mt-1 leading-relaxed font-sans">
                    Upgrade to Mentor Pro ($19.99/mo) to trace your organic reach! Get full access to monthly profile page views, click-through rates, message inquires logs, and copy-link share counters. Step into your potential as a guide.
                  </p>
                  <button 
                    type="button" 
                    onClick={() => setShowMentorProUpgradeModal(true)}
                    className="mt-3 px-4 py-1.5 bg-waldorf-secondary text-white text-xs font-bold rounded-lg hover:opacity-90 shadow-sm border-none cursor-pointer font-sans"
                  >
                    Learn More & Upgrade
                  </button>
                </div>
              )}
            </div>

            {/* Share and Upgrade Triad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Share Listing Card */}
              <div className="watercolor-card p-6 bg-white/70 space-y-4">
                <h3 className="font-serif text-lg text-waldorf-primary font-bold flex items-center gap-1.5">
                  📢 Promote Your Listing
                </h3>
                <p className="text-xs text-waldorf-outline leading-relaxed">
                  Share your public profile link directly with your social media followers, newsletter subscribers, or school community:
                </p>
                <div className="bg-white p-3 rounded-xl border border-waldorf-secondary-container/20 flex justify-between items-center gap-2">
                  <span className="text-xs font-mono truncate text-waldorf-primary">
                    {`${window.location.origin}?mentorId=${mentor.id}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(`${window.location.origin}?mentorId=${mentor.id}`)}
                    className="px-3 py-1 bg-waldorf-secondary-container/50 border border-waldorf-secondary-container text-waldorf-secondary text-[10px] font-bold rounded-lg hover:bg-waldorf-secondary hover:text-white transition-all whitespace-nowrap cursor-pointer"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              {/* Upgrade Listing Card */}
              <div className="watercolor-card p-6 bg-white/70 flex flex-col justify-between gap-4 border-2 border-dashed border-[#d4a84b]/40">
                <div>
                  <h3 className="font-serif text-lg text-[#7a4f1a] font-bold flex items-center gap-1.5">
                    🚀 Featured Profile Upgrade
                  </h3>
                  <p className="text-xs text-waldorf-outline leading-relaxed mt-1">
                    Unlock gold badge highlighting, top-of-directory pinning, custom promotional cards, and prioritized Waldorf Concierge recommendations.
                  </p>
                </div>
                <div className="flex justify-between items-center gap-4 mt-1 font-sans">
                  <span className="text-xs font-bold text-waldorf-outline">
                    Status: {mentor.featuredActive ? (
                      <span className="text-green-600 font-bold">⭐ Featured Active</span>
                    ) : (
                      <span className="text-gray-500">Standard Tier</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpgradeModal(true);
                      setFeaturedPromoTitle(mentor.promoTitle || '');
                      setFeaturedPromoDesc(mentor.promoDescription || '');
                      setFeaturedPromoLink(mentor.promoLink || `${window.location.origin}?mentorId=${mentor.id}`);
                      setFeaturedPromoImage(mentor.promoImage || '');
                      setFeaturedPaymentSimulated(mentor.featuredActive || false);
                      setFeaturedPromoSubmitted(false);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-[#d4a84b] to-[#b8943f] text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-md transition-all cursor-pointer whitespace-nowrap border-none font-semibold font-sans"
                  >
                    {mentor.featuredActive ? 'Edit Promotion Info' : 'Upgrade to Featured ($10)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Branding Selector (Pro Lock) */}
            <div className="watercolor-card p-6 bg-white/70">
              {mentor.subscriptionActive ? (
                <div className="space-y-3 font-sans">
                  <h4 className="font-serif text-lg text-waldorf-primary font-bold flex items-center gap-1.5">
                    🎨 Profile Page Custom Branding
                  </h4>
                  <p className="text-xs text-waldorf-outline leading-relaxed">
                    Select a custom theme accent for your public profile card and details modal header:
                  </p>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">Branding Header style</label>
                    <select
                      value={selectedTheme}
                      onChange={e => handleSaveBranding(e.target.value)}
                      className="px-3 py-2 bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary text-xs text-waldorf-primary"
                    >
                      <option value="Classic">Classic Ivory (Default theme)</option>
                      <option value="Sunset">Sunset Watercolor (Warm pink-amber header)</option>
                      <option value="Forest">Forest Sage (Soft green border and header)</option>
                      <option value="Lavender">Lavender Dream (Lavender watercolor header)</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-sans">
                  <div className="space-y-1 max-w-md">
                    <h4 className="font-serif text-base text-waldorf-primary font-bold flex items-center gap-1.5">
                      🎨 Stand Out with Custom Branding Themes
                    </h4>
                    <p className="text-xs text-waldorf-outline leading-relaxed">
                      Transform your profile listing into a work of art. Upgrade to Mentor Pro ($19.99/mo) to personalize your directory card and details modal with gorgeous, hand-painted watercolor accents like <strong>Sunset Watercolor</strong>, <strong>Forest Sage</strong>, and <strong>Lavender Dream</strong>.
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowMentorProUpgradeModal(true)} 
                    className="px-3.5 py-2 bg-waldorf-secondary-container/50 text-waldorf-secondary text-xs font-bold rounded-lg border border-waldorf-secondary-container hover:bg-waldorf-secondary hover:text-white transition-all cursor-pointer whitespace-nowrap font-sans"
                  >
                    Learn More & Upgrade
                  </button>
                </div>
              )}
            </div>

            {/* Edit Profile Form */}
            <form onSubmit={handleSaveProfile} className="watercolor-card p-6 bg-white/60 space-y-4">
              <h3 className="font-serif text-lg text-waldorf-primary border-b border-waldorf-secondary-container/20 pb-2 mb-2">Edit Listing Fields</h3>

              {/* Title & Awards */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1">Title</label>
                  <input 
                    type="text"
                    value={titleText}
                    onChange={e => setTitleText(e.target.value)}
                    placeholder="Head of Music"
                    className="w-full px-4 py-2 text-sm bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1">Awards</label>
                  <input 
                    type="text"
                    value={awardsText}
                    onChange={e => setAwardsText(e.target.value)}
                    placeholder="Gold Medal, 2022"
                    className="w-full px-4 py-2 text-sm bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1">Profile Photo (WebP)</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="block w-full text-sm bg-white border border-lazure-rose/30 rounded-xl p-1" />
                {photoPreview && (
                  <img src={photoPreview} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-xl border border-waldorf-outline" />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1">Developmental Specialties (Comma separated)</label>
                <input 
                  type="text" 
                  value={specialtiesText}
                  onChange={(e) => setSpecialtiesText(e.target.value)}
                  required
                  placeholder="Eurythmy, Parent Coaching, Storytelling"
                  className="w-full px-4 py-2 text-sm bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1">Grade Level Expertise</label>
                  <input 
                    type="text" 
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    required
                    placeholder="Kindergarten - Grade 3"
                    className="w-full px-4 py-2 text-sm bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1">Directory Visibility</label>
                  <div className="flex items-center h-9 mt-1">
                    <input 
                      type="checkbox"
                      checked={visibility}
                      onChange={e => setVisibility(e.target.checked)}
                      className="w-4 h-4 text-waldorf-primary bg-white border-gray-300 rounded focus:ring-waldorf-primary"
                    />
                    <span className="ml-2 text-sm text-waldorf-outline">Visible in public directory (Free)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1">Bio</label>
                <textarea 
                  value={bioText}
                  onChange={e => setBioText(e.target.value)}
                  placeholder="Brief biography..."
                  className="w-full px-4 py-2 text-sm bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1">Lessons (optional)</label>
                <input 
                  type="text"
                  value={lessonsText}
                  onChange={e => setLessonsText(e.target.value)}
                  placeholder="Lesson titles..."
                  className="w-full px-4 py-2 text-sm bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1">Social Links (one per line)</label>
                <textarea
                  value={socialLinksText}
                  onChange={e => setSocialLinksText(e.target.value)}
                  placeholder="https://instagram.com/yourhandle
https://facebook.com/yourpage
https://linkedin.com/in/yourprofile"
                  className="w-full px-4 py-2 text-sm bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/40 border border-lazure-rose/20 rounded-xl">
                <input
                  type="checkbox"
                  id="exportConsent"
                  checked={exportConsent}
                  onChange={e => setExportConsent(e.target.checked)}
                  className="w-4 h-4 text-waldorf-primary bg-white border-gray-300 rounded focus:ring-waldorf-primary shrink-0"
                />
                <label htmlFor="exportConsent" className="text-xs text-waldorf-outline leading-snug cursor-pointer">
                  <span className="font-bold uppercase tracking-wider">Allow contact export</span> — I consent to my contact details (email, phone, address, website, social links) being included in the admin CSV export for outreach purposes (GDPR).
                </label>
              </div>

              <button 
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-waldorf-primary text-white text-sm font-bold rounded-xl hover:bg-waldorf-primary/90 transition-colors border-none cursor-pointer"
              >
                {saving ? <Save size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>

            {/* Resource Upload Form */}
            <ResourceUploadForm 
              subscriptionActive={mentor.subscriptionActive} 
              onOpenUpgradeModal={() => setShowMentorProUpgradeModal(true)}
              mentorId={mentor.id}
            />

            {/* Message Inbox */}
            <MessageInbox mentorId={mentor.id} />

          </motion.div>
        )}

        {viewMode === 'admin' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Admin Tabs */}
            <div className="flex border-b border-waldorf-secondary-container/20 pb-1 mb-4 gap-6">
              <button 
                onClick={() => setAdminTab('claims')}
                className={`px-3 py-2 font-serif font-bold text-base border-b-2 transition-all cursor-pointer border-none bg-transparent ${
                  adminTab === 'claims' 
                    ? 'border-waldorf-secondary text-waldorf-primary font-bold' 
                    : 'border-transparent text-waldorf-outline hover:text-waldorf-primary'
                }`}
              >
                Approvals & Claims
              </button>
              <button 
                onClick={() => setAdminTab('inquiries')}
                className={`px-3 py-2 font-serif font-bold text-base border-b-2 transition-all cursor-pointer border-none bg-transparent ${
                  adminTab === 'inquiries' 
                    ? 'border-waldorf-secondary text-waldorf-primary font-bold' 
                    : 'border-transparent text-waldorf-outline hover:text-waldorf-primary'
                }`}
              >
                Inquiries & Leads
              </button>
              <button 
                onClick={() => setAdminTab('settings')}
                className={`px-3 py-2 font-serif font-bold text-base border-b-2 transition-all cursor-pointer border-none bg-transparent ${
                  adminTab === 'settings' 
                    ? 'border-waldorf-secondary text-waldorf-primary font-bold' 
                    : 'border-transparent text-waldorf-outline hover:text-waldorf-primary'
                }`}
              >
                API Settings
              </button>
              <button 
                onClick={() => setAdminTab('sponsors_policies')}
                className={`px-3 py-2 font-serif font-bold text-base border-b-2 transition-all cursor-pointer border-none bg-transparent ${
                  adminTab === 'sponsors_policies' 
                    ? 'border-waldorf-secondary text-waldorf-primary font-bold' 
                    : 'border-transparent text-waldorf-outline hover:text-waldorf-primary'
                }`}
              >
                Sponsors & Policies
              </button>
              <button 
                onClick={() => setAdminTab('export')}
                className={`px-3 py-2 font-serif font-bold text-base border-b-2 transition-all cursor-pointer border-none bg-transparent ${
                  adminTab === 'export' 
                    ? 'border-waldorf-secondary text-waldorf-primary font-bold' 
                    : 'border-transparent text-waldorf-outline hover:text-waldorf-primary'
                }`}
              >
                Export Data
              </button>
              <button 
                onClick={() => setViewMode('login')}
                className="px-3 py-2 font-serif text-base text-gray-500 hover:text-waldorf-primary ml-auto border-none bg-transparent cursor-pointer font-bold"
              >
                Exit Admin
              </button>
            </div>

            {adminTab === 'settings' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="watercolor-card p-6 bg-white/60 space-y-4 max-w-lg"
              >
                <h3 className="font-serif text-2xl text-waldorf-primary font-bold">API Key Configurations</h3>
                <p className="text-xs text-waldorf-outline leading-relaxed font-sans">
                  Enter your custom API credentials below. Keys are saved to the server (Teable) for all users and also cached locally in your browser.
                </p>
                <div className="space-y-4 font-sans">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">Gemini API Key</label>
                    <input 
                      type="password" 
                      placeholder="AI GenAI Key (starts with AIza...)"
                      value={geminiKey}
                      onChange={e => setGeminiKey(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">OpenAI API Key</label>
                    <input 
                      type="password" 
                      placeholder="sk-proj-..."
                      value={openaiKey}
                      onChange={e => setOpenaiKey(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
                    />
                  </div>
                  <button 
                    onClick={async () => {
                      localStorage.setItem('GEMINI_API_KEY', geminiKey.trim());
                      localStorage.setItem('OPENAI_API_KEY', openaiKey.trim());
                      try {
                        const res = await fetch('/api/ai-config', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ geminiApiKey: geminiKey.trim(), openaiApiKey: openaiKey.trim() }),
                        });
                        if (!res.ok) throw new Error(await res.text());
                        showSuccess('API Keys saved to server and local storage!');
                      } catch (e: any) {
                        showError(`Saved locally, but server sync failed: ${e?.message || e}`);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-waldorf-primary text-white text-sm font-bold rounded-xl hover:bg-waldorf-primary/95 transition-all shadow-md cursor-pointer border-none"
                  >
                    <Save size={14} /> Save Keys
                  </button>

                  <hr className="border-border/30 my-4" />
                  
                  <h3 className="font-serif text-2xl text-waldorf-primary font-bold">System Admin Credentials</h3>
                  <p className="text-xs text-waldorf-outline leading-relaxed font-sans">
                    Update the credentials used to log in to Nina's back-office dashboard. These will sync directly with the Teable admin database table.
                  </p>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">Admin Email</label>
                    <input 
                      type="email" 
                      placeholder="admin@thewaldorfpath.com"
                      value={editAdminEmail}
                      onChange={e => setEditAdminEmail(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">Admin Password</label>
                    <input 
                      type="password" 
                      placeholder="Password"
                      value={editAdminPassword}
                      onChange={e => setEditAdminPassword(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
                    />
                  </div>
                  <button 
                    onClick={async () => {
                      if (!editAdminEmail.trim() || !editAdminPassword.trim()) {
                        showError("Email and Password are required.");
                        return;
                      }
                      setLoading(true);
                      try {
                        const targetId = activeAdminUser?.id || 'local-admin-seed';
                        await updateSystemAdmin(targetId, editAdminEmail.trim(), editAdminPassword.trim());
                        const admins = await getSystemAdmins();
                        if (admins && admins.length > 0) {
                          setActiveAdminUser(admins[0]);
                          setEditAdminEmail(admins[0].email);
                          setEditAdminPassword(admins[0].password || '');
                        }
                        showSuccess('Admin credentials updated successfully!');
                      } catch (err: any) {
                        showError(`Failed to update credentials: ${err?.message || err}`);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-waldorf-primary text-white text-sm font-bold rounded-xl hover:bg-waldorf-primary/95 transition-all shadow-md cursor-pointer border-none"
                  >
                    <Save size={14} /> Update Credentials
                  </button>
                </div>
              </motion.div>
            )}

            {adminTab === 'sponsors_policies' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Policies Editing Box */}
                <div className="watercolor-card p-6 bg-white/60 space-y-4">
                  <h3 className="font-serif text-2xl text-waldorf-primary font-bold">Edit Legal & Sponsorship Policies</h3>
                  <p className="text-sm text-waldorf-outline">Customize the pre-filled contents shown in the global footer modals.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">Privacy Policy Text</label>
                      <textarea
                        value={adminPrivacyText}
                        onChange={e => setAdminPrivacyText(e.target.value)}
                        rows={6}
                        className="w-full p-3 text-xs bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">Terms & Conditions Text</label>
                      <textarea
                        value={adminTermsText}
                        onChange={e => setAdminTermsText(e.target.value)}
                        rows={6}
                        className="w-full p-3 text-xs bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">Cookies Policy Text</label>
                      <textarea
                        value={adminCookiesText}
                        onChange={e => setAdminCookiesText(e.target.value)}
                        rows={6}
                        className="w-full p-3 text-xs bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">Become a Sponsor Info</label>
                      <textarea
                        value={adminSponsorText}
                        onChange={e => setAdminSponsorText(e.target.value)}
                        rows={6}
                        className="w-full p-3 text-xs bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary font-sans"
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      localStorage.setItem('SITE_POLICY_PRIVACY', adminPrivacyText);
                      localStorage.setItem('SITE_POLICY_TERMS', adminTermsText);
                      localStorage.setItem('SITE_POLICY_COOKIES', adminCookiesText);
                      localStorage.setItem('SITE_POLICY_SPONSOR', adminSponsorText);
                      showSuccess('Policy content saved successfully!');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-waldorf-primary text-white text-sm font-bold rounded-xl hover:bg-waldorf-primary/95 transition-all shadow-md cursor-pointer border-none font-sans"
                  >
                    <Save size={14} /> Save Policy Changes
                  </button>
                </div>

                {/* Manage Sponsors List */}
                <div className="watercolor-card p-6 bg-white/60 space-y-4">
                  <h3 className="font-serif text-2xl text-waldorf-primary font-bold">Manage Featured Sponsors Ticker</h3>
                  
                  {/* Add Sponsor Form */}
                  <form onSubmit={handleAddSponsorSubmit} className="bg-white/40 p-4 rounded-2xl border border-lazure-rose/20 space-y-3 font-sans">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-waldorf-secondary">Add New Sponsor Entry</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-waldorf-outline mb-0.5">Sponsor Brand Name</label>
                        <input type="text" value={newSponsorName} onChange={e => setNewSponsorName(e.target.value)} required placeholder="e.g. TeachingWaldorf" className="w-full px-3 py-1.5 text-xs bg-white border border-lazure-rose/25 rounded-lg outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-waldorf-outline mb-0.5">Direct Affiliate/Website Link</label>
                        <input type="url" value={newSponsorLink} onChange={e => setNewSponsorLink(e.target.value)} required placeholder="https://..." className="w-full px-3 py-1.5 text-xs bg-white border border-lazure-rose/25 rounded-lg outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-waldorf-outline mb-0.5">Logo URL (300 x 300px WebP)</label>
                        <input type="text" value={newSponsorLogo} onChange={e => setNewSponsorLogo(e.target.value)} required placeholder="https://..." className="w-full px-3 py-1.5 text-xs bg-white border border-lazure-rose/25 rounded-lg outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-waldorf-outline mb-0.5">Short Promo Description</label>
                        <input type="text" value={newSponsorDesc} onChange={e => setNewSponsorDesc(e.target.value)} required placeholder="e.g. Layout planners and Block booklets." className="w-full px-3 py-1.5 text-xs bg-white border border-lazure-rose/25 rounded-lg outline-none" />
                      </div>
                    </div>
                    <button type="submit" className="px-4 py-1.5 bg-waldorf-secondary text-white text-xs font-bold rounded-lg hover:opacity-90 shadow-sm border-none cursor-pointer">
                      + Add Sponsor Ticker Card
                    </button>
                  </form>

                  {/* Sponsors Listing Table */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-waldorf-outline">Active Sponsors list ({adminSponsors.length})</h4>
                    {adminSponsors.length > 0 ? (
                      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar font-sans">
                        {adminSponsors.map((sp, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-xl border border-lazure-rose/20 flex justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                              <img src={sp.logoUrl} alt={sp.name} className="w-8 h-8 rounded-full object-cover border border-border shrink-0" />
                              <div>
                                <p className="text-xs font-bold text-waldorf-primary">{sp.name}</p>
                                <p className="text-[10px] text-waldorf-outline leading-tight">{sp.description}</p>
                                <a href={sp.link} target="_blank" rel="noopener noreferrer" className="text-[9px] text-waldorf-secondary underline break-all">{sp.link}</a>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteSponsor(idx)}
                              className="p-1.5 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                              title="Delete Entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-waldorf-outline italic">No active sponsors configured. Falling back to default list.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {adminTab === 'export' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="watercolor-card p-6 bg-white/60 space-y-4 max-w-lg"
              >
                <h3 className="font-serif text-2xl text-waldorf-primary font-bold flex items-center gap-2">
                  <FileSpreadsheet size={20} /> Export Data
                </h3>
                <p className="text-xs text-waldorf-outline leading-relaxed font-sans">
                  Download contact details and membership status for everyone in the database as CSV files,
                  ready for Excel or your CRM.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex rounded-xl bg-waldorf-secondary-container/30 p-1 gap-1">
                    {[
                      { id: 'mentors' as const, label: 'Mentors' },
                      { id: 'accounts' as const, label: 'Users & Parents' },
                      { id: 'all' as const, label: 'Everyone' },
                    ].map(opt => (
                      <button key={opt.id} onClick={() => setExportType(opt.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-none ${
                          exportType === opt.id
                            ? 'bg-waldorf-primary text-white shadow-sm'
                            : 'text-waldorf-outline hover:text-waldorf-primary'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleExportCsv} disabled={exporting}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-waldorf-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none">
                    {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    {exporting ? 'Preparing...' : 'Download CSV'}
                  </button>
                </div>

                <label className="flex items-center gap-2 text-xs text-waldorf-outline cursor-pointer select-none">
                  <input type="checkbox" checked={onlyConsented} onChange={e => setOnlyConsented(e.target.checked)} className="w-4 h-4 rounded border-waldorf-secondary-container/40 text-waldorf-primary focus:ring-waldorf-primary" />
                  Only export mentors who consented (GDPR)
                </label>

                <div className="rounded-xl bg-white border border-waldorf-secondary-container/40 p-4 space-y-1.5">
                  <p className="text-xs font-bold text-waldorf-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Database size={13} /> What's included
                  </p>
                  <p className="text-xs text-waldorf-outline font-sans leading-relaxed">
                    <strong>Mentors:</strong> name, claim & contact email, phone, address, website, social links, location,
                    specialty, grade level, languages, support modes, claim status, membership & billing tier,
                    featured/publish status, visibility, credential review, export consent, data source.
                  </p>
                  <p className="text-xs text-waldorf-outline font-sans leading-relaxed">
                    <strong>Users & Parents:</strong> email, display name, roles, billing status, account status, registration dates.
                  </p>
                  <p className="text-[10px] text-waldorf-outline/70 italic font-sans">
                    Selecting "Everyone" downloads both files. Exports pull live data from the Teable database.
                  </p>
                </div>
              </motion.div>
            )}

            {(adminTab === 'claims' || adminTab === 'inquiries') && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl text-waldorf-primary font-bold">
                  {adminTab === 'claims' ? 'Profile Claim Approvals' : 'System Inquiries & Leads'}
                </h3>
                
                {loadingAlerts ? (
                  <div className="text-center py-10 italic text-waldorf-outline text-base font-sans">
                    Querying admin logs from Teable...
                  </div>
                ) : (
                  (() => {
                    const filteredAlerts = alerts.filter(al => 
                      adminTab === 'claims' 
                        ? (al.alertType === 'New Mentor Claimed' || al.alertType === 'Unclaimed Lead Routed')
                        : (al.alertType !== 'New Mentor Claimed' && al.alertType !== 'Unclaimed Lead Routed')
                    );

                    return filteredAlerts.length > 0 ? (
                      filteredAlerts.map((al) => (
                        <div 
                          key={al.id} 
                          className={`watercolor-card p-6 border flex justify-between items-start gap-4 transition-all ${
                            al.status === 'Resolved' ? 'bg-white/40 opacity-70 border-white/20' : 'bg-white/70 border-lazure-rose'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                                al.alertType === 'New Mentor Claimed' || al.alertType === 'Unclaimed Lead Routed'
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {al.alertType}
                              </span>
                              <span className="text-xs text-waldorf-outline">
                                {new Date(al.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm md:text-base font-medium text-waldorf-ink leading-relaxed font-serif">
                              {formatAlertDescription(al.description, mentorsList)}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs font-sans">
                              <span className="text-waldorf-outline font-semibold">Status:</span>
                              <span className={`font-bold ${al.status === 'Resolved' ? 'text-green-600' : 'text-amber-600'}`}>
                                {al.status}
                              </span>
                            </div>
                          </div>

                          {al.status === 'Open' && (
                            <div className="shrink-0 flex flex-col gap-2">
                              {al.alertType === 'New Mentor Claimed' ? (
                                <>
                                  <button
                                    onClick={async () => {
                                      await handleApproveClaim(al);
                                      const claim = parseClaimAlert(al.description);
                                      setActiveDraft({
                                        type: 'approval',
                                        mentorName: claim.mentorName,
                                        mentorEmail: claim.mentorEmail
                                      });
                                    }}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-all shadow-sm cursor-pointer w-full border-none font-sans"
                                  >
                                    <Check size={12} /> Approve Claim
                                  </button>
                                  <button
                                    onClick={() => {
                                      const claim = parseClaimAlert(al.description);
                                      setActiveDraft({
                                        type: 'id_proof',
                                        mentorName: claim.mentorName,
                                        mentorEmail: claim.mentorEmail
                                      });
                                    }}
                                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-all shadow-sm cursor-pointer w-full animate-pulse border-none font-sans"
                                  >
                                    📧 Request ID Proof
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleResolveAlert(al.id)}
                                  disabled={loading}
                                  className="flex items-center gap-1.5 px-3.5 py-2 bg-waldorf-primary text-white text-xs font-bold rounded-xl hover:bg-waldorf-primary/95 transition-all shadow-sm cursor-pointer border-none font-sans"
                                >
                                  Mark Resolved
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-white/40 rounded-[28px] border border-white/20 p-8 text-waldorf-outline italic font-serif text-base">
                        No {adminTab === 'claims' ? 'claims' : 'inquiries'} found in Teable.
                      </div>
                    );
                  })()
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Email Draft Modal */}
        {activeDraft && (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white border border-waldorf-secondary-container/20 rounded-[32px] max-w-lg w-full p-8 shadow-2xl flex flex-col gap-6 text-sm text-waldorf-primary">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-2xl text-waldorf-primary font-bold">
                    {activeDraft.type === 'id_proof' ? 'Request Proof of ID Draft' : 'Welcome & Acceptance Email Draft'}
                  </h3>
                  <p className="text-xs text-waldorf-outline mt-1 font-sans">
                    Copy the email draft below to edit and send to the claimant.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveDraft(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-waldorf-outline cursor-pointer border-none bg-transparent"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-200 font-sans">
                <div>
                  <span className="text-[10px] font-bold text-waldorf-outline uppercase tracking-wider block">Recipient Email</span>
                  <span className="text-sm font-semibold">{activeDraft.mentorEmail || 'No email parsed'}</span>
                </div>
                <hr className="border-gray-200" />
                <div>
                  <span className="text-[10px] font-bold text-waldorf-outline uppercase tracking-wider block">Email Subject</span>
                  <span className="text-sm font-bold">
                    {activeDraft.type === 'id_proof' 
                      ? 'Action Required: Verifying your Claim on The Waldorf Path' 
                      : 'Welcome to The Waldorf Path! Your profile has been approved'}
                  </span>
                </div>
                <hr className="border-gray-200" />
                <div>
                  <span className="text-[10px] font-bold text-waldorf-outline uppercase tracking-wider block">Email Body</span>
                  <pre className="text-xs text-waldorf-primary mt-2 font-mono whitespace-pre-wrap leading-relaxed select-all">
                    {activeDraft.type === 'id_proof' 
                      ? `Dear ${activeDraft.mentorName},

Thank you for initiating a claim on your profile listing on The Waldorf Path.

To verify your identity and protect our directory members from unauthorized claims, please reply to this email with a confirmation of your association (such as a link to your school staff directory page, a business registration page, or a photo of your certificate/ID).

Once received, we will activate your profile workspace immediately.

Warmly,
Nina & The Waldorf Path Team` 
                      : `Dear ${activeDraft.mentorName},

We are delighted to welcome you to The Waldorf Path directory! Your profile claim has been verified and approved.

You can now log in directly to your profile workspace to customize your profile, update specialties, upload resource lessons, and toggle directory visibility.

Direct Login URL:
http://localhost:3005/?email=${activeDraft.mentorEmail}

We look forward to sharing your rhythms and resources with the Waldorf community.

Warmly,
Nina & The Waldorf Path Team`}
                  </pre>
                </div>
              </div>

              <div className="flex gap-4 font-sans">
                <button 
                  onClick={() => {
                    const subject = activeDraft.type === 'id_proof' 
                      ? 'Action Required: Verifying your Claim on The Waldorf Path' 
                      : 'Welcome to The Waldorf Path! Your profile has been approved';
                    const body = activeDraft.type === 'id_proof' 
                      ? `Dear ${activeDraft.mentorName},\n\nThank you for initiating a claim on your profile listing on The Waldorf Path.\n\nTo verify your identity and protect our directory members from unauthorized claims, please reply to this email with a brief confirmation of your association (such as a link to your school staff directory page, a business registration, or a photo of your certificate/ID).\n\nOnce received, we will activate your profile workspace immediately.\n\nWarmly,\nNina & The Waldorf Path Team` 
                      : `Dear ${activeDraft.mentorName},\n\nWe are delighted to welcome you to The Waldorf Path directory! Your profile claim has been verified and approved.\n\nYou can now log in directly to your profile workspace to customize your profile, update specialties, upload resource lessons, and toggle directory visibility.\n\nDirect Login URL:\nhttp://localhost:3005/?email=${activeDraft.mentorEmail}\n\nWe look forward to sharing your rhythms and resources with the Waldorf community.\n\nWarmly,\nNina & The Waldorf Path Team`;
                    handleCopyText(`Subject: ${subject}\n\n${body}`);
                  }}
                  className="flex-1 py-2.5 bg-waldorf-primary text-white text-xs font-bold rounded-xl hover:bg-waldorf-primary/95 transition-all shadow-md cursor-pointer text-center border-none"
                >
                  📋 Copy Email Draft
                </button>
                <button 
                  onClick={() => setActiveDraft(null)}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-300 transition-all cursor-pointer text-center border-none"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Featured Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white border border-[#d4a84b]/30 rounded-[32px] max-w-lg w-full p-8 shadow-2xl flex flex-col gap-6 text-sm text-waldorf-primary" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-2xl text-waldorf-primary font-bold">
                    🚀 Upgrade to Featured Profile
                  </h3>
                  <p className="text-xs text-waldorf-outline mt-1 font-sans">
                    Gain premium visibility to increase resonances with families and educators.
                  </p>
                </div>
                <button 
                  onClick={() => setShowUpgradeModal(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-waldorf-outline cursor-pointer border-none bg-transparent"
                >
                  <X size={18} />
                </button>
              </div>

              {!featuredPaymentSimulated ? (
                <div className="space-y-4">
                  <div className="bg-amber-50/50 border border-[#d4a84b]/30 p-5 rounded-2xl space-y-3">
                    <h4 className="font-bold text-sm text-[#7a4f1a] uppercase tracking-wider font-sans">Featured Benefits ($10/month)</h4>
                    <ul className="space-y-2 text-xs text-waldorf-primary list-disc pl-4 leading-relaxed font-sans">
                      <li><strong>Pinned Placement</strong>: Pinned to the very top of search queries and directory listings.</li>
                      <li><strong>⭐ Featured Guide Badge</strong>: Displayed with gold borders and a star badge on directory cards.</li>
                      <li><strong>Promotional Box</strong>: Showcase custom promotional titles, taglines, and direct redirect links.</li>
                      <li><strong>AI Recommendation Boost</strong>: The Waldorf Concierge AI will prioritize matches to your specialties.</li>
                    </ul>
                  </div>
                  <button
                    onClick={handleFeaturedStripeCheckout}
                    className="w-full py-3 bg-[#6772e5] hover:opacity-90 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans border-none"
                  >
                    <CreditCard size={14} /> Simulate Stripe Checkout ($10.00)
                  </button>
                </div>
              ) : !featuredPromoSubmitted ? (
                <form onSubmit={handleFeaturedPromoSubmit} className="space-y-4 font-sans">
                  <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl text-xs flex gap-2 items-start font-sans">
                    <span className="font-bold">✓</span>
                    <div>
                      <p className="font-bold">Upgrade Active / Payment Verified!</p>
                      <p className="mt-0.5 opacity-90 font-sans">Please fill out your featured promotional details below.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1">Promotional Highlight Title</label>
                      <input 
                        type="text" 
                        value={featuredPromoTitle} 
                        onChange={e => setFeaturedPromoTitle(e.target.value)} 
                        required 
                        placeholder="e.g. Summer Chalkboard Art Masterclass" 
                        className="w-full px-4 py-2 text-sm bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary text-waldorf-primary" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1">Direct Redirect Link</label>
                      <input 
                        type="url" 
                        value={featuredPromoLink} 
                        onChange={e => setFeaturedPromoLink(e.target.value)} 
                        required 
                        placeholder="e.g. Link to checkout, booking, or defaults to profile" 
                        className="w-full px-4 py-2 text-sm bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary text-waldorf-primary" 
                      />
                      <span className="text-[10px] text-waldorf-outline/80 mt-1 block leading-tight">
                        Defaults to your public path, but can overwrite to point to your website, booking page, etc.
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1">Featured Highlight Image (Logo Dimensions: 1200 x 600px WebP)</label>
                      <input 
                        type="text" 
                        value={featuredPromoImage} 
                        onChange={e => setFeaturedPromoImage(e.target.value)} 
                        placeholder="https://..." 
                        className="w-full px-4 py-2 text-sm bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary text-waldorf-primary" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1">Promotional Spotlight Description (Max 150 chars)</label>
                      <textarea 
                        value={featuredPromoDesc} 
                        onChange={e => setFeaturedPromoDesc(e.target.value)} 
                        required 
                        maxLength={150} 
                        placeholder="A short tagline or offer description..." 
                        rows={2}
                        className="w-full px-4 py-2 text-sm bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary text-waldorf-primary resize-none" 
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3 bg-gradient-to-r from-[#d4a84b] to-[#b8943f] text-white text-sm font-bold rounded-xl hover:opacity-90 shadow-md transition-all cursor-pointer border-none font-sans"
                    >
                      Save & Activate Promotion
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 bg-green-50 border border-green-100 text-green-700 rounded-2xl text-center space-y-3 font-sans">
                  <p className="text-sm font-bold">Featured Settings Saved!</p>
                  <p className="text-xs leading-relaxed opacity-90 font-sans">
                    Your guide highlight banner is active in search results, and details have been logged in the admin feed.
                  </p>
                  <button 
                    onClick={() => setShowUpgradeModal(false)} 
                    className="px-6 py-2 bg-green-600 text-white rounded-xl text-xs hover:bg-green-700 border-none cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Premium Upgrade Modal */}
        {showSeekerUpgradeModal && (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white border border-waldorf-secondary-container/20 rounded-[32px] max-w-lg w-full p-8 shadow-2xl flex flex-col gap-6 text-sm text-waldorf-primary" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-2xl text-waldorf-primary font-bold">
                    ✨ Upgrade to Waldorf Premium
                  </h3>
                  <p className="text-xs text-waldorf-outline mt-1 font-sans">
                    Nurture your family or classroom with premium resources.
                  </p>
                </div>
                <button 
                  onClick={() => setShowSeekerUpgradeModal(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-waldorf-outline cursor-pointer border-none bg-transparent"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-amber-50/50 border border-amber-200/30 p-5 rounded-2xl space-y-3">
                  <h4 className="font-bold text-sm text-[#7a4f1a] uppercase tracking-wider font-sans">Waldorf Premium Benefits ($9.99/month)</h4>
<ul className="space-y-2 text-xs text-waldorf-primary list-disc pl-4 leading-relaxed font-sans font-medium">
  <li><strong>Unlimited Premium Downloads</strong>: Instant access to our entire library of exclusive seasonal rhythms, lesson plans, handwork guides, and teaching resources - all downloadable for immediate use in your home or classroom.</li>
  <li><strong>Expert-Curated Resources</strong>: Carefully selected materials from master Waldorf educators worldwide, saving you countless hours of research and ensuring authentic, developmentally-appropriate content.</li>
  <li><strong>Community Support & Growth</strong>: Your subscription directly supports the maintenance and expansion of this Waldorf resource hub, ensuring these valuable teachings remain accessible to families and educators everywhere.</li>
</ul>
                </div>

                <button
                  onClick={() => {
                    setShowSeekerUpgradeModal(false);
                    handleUserStripeToggle();
                  }}
                  className="w-full py-3 bg-[#6772e5] hover:opacity-90 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans border-none"
                >
                  <CreditCard size={14} /> Get Waldorf Premium via Stripe ($9.99)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mentor Pro Upgrade Modal */}
        {showMentorProUpgradeModal && (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white border border-waldorf-secondary-container/20 rounded-[32px] max-w-lg w-full p-8 shadow-2xl flex flex-col gap-6 text-sm text-waldorf-primary" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-2xl text-waldorf-primary font-bold">
                    🚀 Upgrade to Mentor Pro
                  </h3>
                  <p className="text-xs text-waldorf-outline mt-1 font-sans">
                    Step into the spotlight and expand your mentorship practice.
                  </p>
                </div>
                <button 
                  onClick={() => setShowMentorProUpgradeModal(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-waldorf-outline cursor-pointer border-none bg-transparent"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-amber-50/50 border border-amber-200/30 p-5 rounded-2xl space-y-3">
                  <h4 className="font-bold text-sm text-[#7a4f1a] uppercase tracking-wider font-sans">Mentor Pro Benefits ($19.99/month)</h4>
<ul className="space-y-2 text-xs text-waldorf-primary list-disc pl-4 leading-relaxed font-sans font-medium">
  <li><strong>Professional Insights & Analytics</strong>: Gain deep visibility into your impact with comprehensive analytics tracking profile views, engagement metrics, and inquiry patterns - helping you refine your approach and reach more families seeking your expertise.</li>
  <li><strong>Personalized Branding</strong>: Stand out with beautiful, hand-crafted Watercolor themes (Sunset Watercolor, Forest Sage, Lavender Dream) that reflect your unique educational approach and attract your ideal clients.</li>
  <li><strong>Revenue Generation Tools</strong>: Monetize your expertise by selling your original Waldorf resources directly through integrated checkout links or creating exclusive content for subscribing families.</li>
  <li><strong>Priority Visibility & Reach</strong>: Receive preferential placement in search results and AI recommendations, ensuring families seeking guidance in your specialty find you first.</li>
</ul>
                </div>

                <button
onClick={async () => {
    setShowMentorProUpgradeModal(false);
    await handleCreateStripePaymentLink('mentor-pro');
  }}
                  className="w-full py-3 bg-[#6772e5] hover:opacity-90 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans border-none"
                >
                  <CreditCard size={14} /> Get Mentor Pro via Stripe ($19.99)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Monthly Stats Component
// -----------------------------------------------------------------------------
interface MonthlyStatsProps {
  mentorId: string;
}

function MonthlyStats({ mentorId }: MonthlyStatsProps) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCount = async () => {
    setLoading(true);
    try {
      const messages = await getMentorMessages(mentorId);
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const monthMsgs = messages.filter(m => {
        const d = new Date(m.timestamp);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      });
      setCount(monthMsgs.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
  }, [mentorId]);

  return (
    <div className="watercolor-card p-4 bg-white/70 flex items-center justify-between">
      <span className="text-waldorf-primary font-bold">Enquiries this month</span>
      <span className={`px-3 py-1 rounded-full ${count > 0 ? 'bg-waldorf-primary text-white font-bold' : 'bg-gray-200 text-gray-600'}`}>
        {loading ? '...' : count}
      </span>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Message Inbox Component (New API)
// -----------------------------------------------------------------------------
interface MessageInboxProps {
  mentorId: string;
}

function MessageInbox({ mentorId }: MessageInboxProps) {
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sendingReply, setSendingReply] = useState<string | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const msgs = await getMentorMessagesByMentorId(mentorId);
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [mentorId]);

  const handleReplyChange = (msgId: string, text: string) => {
    setReplyTexts(prev => ({ ...prev, [msgId]: text }));
  };

  const sendReply = async (msgId: string) => {
    const text = replyTexts[msgId];
    if (!text) return;
    setSendingReply(msgId);
    try {
      await replyToMentorMessage(msgId, text);
      setReplyTexts(prev => ({ ...prev, [msgId]: '' }));
      await loadMessages();
    } catch (e) {
      console.error(e);
    } finally {
      setSendingReply(null);
    }
  };

  const markAsRead = async (msgId: string, currentStatus: string) => {
    if (currentStatus === 'New') {
      await updateMentorMessageReadStatus(msgId, 'Read');
      await loadMessages();
    }
  };

  return (
    <div className="watercolor-card p-4 bg-white/60 space-y-4">
      <h4 className="font-serif text-lg text-waldorf-primary font-bold">Message Inbox</h4>
      {loading && <p className="text-sm text-waldorf-outline font-sans">Loading messages...</p>}
      {messages.length > 0 ? (
        messages.map(m => (
          <div key={m.id} className="border-b border-waldorf-outline/20 pb-2 space-y-1">
            <p className="text-xs text-waldorf-outline font-sans"><strong>{m.seekerName || 'Seeker'}</strong> ({m.seekerEmail}) – {new Date(m.createdAt).toLocaleDateString()}</p>
            <p className="text-base text-waldorf-primary font-serif italic">"{m.message}"</p>
            {m.reply && (
              <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-700 font-sans">
                <strong>Your Reply:</strong> {m.reply}
                {m.repliedAt && <span className="ml-2">({new Date(m.repliedAt).toLocaleDateString()})</span>}
              </div>
            )}
            <div className="flex gap-2 mt-2 items-center font-sans">
              {m.status === 'New' && (
                <button onClick={() => markAsRead(m.id, m.status)} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded cursor-pointer border-none">Mark Read</button>
              )}
              <input 
                type="text" 
                placeholder="Write a reply..." 
                value={replyTexts[m.id] || ''}
                onChange={e => handleReplyChange(m.id, e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-lazure-rose/30 rounded outline-none" 
              />
              <button onClick={() => sendReply(m.id)} disabled={sendingReply === m.id} className="px-3 py-1 bg-waldorf-primary text-white text-xs font-bold rounded cursor-pointer border-none disabled:opacity-50">{sendingReply === m.id ? 'Sending...' : 'Reply'}</button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-xs text-waldorf-outline italic font-serif">No messages received yet.</p>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Resource Upload Form Component (locked behind Mentor Pro)
// -----------------------------------------------------------------------------
interface ResourceUploadFormProps {
  subscriptionActive: boolean;
  onOpenUpgradeModal?: () => void;
  mentorId: string;
}

function ResourceUploadForm({ subscriptionActive, onOpenUpgradeModal, mentorId }: ResourceUploadFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Handwork');
  const [grade, setGrade] = useState('Kindergarten');
  
  // Custom access control state
  const [accessType, setAccessType] = useState<'free' | 'pro' | 'direct'>('free');
  const [fileLink, setFileLink] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const categories = ['Parenting', 'Development', 'Books', 'Handwork', 'Painting', 'Music', 'Rhythms', 'Geometry', 'Chalkboard Art', 'Nutrition', 'Biodynamics', 'Natural Dyeing'];
  const grades = ['Early Childhood', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7 - 8', 'High School', 'Adult', 'All Grades'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      showError('Resource Title is required.');
      return;
    }

    let finalLink = fileLink.trim();
    if (accessType === 'direct') {
      if (!externalUrl.trim()) {
        showError('Direct Purchase checkout URL is required.');
        return;
      }
      finalLink = 'direct:' + externalUrl.trim();
    } else {
      if (!fileLink.trim()) {
        showError('Document Link (URL) is required.');
        return;
      }
    }

    setUploading(true);
    try {
      await createResource({
        title,
        category,
        grade,
        fileLink: finalLink,
        isFree: accessType === 'free',
        mentorId: mentorId
      });
      showSuccess('Resource uploaded successfully!');
      setTitle('');
      setFileLink('');
      setExternalUrl('');
      setAccessType('free');
    } catch (err: any) {
      console.error(err);
      showError(`Upload failed: ${err?.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="watercolor-card p-6 bg-white/60 space-y-4 text-sm text-waldorf-primary animate-fadeIn mt-6">
      <h4 className="font-serif text-lg text-waldorf-primary border-b border-waldorf-secondary-container/20 pb-2 mb-2 flex items-center gap-2 font-bold">
        <Sparkles size={16} className="text-gold animate-pulse" />
        Upload New Lesson Resource
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">Resource Title</label>
          <input 
            type="text" 
            placeholder="e.g. Introduction to Two-Needle Knitting"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary transition-colors text-sm text-waldorf-primary font-sans"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="text-waldorf-primary font-sans">{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">Grade Target</label>
            <select
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary transition-colors text-sm text-waldorf-primary font-sans"
            >
              {grades.map(gr => (
                <option key={gr} value={gr} className="text-waldorf-primary font-sans">{gr}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">Access Tier</label>
          <select
            value={accessType}
            onChange={e => setAccessType(e.target.value as any)}
            disabled={!subscriptionActive}
            className="w-full px-3 py-2 bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary text-sm text-waldorf-primary font-sans"
          >
            <option value="free" className="font-sans">Free Access (Available to everyone)</option>
            <option value="pro" className="font-sans">🔒 Premium Lock (Requires $9.99/mo subscription to download)</option>
            <option value="direct" className="font-sans">🔒 Direct Purchase (Sell directly via your own checkout link)</option>
          </select>
          {!subscriptionActive && (
            <div className="text-xs text-[#7a4f1a] font-sans block mt-1.5 leading-relaxed font-semibold bg-amber-50/50 border border-amber-200/50 p-3 rounded-xl">
              🚀 <strong>Monetize Your Material & Build Exclusivity</strong>: Lock curriculum blocks behind subscriber tiers or set up direct Gumroad/PayPal sales links. Turn your lesson plans into an income stream while reaching thousands of seekers! 
              <button 
                type="button" 
                onClick={onOpenUpgradeModal} 
                className="ml-1 text-waldorf-secondary underline hover:opacity-80 font-bold border-none bg-transparent cursor-pointer font-sans inline"
              >
                Learn More & Upgrade
              </button>
            </div>
          )}
        </div>

        {accessType === 'direct' ? (
          <div className="space-y-2 animate-fadeIn font-sans">
            <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">Direct Purchase Checkout URL</label>
            <input 
              type="url" 
              placeholder="https://gumroad.com/l/your-lesson-plan"
              value={externalUrl}
              onChange={e => setExternalUrl(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
            />
            <div className="p-3.5 bg-amber-50/60 border border-amber-200/50 rounded-2xl text-xs text-[#7a4f1a] font-sans leading-relaxed flex gap-2">
              <span className="text-base font-semibold">⚠️</span>
              <div>
                <strong>Direct Settlement Notice</strong>: The Waldorf Path directory does not handle customer checkout transactions, hold client funds, or process fees. You must configure your own payment infrastructure (such as PayPal, Gumroad, BuyMeACoffee, or custom Stripe invoices) and paste your check-out redirect link above. Transactions are resolved directly with you.
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-waldorf-outline mb-1 font-sans">Document Link (PDF / File URL)</label>
            <input 
              type="text" 
              placeholder="e.g. https://dropbox.com/s/knitting-guide.pdf"
              value={fileLink}
              onChange={e => setFileLink(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white border border-lazure-rose/30 rounded-xl outline-none focus:border-waldorf-secondary transition-colors"
            />
          </div>
        )}

        <button 
          type="submit"
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 bg-waldorf-secondary text-white text-xs font-bold rounded-xl hover:bg-waldorf-secondary/90 transition-colors cursor-pointer border-none font-sans"
        >
          {uploading ? 'Publishing...' : 'Publish Resource'}
        </button>
      </form>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Blog Workspace Component (exclusively unlocked for Featured Mentors)
// -----------------------------------------------------------------------------
interface BlogWorkspaceProps {
  featuredActive: boolean;
  mentorId: string;
  mentorName: string;
  onOpenUpgradeModal: () => void;
}

function BlogWorkspace({ featuredActive, mentorId, mentorName, onOpenUpgradeModal }: BlogWorkspaceProps) {
  const [articles, setArticles] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`BLOG_ARTICLES_${mentorId}`);
      return raw ? JSON.parse(raw) : [];
    }
    return [];
  });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const newArt = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      author: mentorName,
      timestamp: new Date().toISOString()
    };
    const updated = [newArt, ...articles];
    setArticles(updated);
    localStorage.setItem(`BLOG_ARTICLES_${mentorId}`, JSON.stringify(updated));
    
    // Also save in a global list of blog posts so visitors can read them!
    const globalRaw = localStorage.getItem('GLOBAL_BLOG_ARTICLES') || '[]';
    const globalArts = JSON.parse(globalRaw);
    localStorage.setItem('GLOBAL_BLOG_ARTICLES', JSON.stringify([ { ...newArt, mentorId }, ...globalArts ]));
    
    setTitle('');
    setContent('');
    showSuccess("Blog article published successfully!");
  };

  const handleDeleteArticle = (id: string) => {
    const updated = articles.filter(a => a.id !== id);
    setArticles(updated);
    localStorage.setItem(`BLOG_ARTICLES_${mentorId}`, JSON.stringify(updated));

    const globalRaw = localStorage.getItem('GLOBAL_BLOG_ARTICLES') || '[]';
    const globalArts = JSON.parse(globalRaw).filter((a: any) => a.id !== id);
    localStorage.setItem('GLOBAL_BLOG_ARTICLES', JSON.stringify(globalArts));
    
    showSuccess("Article deleted.");
  };

  return (
    <div className="watercolor-card p-6 bg-white/60 space-y-6 relative overflow-hidden font-sans">
      <div className="flex justify-between items-center border-b border-waldorf-secondary-container/20 pb-2">
        <h4 className="font-serif text-lg text-waldorf-primary font-bold">Featured Blog Articles</h4>
        <span className="px-2 py-0.5 bg-gold-pale text-[#7a4f1a] text-[10px] font-bold rounded-full border border-gold uppercase tracking-wider font-sans">
          Featured Exclusive
        </span>
      </div>

      {!featuredActive ? (
        <div className="p-6 bg-amber-50/50 border border-amber-200/30 rounded-2xl text-center space-y-3 font-sans">
          <p className="text-sm font-semibold text-[#7a4f1a] leading-relaxed">
            📝 <strong>Unlock Blog Publishing</strong>: Share your pedagogical insights, seasonal storytelling, and class verses. Blog post creation is reserved exclusively for Featured Waldorf Guides.
          </p>
          <button
            type="button"
            onClick={onOpenUpgradeModal}
            className="px-4 py-2 bg-gradient-to-r from-[#d4a84b] to-[#b8943f] text-white text-xs font-bold rounded-xl hover:opacity-95 shadow-sm border-none cursor-pointer"
          >
            Upgrade to Featured Guide
          </button>
        </div>
      ) : (
        <div className="space-y-6 font-sans">
          {/* New Article Form */}
          <form onSubmit={handleCreateArticle} className="space-y-4 font-sans bg-white/40 p-4 rounded-2xl border border-lazure-rose/20">
            <h5 className="text-xs font-bold uppercase tracking-wider text-waldorf-secondary">Publish New Article</h5>
            <div>
              <label className="block text-[10px] font-bold uppercase text-waldorf-outline mb-0.5">Article Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                placeholder="e.g. Nurturing the Sanguine Child in Spring" 
                className="w-full px-3 py-1.5 text-xs bg-white border border-lazure-rose/25 rounded-lg outline-none" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-waldorf-outline mb-0.5">Content / Narrative</label>
              <textarea 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                required 
                rows={4}
                placeholder="Write your Waldorf reflections, verses, or educational advice here..." 
                className="w-full px-3 py-2 text-xs bg-white border border-lazure-rose/25 rounded-lg outline-none resize-none font-serif" 
              />
            </div>
            <button type="submit" className="px-4 py-1.5 bg-[#d4a84b] hover:opacity-90 text-white text-xs font-bold rounded-lg cursor-pointer border-none shadow-sm font-semibold">
              Publish Article
            </button>
          </form>

          {/* Manage Articles */}
          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-waldorf-outline">Your Published Articles ({articles.length})</h5>
            {articles.length > 0 ? (
              <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                {articles.map(art => (
                  <div key={art.id} className="bg-white p-3 rounded-xl border border-lazure-rose/15 flex justify-between items-start gap-4">
                    <div className="space-y-1 text-left">
                      <p className="text-sm font-bold text-waldorf-primary">{art.title}</p>
                      <p className="text-[10px] text-waldorf-outline">{new Date(art.timestamp).toLocaleDateString()} – Author: {art.author}</p>
                      <p className="text-xs text-ink-soft leading-relaxed line-clamp-2 mt-1 font-serif italic">"{art.content}"</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteArticle(art.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 border-none bg-transparent cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-waldorf-outline italic">No articles published yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
