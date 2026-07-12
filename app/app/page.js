'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, where, onSnapshot, getDoc, setDoc, serverTimestamp,
  runTransaction, increment
} from 'firebase/firestore';

// ── downscale image for AI scan (Vercel Functions cap request bodies at 4.5MB) ─
async function resizeImageForScan(file, maxDimension = 1600, quality = 0.8) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });
  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
  return { base64: resizedDataUrl.split(',')[1], mimeType: 'image/jpeg' };
}

// ── receipt image upload (Vercel Blob, via server route) ──────────────────────
async function uploadReceiptImage(file) {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/upload-receipt', { method: 'POST', body });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Image upload failed');
  return json.url;
}

// ── Module-level helpers ───────────────────────────────────────────────────────
function todayFn() { const d = new Date(); d.setHours(0,0,0,0); return d; }
function daysRemaining(expiryDateStr) {
  return Math.round((new Date(expiryDateStr+'T00:00:00') - todayFn()) / 86400000);
}
function getStatus(w) {
  const d = daysRemaining(w.expiryDate);
  if (d < 0) return 'expired';
  if (d <= 30) return 'expiring';
  return 'active';
}
function formatDate(s) {
  if (!s) return 'N/A';
  const [y,m,d] = s.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m)-1]} ${parseInt(d)}, ${y}`;
}
function formatPrice(p) {
  if (!p && p !== 0) return 'N/A';
  return '$' + parseFloat(p).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
}

// Generates a unique repeatable gradient from a string (name/email)
function avatarGradient(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 45 + (Math.abs(hash >> 8) % 70)) % 360;
  const angle = 135 + (Math.abs(hash >> 4) % 60);
  return `linear-gradient(${angle}deg, hsl(${h1},75%,45%), hsl(${h2},80%,58%))`;
}

// Avatar: shows Google photo if available, otherwise gradient + initial
function UserAvatar({ user, name, size = 24, fontSize = 11 }) {
  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={name}
        width={size} height={size}
        referrerPolicy="no-referrer"
        style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', flexShrink:0 }}
      />
    );
  }
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:avatarGradient(name || user?.email || '?'), display:'flex', alignItems:'center', justifyContent:'center', fontSize, fontWeight:800, color:'#fff', flexShrink:0 }}>
      {(name || user?.email || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function CategoryIcon({ cat }) {
  const p = { width:13, height:13, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:'1.8', strokeLinecap:'round', strokeLinejoin:'round' };
  switch(cat) {
    case 'Electronics': return <svg {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    case 'Appliances': return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'Automotive': return <svg {...p}><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="9" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>;
    case 'Footwear': return <svg {...p}><path d="M2 17v-3c0-1 .8-2 1.8-2 1.4 0 2.8-.7 3.7-1.8L9 7.5c.6-.8 1.8-.6 2.1.4L12 11h7c1.5 0 2 1 2 2v4"/><path d="M2 17h20v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><line x1="13" y1="14" x2="16" y2="14"/></svg>;
    case 'Clothing': return <svg {...p}><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>;
    case 'Tools': return <svg {...p}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
    case 'Furniture': return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
    case 'Sports': return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>;
    default: return <svg {...p}><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
  }
}

const EMPTY_FORM = { productName:'', brand:'', category:'', purchaseDate:'', expiryDate:'', price:'', retailer:'', serial:'', notes:'', receiptUrl:'', receiptBase64:'', receiptName:'' };

export default function AppPage() {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [warranties, setWarranties] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [currentView, setCurrentView] = useState('grid');
  const [isMobileView, setIsMobileView] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [notifPrefs, setNotifPrefs] = useState({ enabled: false, daysBefore: 30, channel: 'browser' });
  const [savingNotifPrefs, setSavingNotifPrefs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('expiry-asc');
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ name: '', password: '' });
  const [savingSettings, setSavingSettings] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [savingWarranty, setSavingWarranty] = useState(false);
  const [deletingWarranty, setDeletingWarranty] = useState(false);
  const [selectedDaysBefore, setSelectedDaysBefore] = useState(30);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [statValues, setStatValues] = useState({ total:0, active:0, expiring:0, expired:0 });
  const [bellRing, setBellRing] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // ── AI receipt scan ────────────────────────────────────────────────────────
  const [scanLoading, setScanLoading] = useState(false);
  const [scanMonthlyCount, setScanMonthlyCount] = useState(0);
  const SCAN_LIMIT = 3;       // Free plan limit

  // ── AI claim assistant ─────────────────────────────────────────────────────
  const [claimMonthlyCount, setClaimMonthlyCount] = useState(0);
  const CLAIM_LIMIT = 1;      // Free plan limit

  const WARRANTY_LIMIT = 5;   // Free plan limit
  const [showClaimPicker, setShowClaimPicker] = useState(false);
  const [claimPickerSearch, setClaimPickerSearch] = useState('');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimWarranty, setClaimWarranty] = useState(null);
  const [claimMessages, setClaimMessages] = useState([]);
  const [claimInput, setClaimInput] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);

  const [testingNotif, setTestingNotif] = useState(false);
  const [notifPermission, setNotifPermission] = useState('default');

  // ── Refs ───────────────────────────────────────────────────────────────────
  const userMenuRef = useRef(null);
  const loadedMonthKeyRef = useRef(new Date().toISOString().slice(0, 7));
  const toastTimerRef = useRef(null);
  const animTimers = useRef({});
  const statValuesRef = useRef({ total:0, active:0, expiring:0, expired:0 });
  const warrantiesRef = useRef([]);
  const notifPrefsRef = useRef({ enabled:false, daysBefore:30, channel:'browser' });
  const unsubWarrantiesRef = useRef(null);
  const isSigningOutRef = useRef(false);
  const claimScrollRef = useRef(null);

  useEffect(() => { statValuesRef.current = statValues; }, [statValues]);
  useEffect(() => { warrantiesRef.current = warranties; }, [warranties]);
  useEffect(() => { notifPrefsRef.current = notifPrefs; }, [notifPrefs]);
  useEffect(() => {
    if (claimScrollRef.current) {
      claimScrollRef.current.scrollTop = claimScrollRef.current.scrollHeight;
    }
  }, [claimMessages, claimLoading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const syncViewMode = (isMobile) => {
      setIsMobileView(isMobile);
      if (isMobile) setCurrentView('grid');
    };

    syncViewMode(mediaQuery.matches);
    const handleChange = (event) => syncViewMode(event.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };

  // ── Animated counters ──────────────────────────────────────────────────────
  const animCount = (key, target) => {
    if (animTimers.current[key]) clearInterval(animTimers.current[key]);
    const start = statValuesRef.current[key] || 0;
    if (start === target) return;
    const steps = 30;
    let step = 0;
    animTimers.current[key] = setInterval(() => {
      step++;
      const val = Math.round(start + (target - start) * (step / steps));
      setStatValues(prev => ({ ...prev, [key]: val }));
      if (step >= steps) {
        clearInterval(animTimers.current[key]);
        setStatValues(prev => ({ ...prev, [key]: target }));
      }
    }, 16);
  };

  const updateStats = (list) => {
    const total = list.length;
    const active = list.filter(w => getStatus(w) === 'active').length;
    const expiring = list.filter(w => getStatus(w) === 'expiring').length;
    const expired = list.filter(w => getStatus(w) === 'expired').length;
    animCount('total', total);
    animCount('active', active);
    animCount('expiring', expiring);
    animCount('expired', expired);
  };

  // ── Subscribe to warranties (real-time) ───────────────────────────────────
  const subscribeWarranties = (uid) => {
    if (unsubWarrantiesRef.current) unsubWarrantiesRef.current();
    const q = query(collection(db, 'warranties'), where('userId', '==', uid));
    unsubWarrantiesRef.current = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setWarranties(list);
        updateStats(list);
      },
      (err) => {
        console.error('Warranties listener error:', err);
        if (!isSigningOutRef.current) {
          showToast('Could not load warranties. Check Firestore rules.', 'error');
        }
      }
    );
  };

  // ── Auth state ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);
      // Load user profile from Firestore
      try {
        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setUserProfile(data);
          if (data.notificationPrefs) {
            const normalizedPrefs = {
              enabled: !!data.notificationPrefs.enabled,
              daysBefore: data.notificationPrefs.daysBefore || 30,
              channel: 'browser',
            };
            setNotifPrefs(normalizedPrefs);
            setSelectedDaysBefore(normalizedPrefs.daysBefore);
          }
          setSettingsForm({ name: data.name || user.displayName || '', password: '' });
          // Load this month's usage
          const monthKey = new Date().toISOString().slice(0, 7);
          setScanMonthlyCount(data.scanCounts?.[monthKey] || 0);
          setClaimMonthlyCount(data.claimCounts?.[monthKey] || 0);
        } else {
          // Create profile if not exists
          const newProfile = {
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            notificationPrefs: { enabled: false, daysBefore: 30, channel: 'browser' },
            createdAt: serverTimestamp()
          };
          await setDoc(profileRef, newProfile);
          setUserProfile(newProfile);
          setSettingsForm({ name: newProfile.name, password: '' });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
      try { subscribeWarranties(user.uid); } catch (err) { console.error('subscribeWarranties error:', err); }
      setLoading(false);
    });
    return () => {
      unsub();
      if (unsubWarrantiesRef.current) unsubWarrantiesRef.current();
    };
  }, []);

  // ── Click outside user menu ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    isSigningOutRef.current = true;
    if (unsubWarrantiesRef.current) {
      unsubWarrantiesRef.current();
      unsubWarrantiesRef.current = null;
    }
    await signOut(auth);
    router.push('/login');
  };

  // ── Receipt file select ────────────────────────────────────────────────────
  const handleReceiptSelect = (file) => {
    if (!file) return;
    setReceiptFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setReceiptPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null); // PDF, no preview
    }
  };

  const clearReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    setFormData(p => ({ ...p, receiptUrl: '', receiptType: '' }));
  };

  // ── AI receipt scan ────────────────────────────────────────────────────────
  const scanReceiptWithAI = async () => {
    if (!receiptFile) return;
    if (scanMonthlyCount >= SCAN_LIMIT) {
      setFormError(`Monthly scan limit reached (${SCAN_LIMIT} scans/month). Resets next month.`);
      return;
    }
    setScanLoading(true);
    setFormError('');
    try {
      const { base64, mimeType } = await resizeImageForScan(receiptFile);
      const idToken = await currentUser.getIdToken();
      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ image: base64, mimeType }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Scan failed');
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Scan failed');
      const d = json.data;
      // Auto-fill only empty fields
      setFormData(prev => ({
        ...prev,
        productName: prev.productName || d.productName || '',
        brand:       prev.brand       || d.brand       || '',
        purchaseDate:prev.purchaseDate|| d.purchaseDate || '',
        price:       prev.price       || d.price        || '',
        retailer:    prev.retailer    || d.retailer     || '',
        serial:      prev.serial      || d.serial       || '',
        category:    prev.category    || d.category     || '',
      }));
      // Save updated scan count to Firestore
      const monthKey = new Date().toISOString().slice(0, 7);
      const base = monthKey === loadedMonthKeyRef.current ? scanMonthlyCount : 0;
      if (monthKey !== loadedMonthKeyRef.current) {
        loadedMonthKeyRef.current = monthKey;
        setClaimMonthlyCount(0);
      }
      const newCount = base + 1;
      setScanMonthlyCount(newCount);
      await setDoc(doc(db, 'users', currentUser.uid), {
        scanCounts: { [monthKey]: newCount }
      }, { merge: true });
      showToast('Receipt scanned. Fields auto-filled.', 'success');
    } catch (err) {
      setFormError(`Scan failed: ${err.message}`);
    } finally {
      setScanLoading(false);
    }
  };

  // ── AI claim assistant ─────────────────────────────────────────────────────
  const openClaimModal = (w) => {
    setClaimWarranty(w);
    setClaimMessages([{
      role: 'assistant',
      content: `I'm here to help you file a warranty claim for your ${w.productName}${w.brand ? ` by ${w.brand}` : ''}.\n\nWhat issue are you experiencing with this product?`,
    }]);
    setClaimInput('');
    setShowClaimModal(true);
  };

  const sendClaimMessage = async () => {
    if (!claimInput.trim() || claimLoading || !claimWarranty) return;
    if (claimMonthlyCount >= CLAIM_LIMIT) return;
    const userMsg = { role: 'user', content: claimInput.trim() };
    const updated = [...claimMessages, userMsg];
    setClaimMessages(updated);
    setClaimInput('');
    setClaimLoading(true);
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch('/api/claim-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({
          messages: updated,
          warrantyContext: { ...claimWarranty, status: getStatus(claimWarranty) },
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      const json = await res.json();
      setClaimMessages(prev => [...prev, { role: 'assistant', content: json.message }]);
      // Save updated claim count to Firestore
      const monthKey = new Date().toISOString().slice(0, 7);
      const base = monthKey === loadedMonthKeyRef.current ? claimMonthlyCount : 0;
      if (monthKey !== loadedMonthKeyRef.current) {
        loadedMonthKeyRef.current = monthKey;
        setScanMonthlyCount(0);
      }
      const newCount = base + 1;
      setClaimMonthlyCount(newCount);
      await setDoc(doc(db, 'users', currentUser.uid), {
        claimCounts: { [monthKey]: newCount }
      }, { merge: true });
    } catch {
      setClaimMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I ran into an error. Please try again.' }]);
    } finally {
      setClaimLoading(false);
    }
  };

  // ── Save warranty ──────────────────────────────────────────────────────────
  const saveWarranty = async (e) => {
    e.preventDefault();
    if (!formData.productName.trim()) { setFormError('Product name is required.'); return; }
    if (!formData.expiryDate) { setFormError('Expiry date is required.'); return; }
    setFormError('');
    setSavingWarranty(true);
    try {
      let receiptUrl = formData.receiptUrl || '';
      let receiptType = formData.receiptType || '';

      // Upload receipt image via Vercel Blob
      if (receiptFile) {
        setUploadingReceipt(true);
        receiptUrl = await uploadReceiptImage(receiptFile);
        receiptType = 'image';
        setUploadingReceipt(false);
      }

      const payload = {
        productName: formData.productName,
        brand: formData.brand,
        category: formData.category,
        purchaseDate: formData.purchaseDate,
        expiryDate: formData.expiryDate,
        price: formData.price,
        retailer: formData.retailer,
        serial: formData.serial,
        notes: formData.notes,
        receiptUrl,
        receiptType,
        userId: currentUser.uid,
        updatedAt: serverTimestamp()
      };

      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000));
      if (editingId) {
        await Promise.race([updateDoc(doc(db, 'warranties', editingId), payload), timeout]);
        showToast('Warranty updated.', 'success');
      } else {
        if (warranties.length >= WARRANTY_LIMIT) {
          setFormError(`Free plan limit reached (${WARRANTY_LIMIT} warranties). Upgrade to add more.`);
          setSavingWarranty(false);
          return;
        }
        payload.createdAt = serverTimestamp();
        const userRef = doc(db, 'users', currentUser.uid);
        await Promise.race([
          runTransaction(db, async (tx) => {
            const userSnap = await tx.get(userRef);
            const currentCount = userSnap.exists() ? (userSnap.data().warrantyCount || 0) : 0;
            if (currentCount >= WARRANTY_LIMIT) {
              throw new Error(`Free plan limit reached (${WARRANTY_LIMIT} warranties).`);
            }
            const newWarrantyRef = doc(collection(db, 'warranties'));
            tx.set(newWarrantyRef, payload);
            tx.update(userRef, { warrantyCount: increment(1) });
          }),
          timeout,
        ]);
        showToast('Warranty added.', 'success');
      }
      setShowWarrantyModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);
      setReceiptFile(null);
      setReceiptPreview(null);
    } catch (err) {
      setUploadingReceipt(false);
      setFormError(err.message === 'timeout'
        ? 'Request timed out. Check your internet connection and Firestore rules.'
        : `Failed to save: ${err.code || err.message || 'unknown error'}`);
      console.error('saveWarranty error:', err);
    } finally {
      setSavingWarranty(false);
    }
  };

  // ── Delete warranty ────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setDeletingWarranty(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await runTransaction(db, async (tx) => {
        tx.delete(doc(db, 'warranties', pendingDeleteId));
        tx.update(userRef, { warrantyCount: increment(-1) });
      });
      showToast('Warranty deleted.', 'info');
      setShowDeleteModal(false);
      setPendingDeleteId(null);
      if (showViewModal) setShowViewModal(false);
    } catch (err) {
      showToast('Delete failed.', 'error');
      console.error(err);
    } finally {
      setDeletingWarranty(false);
    }
  };

  // ── Test browser notification ──────────────────────────────────────────────
  const sendTestNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('Browser notifications are not supported on this device.', 'error');
      return;
    }
    setTestingNotif(true);
    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
        setNotifPermission(permission);
      }
      if (permission === 'denied') {
        showToast('Notifications are blocked. Enable them in your browser settings.', 'error');
        return;
      }
      new Notification('Aegis: Test Notification', {
        body: 'Browser notifications are working correctly.',
        icon: '/favicon.png',
      });
    } finally {
      setTestingNotif(false);
    }
  };

  // ── Save notification prefs ────────────────────────────────────────────────
  const saveNotifPrefs = async () => {
    if (!currentUser || savingNotifPrefs) return;
    const prefs = { enabled: notifPrefs.enabled, daysBefore: selectedDaysBefore, channel: 'browser' };
    setSavingNotifPrefs(true);
    try {
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000));
      await Promise.race([
        setDoc(doc(db, 'users', currentUser.uid), { notificationPrefs: prefs }, { merge: true }),
        timeout
      ]);
      setNotifPrefs(prefs);

      if (prefs.enabled && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          showToast('Browser notification permission was not granted.', 'error');
        }
      }

      showToast('Notification preferences saved.', 'success');
      setBellRing(true);
      setTimeout(() => setBellRing(false), 1000);
      setShowNotifModal(false);
    } catch (err) {
      showToast(err.message === 'timeout'
        ? 'Request timed out. Check Firestore rules.'
        : `Failed to save: ${err.code || err.message || 'unknown error'}`, 'error');
      console.error('saveNotifPrefs error:', err);
    } finally {
      setSavingNotifPrefs(false);
    }
  };

  // ── Save settings ──────────────────────────────────────────────────────────
  const saveSettings = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingSettings(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), { name: settingsForm.name }, { merge: true });
      setUserProfile(prev => ({ ...prev, name: settingsForm.name }));
      showToast('Settings saved.', 'success');
      setShowSettingsModal(false);
    } catch (err) {
      showToast('Failed to save settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const getFiltered = () => {
    let list = [...warranties];
    if (currentFilter !== 'all') list = list.filter(w => getStatus(w) === currentFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(w =>
        (w.productName||'').toLowerCase().includes(q) ||
        (w.brand||'').toLowerCase().includes(q) ||
        (w.category||'').toLowerCase().includes(q) ||
        (w.retailer||'').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      switch (sortBy) {
        case 'expiry-asc': return new Date(a.expiryDate) - new Date(b.expiryDate);
        case 'expiry-desc': return new Date(b.expiryDate) - new Date(a.expiryDate);
        case 'name-asc': return (a.productName||'').localeCompare(b.productName||'');
        case 'name-desc': return (b.productName||'').localeCompare(a.productName||'');
        case 'purchase-desc': return new Date(b.purchaseDate||0) - new Date(a.purchaseDate||0);
        case 'price-desc': return (parseFloat(b.price)||0) - (parseFloat(a.price)||0);
        default: return 0;
      }
    });
    return list;
  };

  const filtered = getFiltered();
  const viewWarranty = warranties.find(w => w.id === viewId);
  const expiringCount = warranties.filter(w => getStatus(w) === 'expiring').length;

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ['Product','Brand','Category','Purchase Date','Expiry Date','Price','Retailer','Serial','Notes'];
    const rows = warranties.map(w => [
      w.productName, w.brand, w.category, w.purchaseDate, w.expiryDate,
      w.price, w.retailer, w.serial, w.notes
    ].map(v => `"${(v||'').replace(/"/g,'""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'aegis-warranties.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported.', 'success');
  };

  // ── Open edit modal ────────────────────────────────────────────────────────
  const openEdit = (w) => {
    setEditingId(w.id);
    setFormData({ ...EMPTY_FORM, ...w });
    setFormError('');
    setReceiptFile(null);
    // If there's an existing image receipt, show it as the preview
    setReceiptPreview(w.receiptType === 'image' && w.receiptUrl ? w.receiptUrl : null);
    setShowViewModal(false);
    setShowWarrantyModal(true);
  };

  // ── Status helpers ─────────────────────────────────────────────────────────
  const statusColor = { active: '#4ade80', expiring: '#f59e0b', expired: '#ef4444' };
  const statusBg = { active: 'rgba(74,222,128,0.08)', expiring: 'rgba(245,158,11,0.08)', expired: 'rgba(239,68,68,0.08)' };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background:'#080808', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="spinner-anim" style={{ width:32, height:32, border:'2px solid #1e1e1e', borderTopColor:'#fff', borderRadius:'50%' }}></div>
      </div>
    );
  }

  const displayName = userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const displayEmail = currentUser?.email || '';

  // ── Render grid card ───────────────────────────────────────────────────────
  const renderGridCard = (w) => {
    const status = getStatus(w);
    const days = daysRemaining(w.expiryDate);
    const sColor = statusColor[status];
    const sBg = statusBg[status];
    const progressPct = (() => {
      if (!w.purchaseDate) return 0;
      const total = new Date(w.expiryDate+'T00:00:00') - new Date(w.purchaseDate+'T00:00:00');
      const elapsed = todayFn() - new Date(w.purchaseDate+'T00:00:00');
      return Math.min(100, Math.max(0, Math.round((elapsed/total)*100)));
    })();
    return (
      <div key={w.id} className="warranty-card" onClick={() => { setViewId(w.id); setShowViewModal(true); }} style={{ cursor:'pointer', padding:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>

        {/* ── Card body ── */}
        <div style={{ padding:'20px 20px 16px', flex:1 }}>

          {/* Top: category tag left, status badge right */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'10px', marginBottom:'12px' }}>
            <div style={{ minWidth:0, flex:1 }}>
              {/* Category tag with icon */}
              {w.category && (
                <div style={{ display:'inline-flex', alignItems:'center', gap:'5px', background:'#161616', border:'1px solid #222', borderRadius:'6px', padding:'4px 9px', marginBottom:'9px', color:'#666', fontSize:'11px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  <CategoryIcon cat={w.category} />
                  {w.category}
                </div>
              )}
              {/* Product name */}
              <div style={{ fontSize:'16px', fontWeight:800, letterSpacing:'-0.02em', color:'#f0f0f0', lineHeight:1.25 }}>{w.productName}</div>
              {w.brand && <div style={{ fontSize:'12px', color:'#555', marginTop:'3px' }}>{w.brand}</div>}
            </div>
            {/* Status badge */}
            <div style={{ display:'flex', alignItems:'center', gap:'5px', background:sBg, border:`1px solid ${sColor}30`, borderRadius:'20px', padding:'4px 10px', flexShrink:0 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:sColor }} />
              <span style={{ fontSize:'10px', fontWeight:700, color:sColor, textTransform:'uppercase', letterSpacing:'0.08em' }}>{status}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-bar" style={{ marginBottom:'10px' }}>
            <div className="progress-fill" style={{ width:`${progressPct}%`, background:sColor }} />
          </div>

          {/* Expiry date + days remaining */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize:'12px', color:'#555' }}>{formatDate(w.expiryDate)}</div>
            <div style={{ fontSize:'12px', fontWeight:700, color:sColor }}>
              {days < 0 ? `${Math.abs(days)}d ago` : `${days}d left`}
            </div>
          </div>
        </div>

        {/* ── Footer bar ── */}
        <div style={{ borderTop:'1px solid #161616', padding:'11px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:'12px', color:'#555', fontWeight:500 }}>
            {w.price ? formatPrice(w.price) : 'N/A'}
          </div>
          {/* Edit */}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); openEdit(w); }}
            style={{ display:'flex', alignItems:'center', gap:'4px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'6px', color:'#666', fontSize:'10px', fontWeight:700, padding:'5px 9px', cursor:'pointer', transition:'all 0.15s', fontFamily:'Inter, sans-serif', letterSpacing:'0.04em', textTransform:'uppercase' }}
            onMouseOver={e => { e.currentTarget.style.background='#242424'; e.currentTarget.style.color='#ccc'; e.currentTarget.style.borderColor='#3a3a3a'; }}
            onMouseOut={e => { e.currentTarget.style.background='#1a1a1a'; e.currentTarget.style.color='#666'; e.currentTarget.style.borderColor='#2a2a2a'; }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
        </div>
      </div>
    );
  };

  // ── Render list row ────────────────────────────────────────────────────────
  const renderListRow = (w) => {
    const status = getStatus(w);
    const days = daysRemaining(w.expiryDate);
    const sColor = statusColor[status];
    const sBg = statusBg[status];
    return (
      <div key={w.id} className="list-row" onClick={() => { setViewId(w.id); setShowViewModal(true); }} style={{ cursor:'pointer' }}>
        <div className="list-row-main" style={{ display:'flex', alignItems:'center', gap:'10px', minWidth:0 }}>
          <div style={{ width:28, height:28, borderRadius:'7px', background:'#161616', border:'1px solid #222', display:'flex', alignItems:'center', justifyContent:'center', color:'#666', flexShrink:0 }}>
            <CategoryIcon cat={w.category} />
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontWeight:600, fontSize:'13px', color:'#e0e0e0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{w.productName}</div>
            {w.brand && <div style={{ fontSize:'11px', color:'#444' }}>{w.brand}</div>}
            <div className="list-row-expiry-mobile" style={{ fontSize:'11px', color:'#555', marginTop:'1px' }}>{formatDate(w.expiryDate)}</div>
          </div>
        </div>
        <div className="list-col-desktop" style={{ fontSize:'12px', color:'#666' }}>{w.category || 'N/A'}</div>
        <div className="list-col-desktop" style={{ fontSize:'12px', color:'#666' }}>{formatDate(w.expiryDate)}</div>
        <div style={{ fontSize:'12px', fontWeight:700, color:sColor, flexShrink:0 }}>{days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}</div>
        <div style={{ flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'5px', background:sBg, border:`1px solid ${sColor}22`, borderRadius:'20px', padding:'3px 8px', width:'fit-content' }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:sColor }}></div>
            <span style={{ fontSize:'10px', fontWeight:700, color:sColor, textTransform:'uppercase', letterSpacing:'0.08em' }}>{status}</span>
          </div>
        </div>
        <div className="list-col-desktop" style={{ fontSize:'12px', color:'#666', fontWeight:600 }}>{formatPrice(w.price)}</div>
      </div>
    );
  };

  return (
    <div style={{ background:'#080808', color:'#fff', fontFamily:'Inter, sans-serif', minHeight:'100vh' }}>

      {/* ── Nav ── */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:'56px', borderBottom:'1px solid #141414', background:'rgba(8,8,8,0.95)', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:100 }}>
        <a href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
          <img src="/favicon.png" width="28" height="28" alt="AEGIS" style={{ borderRadius:'6px' }} />
          <span style={{ fontSize:'15px', fontWeight:'800', letterSpacing:'0.15em', textTransform:'uppercase', color:'#fff', lineHeight:1 }}>AEGIS</span>
          <span className="hide-mobile" style={{ fontSize:'12px', fontWeight:500, color:'#444', letterSpacing:'0.02em', marginLeft:'2px' }}>Warranty Tracker</span>
        </a>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          {/* Bell */}
          <button onClick={() => { setShowNotifModal(true); setUserMenuOpen(false); if (typeof window !== 'undefined' && 'Notification' in window) setNotifPermission(Notification.permission); }} style={{ position:'relative', background:'none', border:'1px solid #1e1e1e', borderRadius:'8px', padding:'7px', color:'#666', cursor:'pointer', transition:'all 0.15s', lineHeight:0 }} className={`hide-mobile${bellRing ? ' bell-ring' : ''}`} title="Notifications">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {expiringCount > 0 && (
              <span className="notif-badge" style={{ position:'absolute', top:'-4px', right:'-4px', background:'#f59e0b', color:'#000', fontSize:'9px', fontWeight:800, borderRadius:'10px', minWidth:'16px', height:'16px', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px' }}>
                {expiringCount}
              </span>
            )}
          </button>
          {/* User menu */}
          <div style={{ position:'relative', alignSelf:'center' }} ref={userMenuRef}>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display:'flex', alignItems:'center', gap:'8px', background:'#111', border:'1px solid #1e1e1e', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', transition:'all 0.15s' }}>
              <UserAvatar user={currentUser} name={displayName} size={24} fontSize={11} />
              <span className="hide-mobile" style={{ fontSize:'13px', fontWeight:600, color:'#ccc' }}>{displayName}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition:'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {userMenuOpen && (
              <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:'#0f0f0f', border:'1px solid #1e1e1e', borderRadius:'12px', padding:'8px', minWidth:'200px', boxShadow:'0 16px 48px rgba(0,0,0,0.6)', zIndex:200 }}>
                <div style={{ padding:'8px 12px 12px', borderBottom:'1px solid #1a1a1a', marginBottom:'8px' }}>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'#e0e0e0' }}>{displayName}</div>
                  <div style={{ fontSize:'11px', color:'#444', marginTop:'2px' }}>{displayEmail}</div>
                  {/* AI usage */}
                  <div style={{ marginTop:'10px', background:'#161616', border:'1px solid #1e1e1e', borderRadius:'8px', padding:'8px 10px', display:'flex', flexDirection:'column', gap:'8px' }}>
                    {/* Scans row */}
                    <div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'5px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          <span style={{ fontSize:'10px', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'0.08em' }}>AI Scans</span>
                        </div>
                        <span style={{ fontSize:'11px', fontWeight:700, color: scanMonthlyCount >= SCAN_LIMIT ? '#ef4444' : scanMonthlyCount >= SCAN_LIMIT - 1 ? '#f59e0b' : '#4ade80' }}>
                          {scanMonthlyCount}/{SCAN_LIMIT}
                        </span>
                      </div>
                      <div style={{ height:'3px', borderRadius:'2px', background:'#2a2a2a', overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:'2px', width:`${Math.min((scanMonthlyCount / SCAN_LIMIT) * 100, 100)}%`, background: scanMonthlyCount >= SCAN_LIMIT ? '#ef4444' : scanMonthlyCount >= SCAN_LIMIT - 1 ? '#f59e0b' : '#4ade80', transition:'width 0.3s ease' }} />
                      </div>
                    </div>
                    {/* Claim chats row */}
                    <div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'5px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          <span style={{ fontSize:'10px', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'0.08em' }}>Claim Messages</span>
                        </div>
                        <span style={{ fontSize:'11px', fontWeight:700, color: claimMonthlyCount >= CLAIM_LIMIT ? '#ef4444' : claimMonthlyCount >= CLAIM_LIMIT - 1 ? '#f59e0b' : '#4ade80' }}>
                          {claimMonthlyCount}/{CLAIM_LIMIT}
                        </span>
                      </div>
                      <div style={{ height:'3px', borderRadius:'2px', background:'#2a2a2a', overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:'2px', width:`${Math.min((claimMonthlyCount / CLAIM_LIMIT) * 100, 100)}%`, background: claimMonthlyCount >= CLAIM_LIMIT ? '#ef4444' : claimMonthlyCount >= CLAIM_LIMIT - 1 ? '#f59e0b' : '#4ade80', transition:'width 0.3s ease' }} />
                      </div>
                    </div>
                    <div style={{ fontSize:'10px', color:'#333' }}>Resets on the 1st of each month</div>
                  </div>
                </div>
                <button onClick={() => { setShowNotifModal(true); setUserMenuOpen(false); if (typeof window !== 'undefined' && 'Notification' in window) setNotifPermission(Notification.permission); }} style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'9px 12px', background:'none', border:'none', color:'#888', fontSize:'13px', cursor:'pointer', borderRadius:'7px', transition:'all 0.15s', textAlign:'left' }} onMouseOver={e=>e.currentTarget.style.background='#161616'} onMouseOut={e=>e.currentTarget.style.background='none'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  Notifications
                </button>
                <button onClick={() => { setShowSettingsModal(true); setUserMenuOpen(false); }} style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'9px 12px', background:'none', border:'none', color:'#888', fontSize:'13px', cursor:'pointer', borderRadius:'7px', transition:'all 0.15s', textAlign:'left' }} onMouseOver={e=>e.currentTarget.style.background='#161616'} onMouseOut={e=>e.currentTarget.style.background='none'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  Settings
                </button>
                <div style={{ borderTop:'1px solid #1a1a1a', marginTop:'8px', paddingTop:'8px' }}>
                  <button onClick={logout} style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'9px 12px', background:'none', border:'none', color:'#ef4444', fontSize:'13px', cursor:'pointer', borderRadius:'7px', transition:'all 0.15s', textAlign:'left' }} onMouseOver={e=>e.currentTarget.style.background='rgba(239,68,68,0.08)'} onMouseOut={e=>e.currentTarget.style.background='none'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'24px 20px' }}>

        {/* ── Hero banner ── */}
        <div style={{ background:'linear-gradient(135deg, #0f0f0f 0%, #111 50%, #0f0f0f 100%)', border:'1px solid #1a1a1a', borderRadius:'16px', padding:'28px 32px', marginBottom:'24px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, right:0, width:'300px', height:'100%', background:'radial-gradient(ellipse at right center, rgba(255,255,255,0.02) 0%, transparent 70%)', pointerEvents:'none' }}></div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <div style={{ fontSize:'22px', fontWeight:900, letterSpacing:'-0.03em', marginBottom:'6px' }}>
                Welcome back, {displayName.split(' ')[0]}
              </div>
              <div style={{ fontSize:'13px', color:'#555' }}>
                {warranties.length === 0
                  ? 'No warranties tracked yet. Add your first one.'
                  : `You have ${warranties.length} warrant${warranties.length === 1 ? 'y' : 'ies'} tracked${expiringCount > 0 ? ` · ${expiringCount} expiring soon` : ''}.`}
              </div>
            </div>
            <button className="btn-primary" onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); setFormError(''); setShowWarrantyModal(true); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Warranty
            </button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'12px', marginBottom:'24px' }}>
          {[
            { key:'total', label:'Total', color:'#fff', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
            { key:'active', label:'Active', color:'#4ade80', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
            { key:'expiring', label:'Expiring', color:'#f59e0b', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { key:'expired', label:'Expired', color:'#ef4444', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
          ].map(({ key, label, color, icon }) => (
            <div key={key} className="stat-card" onClick={() => setCurrentFilter(key === 'total' ? 'all' : key)} style={{ cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                <div style={{ fontSize:'11px', fontWeight:700, color:'#444', textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</div>
                <div style={{ color: key === 'total' ? '#333' : color, opacity:0.7 }}>{icon}</div>
              </div>
              <div className="ticker" style={{ fontSize:'32px', fontWeight:900, color, letterSpacing:'-0.04em', lineHeight:1 }}>
                {statValues[key]}
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px', flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:'200px', position:'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="search-bar" type="text" placeholder="Search warranties…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft:'36px' }} />
          </div>
          <select className="search-bar" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width:'auto', minWidth:'160px', paddingLeft:'14px' }}>
            <option value="expiry-asc">Expiry (Soonest)</option>
            <option value="expiry-desc">Expiry (Latest)</option>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="purchase-desc">Newest Purchase</option>
            <option value="price-desc">Highest Value</option>
          </select>
          {!isMobileView && (
            <div style={{ display:'flex', gap:'4px' }}>
              <button className={`view-btn ${currentView==='grid'?'active':''}`} onClick={() => setCurrentView('grid')} title="Grid view">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              </button>
              <button className={`view-btn ${currentView==='list'?'active':''}`} onClick={() => setCurrentView('list')} title="List view">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
            </div>
          )}
        </div>

        {/* ── Filter pills ── */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
          {['all','active','expiring','expired'].map(f => (
            <button key={f} className={`filter-pill ${currentFilter===f?'active':''}`} onClick={() => setCurrentFilter(f)}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{ background: currentFilter===f ? 'rgba(0,0,0,0.2)' : '#1a1a1a', borderRadius:'10px', padding:'1px 6px', fontSize:'10px', marginLeft:'4px' }}>
                {f === 'all' ? warranties.length : warranties.filter(w => getStatus(w) === f).length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Warranty list ── */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom:'16px' }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            <div style={{ fontSize:'16px', fontWeight:700, color:'#333', marginBottom:'8px' }}>No warranties found</div>
            <div style={{ fontSize:'13px', color:'#2a2a2a', marginBottom:'20px' }}>
              {searchQuery ? 'Try a different search term.' : 'Add your first warranty to get started.'}
            </div>
            {!searchQuery && (
              <button className="btn-primary" onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); setFormError(''); setShowWarrantyModal(true); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Warranty
              </button>
            )}
          </div>
        ) : (isMobileView || currentView === 'grid') ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'12px' }}>
            {filtered.map(renderGridCard)}
          </div>
        ) : (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1.1fr 1.1fr 100px 70px', gap:'12px', padding:'8px 16px', marginBottom:'4px' }}>
              {['Product','Category','Expires','Remaining','Status','Value'].map(h => (
                <div key={h} style={{ fontSize:'10px', fontWeight:700, color:'#333', textTransform:'uppercase', letterSpacing:'0.1em' }}>{h}</div>
              ))}
            </div>
            {filtered.map(renderListRow)}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* ── Add / Edit Warranty Modal ── */}
      {showWarrantyModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowWarrantyModal(false); setEditingId(null); setFormData(EMPTY_FORM); } }}>
          <div className="modal-box" style={{ maxWidth:'540px', width:'100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
              <div>
                <h2 style={{ fontSize:'18px', fontWeight:800, letterSpacing:'-0.03em', margin:0 }}>{editingId ? 'Edit Warranty' : 'Add Warranty'}</h2>
                <p style={{ fontSize:'12px', color:'#444', margin:'4px 0 0' }}>Track your product warranty details</p>
              </div>
              <button onClick={() => { setShowWarrantyModal(false); setEditingId(null); setFormData(EMPTY_FORM); }} style={{ background:'none', border:'1px solid #1e1e1e', borderRadius:'8px', color:'#555', cursor:'pointer', padding:'8px', lineHeight:0, transition:'all 0.15s' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {formError && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', color:'#ef4444', marginBottom:'16px' }}>{formError}</div>}
            <form onSubmit={saveWarranty}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="label">Product Name *</label>
                  <input className="input-field" type="text" placeholder='e.g. MacBook Pro 14"' value={formData.productName} onChange={e => setFormData(p => ({...p, productName:e.target.value}))} required />
                </div>
                <div>
                  <label className="label">Brand</label>
                  <input className="input-field" type="text" placeholder="e.g. Apple" value={formData.brand} onChange={e => setFormData(p => ({...p, brand:e.target.value}))} />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input-field" value={formData.category} onChange={e => setFormData(p => ({...p, category:e.target.value}))}>
                    <option value="">Select category</option>
                    {['Electronics','Appliances','Automotive','Footwear','Clothing','Tools','Furniture','Sports','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Purchase Date</label>
                  <input className="input-field" type="date" value={formData.purchaseDate} onChange={e => setFormData(p => ({...p, purchaseDate:e.target.value}))} />
                </div>
                <div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' }}>
                    <label className="label" style={{ margin:0 }}>Expiry Date *</label>
                    <div style={{ display:'flex', gap:'4px' }}>
                      {[1,2,3,5].map(yr => (
                        <button key={yr} type="button"
                          onClick={() => {
                            const base = formData.purchaseDate ? new Date(formData.purchaseDate + 'T00:00:00') : new Date();
                            base.setFullYear(base.getFullYear() + yr);
                            setFormData(p => ({ ...p, expiryDate: base.toISOString().slice(0,10) }));
                          }}
                          style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', color:'#666', borderRadius:'5px', padding:'3px 7px', fontSize:'10px', fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}
                          onMouseOver={e => { e.currentTarget.style.borderColor='#444'; e.currentTarget.style.color='#ccc'; }}
                          onMouseOut={e => { e.currentTarget.style.borderColor='#2a2a2a'; e.currentTarget.style.color='#666'; }}>
                          +{yr}yr
                        </button>
                      ))}
                    </div>
                  </div>
                  <input className="input-field" type="date" value={formData.expiryDate} onChange={e => setFormData(p => ({...p, expiryDate:e.target.value}))} required />
                </div>
                <div>
                  <label className="label">Purchase Price</label>
                  <input className="input-field" type="number" step="0.01" placeholder="0.00" value={formData.price} onChange={e => setFormData(p => ({...p, price:e.target.value}))} />
                </div>
                <div>
                  <label className="label">Retailer</label>
                  <input className="input-field" type="text" placeholder="e.g. Best Buy" value={formData.retailer} onChange={e => setFormData(p => ({...p, retailer:e.target.value}))} />
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="label">Serial Number</label>
                  <input className="input-field" type="text" placeholder="Product serial number" value={formData.serial} onChange={e => setFormData(p => ({...p, serial:e.target.value}))} />
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="label">Notes</label>
                  <textarea className="input-field" rows={3} placeholder="Any additional notes" value={formData.notes} onChange={e => setFormData(p => ({...p, notes:e.target.value}))} style={{ resize:'vertical' }} />
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <div style={{ marginBottom:'6px' }}>
                    <label className="label" style={{ margin:0 }}>Receipt</label>
                  </div>
                  {(receiptFile || formData.receiptUrl) ? (
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', background:'#0d0d0d', border:'1px solid #2a2a2a', borderRadius:'10px', padding:'12px 14px' }}>
                      {(receiptPreview) ? (
                        <img src={receiptPreview} alt="Receipt" style={{ width:48, height:48, objectFit:'cover', borderRadius:'6px', border:'1px solid #2a2a2a', flexShrink:0 }} />
                      ) : (
                        <div style={{ width:48, height:48, borderRadius:'6px', background:'#1a1a1a', border:'1px solid #2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', color:'#555', flexShrink:0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                      )}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'13px', color:'#ccc', fontWeight:600 }}>
                          {receiptFile ? receiptFile.name : 'Saved receipt'}
                        </div>
                        {receiptFile && <div style={{ fontSize:'11px', color:'#555', marginTop:'2px' }}>{(receiptFile.size/1024).toFixed(0)} KB</div>}
                        {!receiptFile && formData.receiptUrl && <div style={{ fontSize:'11px', color:'#555', marginTop:'2px' }}>Click × to remove</div>}
                      </div>
                      {receiptFile && (
                        <button type="button" onClick={scanReceiptWithAI} disabled={scanLoading || scanMonthlyCount >= SCAN_LIMIT}
                          style={{ display:'flex', alignItems:'center', gap:'6px', background: scanMonthlyCount >= SCAN_LIMIT ? '#111' : '#ffffff', border:`1px solid ${scanMonthlyCount >= SCAN_LIMIT ? '#222' : '#ffffff'}`, borderRadius:'7px', color: scanMonthlyCount >= SCAN_LIMIT ? '#444' : '#000000', fontSize:'11px', fontWeight:700, cursor: scanLoading || scanMonthlyCount >= SCAN_LIMIT ? 'not-allowed' : 'pointer', padding:'6px 10px', flexShrink:0, transition:'all 0.15s', fontFamily:'Inter, sans-serif' }}
                          onMouseOver={e => {
                            if (!(scanLoading || scanMonthlyCount >= SCAN_LIMIT)) {
                              e.currentTarget.style.background = '#e5e7eb';
                              e.currentTarget.style.borderColor = '#e5e7eb';
                            }
                          }}
                          onMouseOut={e => {
                            if (!(scanLoading || scanMonthlyCount >= SCAN_LIMIT)) {
                              e.currentTarget.style.background = '#ffffff';
                              e.currentTarget.style.borderColor = '#ffffff';
                            }
                          }}
                          title={scanMonthlyCount >= SCAN_LIMIT ? 'Monthly limit reached' : 'Use AI to extract fields from this receipt'}>
                          {scanLoading ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.7s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 6v2m0 8v2M6 12H4m16 0h-2"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                          {scanLoading ? 'Scanning.' : 'Scan with AI'}
                        </button>
                      )}
                      <button type="button" onClick={clearReceipt} style={{ background:'none', border:'1px solid #2a2a2a', borderRadius:'6px', color:'#555', cursor:'pointer', padding:'6px', lineHeight:0, flexShrink:0, transition:'all 0.15s' }} onMouseOver={e=>e.currentTarget.style.borderColor='#555'} onMouseOut={e=>e.currentTarget.style.borderColor='#2a2a2a'}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ) : (
                    <label style={{ display:'block', background:'#0d0d0d', border:'2px dashed #2a2a2a', borderRadius:'10px', padding:'24px 16px', textAlign:'center', cursor:'pointer', transition:'all 0.2s' }}
                      onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor='#555'; }}
                      onDragLeave={e => { e.currentTarget.style.borderColor='#2a2a2a'; }}
                      onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor='#2a2a2a'; const f = e.dataTransfer.files[0]; if (f) handleReceiptSelect(f); }}
                    >
                      <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleReceiptSelect(e.target.files[0])} />
                      <div style={{ color:'#444', marginBottom:'6px', lineHeight:0 }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      </div>
                      <div style={{ fontSize:'13px', color:'#555', fontWeight:500 }}>Drop receipt here or <span style={{ color:'#888', fontWeight:700 }}>browse</span></div>
                      <div style={{ fontSize:'11px', color:'#333', marginTop:'4px' }}>JPG, PNG, WEBP up to 32MB</div>
                    </label>
                  )}
                </div>
              </div>
              <div style={{ display:'flex', gap:'10px', marginTop:'24px', justifyContent:'flex-end' }}>
                <button type="button" className="btn-ghost" onClick={() => { setShowWarrantyModal(false); setEditingId(null); setFormData(EMPTY_FORM); setReceiptFile(null); setReceiptPreview(null); }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={savingWarranty}>
                  {savingWarranty ? (
                    <>
                      <div style={{ width:12, height:12, border:'2px solid rgba(0,0,0,0.2)', borderTopColor:'#000', borderRadius:'50%', animation:'spin 0.6s linear infinite' }}></div>
                      {uploadingReceipt ? 'Uploading…' : 'Saving…'}
                    </>
                  ) : (editingId ? 'Update' : 'Add Warranty')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Warranty Modal ── */}
      {showViewModal && viewWarranty && (() => {
        const w = viewWarranty;
        const status = getStatus(w);
        const days = daysRemaining(w.expiryDate);
        const sColor = statusColor[status];
        const sBg = statusBg[status];
        return (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowViewModal(false); }}>
            <div className="modal-box" style={{ maxWidth:'500px', width:'100%' }} onClick={e => e.stopPropagation()}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:40, height:40, borderRadius:'10px', background:'#161616', border:'1px solid #252525', display:'flex', alignItems:'center', justifyContent:'center', color:'#666' }}>
                    <CategoryIcon cat={w.category} />
                  </div>
                  <div>
                    <h2 style={{ fontSize:'16px', fontWeight:800, margin:0, letterSpacing:'-0.02em' }}>{w.productName}</h2>
                    {w.brand && <div style={{ fontSize:'12px', color:'#555', marginTop:'2px' }}>{w.brand}</div>}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'5px', background:sBg, border:`1px solid ${sColor}22`, borderRadius:'20px', padding:'4px 10px' }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:sColor }}></div>
                    <span style={{ fontSize:'11px', fontWeight:700, color:sColor, textTransform:'uppercase', letterSpacing:'0.08em' }}>{status}</span>
                  </div>
                  <button onClick={() => setShowViewModal(false)} style={{ background:'none', border:'1px solid #1e1e1e', borderRadius:'8px', color:'#555', cursor:'pointer', padding:'8px', lineHeight:0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
                {[
                  { label:'Expiry Date', value:formatDate(w.expiryDate) },
                  { label:'Days Remaining', value: days < 0 ? `${Math.abs(days)} days ago` : `${days} days`, color:sColor },
                  { label:'Purchase Date', value:formatDate(w.purchaseDate) },
                  { label:'Value', value:formatPrice(w.price) },
                  { label:'Category', value:w.category || 'N/A' },
                  { label:'Retailer', value:w.retailer || 'N/A' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background:'#0d0d0d', border:'1px solid #1a1a1a', borderRadius:'10px', padding:'12px' }}>
                    <div style={{ fontSize:'10px', color:'#444', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'4px' }}>{label}</div>
                    <div style={{ fontSize:'13px', fontWeight:600, color: color || '#ccc' }}>{value}</div>
                  </div>
                ))}
              </div>
              {w.serial && (
                <div style={{ background:'#0d0d0d', border:'1px solid #1a1a1a', borderRadius:'10px', padding:'12px', marginBottom:'10px' }}>
                  <div style={{ fontSize:'10px', color:'#444', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'4px' }}>Serial Number</div>
                  <div style={{ fontSize:'13px', fontFamily:'monospace', color:'#888' }}>{w.serial}</div>
                </div>
              )}
              {w.notes && (
                <div style={{ background:'#0d0d0d', border:'1px solid #1a1a1a', borderRadius:'10px', padding:'12px', marginBottom:'10px' }}>
                  <div style={{ fontSize:'10px', color:'#444', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'4px' }}>Notes</div>
                  <div style={{ fontSize:'13px', color:'#888', lineHeight:'1.5' }}>{w.notes}</div>
                </div>
              )}
              {w.receiptUrl && (
                <div style={{ marginBottom:'10px' }}>
                  <div style={{ fontSize:'10px', color:'#444', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px' }}>Receipt</div>
                  {w.receiptType === 'image' ? (
                    <a href={w.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ display:'block', textDecoration:'none' }}>
                      <img src={w.receiptUrl} alt="Receipt" style={{ width:'100%', maxHeight:'200px', objectFit:'cover', borderRadius:'10px', border:'1px solid #2a2a2a', transition:'opacity 0.15s' }} onMouseOver={e=>e.target.style.opacity='0.85'} onMouseOut={e=>e.target.style.opacity='1'} />
                      <div style={{ fontSize:'11px', color:'#444', marginTop:'6px', textAlign:'center' }}>Click to open full size ↗</div>
                    </a>
                  ) : (
                    <a href={w.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#888', textDecoration:'none', background:'#0d0d0d', border:'1px solid #1a1a1a', borderRadius:'8px', padding:'10px 14px', transition:'all 0.15s' }} onMouseOver={e=>e.currentTarget.style.borderColor='#444'} onMouseOut={e=>e.currentTarget.style.borderColor='#1a1a1a'}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      View Receipt Document
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  )}
                </div>
              )}
              <div style={{ display:'flex', gap:'10px', marginTop:'16px', paddingTop:'16px', borderTop:'1px solid #141414', justifyContent:'flex-end' }}>
                <button className="btn-danger" onClick={() => { setPendingDeleteId(w.id); setShowDeleteModal(true); }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  Delete
                </button>
                <button className="btn-ghost" onClick={() => openEdit(w)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Delete Confirm Modal ── */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowDeleteModal(false); setPendingDeleteId(null); } }}>
          <div className="modal-box" style={{ maxWidth:'380px', width:'100%', textAlign:'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width:48, height:48, borderRadius:'12px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'#ef4444' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <h3 style={{ fontSize:'16px', fontWeight:800, margin:'0 0 8px', letterSpacing:'-0.02em' }}>Delete Warranty?</h3>
            <p style={{ fontSize:'13px', color:'#555', margin:'0 0 24px', lineHeight:'1.5' }}>This action cannot be undone. The warranty will be permanently removed.</p>
            <div style={{ display:'flex', gap:'10px' }}>
              <button className="btn-ghost" style={{ flex:1 }} onClick={() => { setShowDeleteModal(false); setPendingDeleteId(null); }}>Cancel</button>
              <button className="btn-danger" style={{ flex:1 }} onClick={confirmDelete} disabled={deletingWarranty}>
                {deletingWarranty ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notifications Modal ── */}
      {showNotifModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowNotifModal(false); }}>
          <div className="modal-box" style={{ maxWidth:'400px', width:'100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
              <div>
                <h2 style={{ fontSize:'18px', fontWeight:800, letterSpacing:'-0.03em', margin:0 }}>Notifications</h2>
                <p style={{ fontSize:'12px', color:'#444', margin:'4px 0 0' }}>Manage expiry reminder settings</p>
              </div>
              <button onClick={() => setShowNotifModal(false)} style={{ background:'none', border:'1px solid #1e1e1e', borderRadius:'8px', color:'#555', cursor:'pointer', padding:'8px', lineHeight:0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {/* Browser notification info */}
            <div style={{ background:'#0f0f0f', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'14px 16px', marginBottom:'12px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:600, color:'#ccc' }}>Browser Notifications</div>
                  <div style={{ fontSize:'11px', color:'#444', marginTop:'2px' }}>
                    {notifPermission === 'granted' && 'Permission granted'}
                    {notifPermission === 'denied' && 'Blocked. Enable in browser settings.'}
                    {notifPermission === 'default' && 'Permission not yet requested'}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background: notifPermission === 'granted' ? '#4ade80' : notifPermission === 'denied' ? '#ef4444' : '#f59e0b', flexShrink:0 }} />
                <button
                  type="button"
                  onClick={sendTestNotification}
                  disabled={testingNotif}
                  style={{ padding:'6px 12px', borderRadius:'7px', border:'1px solid #2a2a2a', background:'#1a1a1a', color:'#888', fontSize:'11px', fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.15s', whiteSpace:'nowrap' }}
                  onMouseOver={e => { e.currentTarget.style.background='#222'; e.currentTarget.style.color='#ccc'; }}
                  onMouseOut={e => { e.currentTarget.style.background='#1a1a1a'; e.currentTarget.style.color='#888'; }}
                >
                  {testingNotif ? 'Sending…' : 'Test'}
                </button>
              </div>
            </div>
            <div style={{ background:'#0f0f0f', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:'14px', fontWeight:600, color:'#e0e0e0', marginBottom:'2px' }}>Enable Reminders</div>
                  <div style={{ fontSize:'12px', color:'#444' }}>Get notified before warranties expire</div>
                </div>
                <button
                  className="toggle-track"
                  style={{ background: notifPrefs.enabled ? '#fff' : '#1e1e1e' }}
                  onClick={() => setNotifPrefs(p => ({ ...p, enabled: !p.enabled }))}
                >
                  <div className="toggle-thumb" style={{ transform: notifPrefs.enabled ? 'translateX(20px)' : 'translateX(2px)', background: notifPrefs.enabled ? '#000' : '#444' }}></div>
                </button>
              </div>
            </div>
            {notifPrefs.enabled && (
              <div style={{ marginBottom:'16px' }}>
                <label className="label">Notify me this many days before expiry</label>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  {[7, 14, 30, 60, 90].map(d => (
                    <button key={d} onClick={() => setSelectedDaysBefore(d)} style={{ padding:'8px 16px', borderRadius:'8px', border:`1px solid ${selectedDaysBefore===d ? '#fff' : '#1e1e1e'}`, background: selectedDaysBefore===d ? '#fff' : '#0f0f0f', color: selectedDaysBefore===d ? '#000' : '#666', fontSize:'13px', fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}>
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            )}
            {expiringCount > 0 && (
              <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'10px', padding:'12px 14px', marginBottom:'16px', fontSize:'13px', color:'#f59e0b' }}>
                <strong>{expiringCount}</strong> warrant{expiringCount === 1 ? 'y' : 'ies'} expiring within {selectedDaysBefore} days
              </div>
            )}
            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', alignItems:'center' }}>
              <button className="btn-ghost" onClick={() => setShowNotifModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveNotifPrefs} disabled={savingNotifPrefs}>
                {savingNotifPrefs ? 'Saving…' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ── */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowSettingsModal(false); }}>
          <div className="modal-box" style={{ maxWidth:'420px', width:'100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
              <div>
                <h2 style={{ fontSize:'18px', fontWeight:800, letterSpacing:'-0.03em', margin:0 }}>Settings</h2>
                <p style={{ fontSize:'12px', color:'#444', margin:'4px 0 0' }}>Manage your account</p>
              </div>
              <button onClick={() => setShowSettingsModal(false)} style={{ background:'none', border:'1px solid #1e1e1e', borderRadius:'8px', color:'#555', cursor:'pointer', padding:'8px', lineHeight:0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={saveSettings}>
              <div style={{ marginBottom:'16px' }}>
                <label className="label">Display Name</label>
                <input className="input-field" type="text" placeholder="Your name" value={settingsForm.name} onChange={e => setSettingsForm(p => ({...p, name:e.target.value}))} />
              </div>
              <div style={{ marginBottom:'16px' }}>
                <label className="label">Email</label>
                <input className="input-field" type="email" value={displayEmail} disabled style={{ opacity:0.5, cursor:'not-allowed' }} />
              </div>
              <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'24px' }}>
                <button type="button" className="btn-ghost" onClick={() => setShowSettingsModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={savingSettings}>
                  {savingSettings ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── AI Claim Assistant Modal ── */}
      {showClaimModal && claimWarranty && (
        <div className="modal-overlay" style={{ zIndex:300 }} onClick={e => { if (e.target === e.currentTarget) setShowClaimModal(false); }}>
          <div className="modal-box" style={{ maxWidth:'560px', width:'100%', height:'580px', display:'flex', flexDirection:'column', padding:0, overflow:'hidden' }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid #1a1a1a', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:32, height:32, borderRadius:'8px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div>
                  <div style={{ fontSize:'14px', fontWeight:800, letterSpacing:'-0.02em', color:'#f0f0f0' }}>Claim Assistant</div>
                  <div style={{ fontSize:'11px', color:'#444', marginTop:'1px' }}>{claimWarranty.productName}</div>
                </div>
              </div>
              <button onClick={() => setShowClaimModal(false)} style={{ background:'none', border:'1px solid #1e1e1e', borderRadius:'8px', color:'#555', cursor:'pointer', padding:'7px', lineHeight:0, transition:'all 0.15s' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Messages */}
            <div ref={claimScrollRef} style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:'12px' }}>
              {claimMessages.map((msg, i) => (
                <div key={i} style={{ display:'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth:'85%',
                    background: msg.role === 'user' ? '#fff' : '#111',
                    border: msg.role === 'user' ? 'none' : '1px solid #1e1e1e',
                    color: msg.role === 'user' ? '#000' : '#ccc',
                    borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                    padding:'10px 14px',
                    fontSize:'13px',
                    lineHeight:'1.55',
                    whiteSpace:'pre-wrap',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {claimLoading && (
                <div style={{ display:'flex', justifyContent:'flex-start' }}>
                  <div style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:'12px 12px 12px 3px', padding:'10px 16px', display:'flex', gap:'4px', alignItems:'center' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width:5, height:5, borderRadius:'50%', background:'#555', animation:`dotBounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input row */}
            {claimMonthlyCount >= CLAIM_LIMIT ? (
              <div style={{ padding:'16px 20px', borderTop:'1px solid #1a1a1a', background:'#0d0d0d', flexShrink:0, textAlign:'center' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:'10px', padding:'10px 16px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span style={{ fontSize:'12px', color:'#ef4444', fontWeight:600 }}>Message limit reached ({CLAIM_LIMIT}/{CLAIM_LIMIT}). Resets next month.</span>
                </div>
              </div>
            ) : (
              <div style={{ padding:'12px 16px', borderTop:'1px solid #1a1a1a', display:'flex', flexDirection:'column', gap:'6px', flexShrink:0, background:'#0d0d0d' }}>
                <div style={{ display:'flex', gap:'8px', alignItems:'flex-end' }}>
                  <textarea
                    value={claimInput}
                    onChange={e => setClaimInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendClaimMessage(); } }}
                    placeholder="Describe your issue or ask for a claim letter…"
                    rows={2}
                    style={{ flex:1, background:'#141414', border:'1px solid #242424', borderRadius:'10px', color:'#fff', padding:'10px 14px', fontSize:'13px', outline:'none', resize:'none', fontFamily:'Inter, sans-serif', lineHeight:'1.5', transition:'border-color 0.15s' }}
                    onFocus={e => e.target.style.borderColor='#555'}
                    onBlur={e => e.target.style.borderColor='#242424'}
                  />
                  <button
                    onClick={sendClaimMessage}
                    disabled={claimLoading || !claimInput.trim()}
                    style={{ background:'#fff', color:'#000', border:'none', borderRadius:'10px', padding:'10px 16px', fontSize:'13px', fontWeight:800, cursor: claimLoading || !claimInput.trim() ? 'not-allowed' : 'pointer', opacity: claimLoading || !claimInput.trim() ? 0.4 : 1, transition:'all 0.15s', fontFamily:'Inter, sans-serif', height:'46px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`notif-toast notif-${toast.type}`}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            {toast.type === 'success' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            {toast.type === 'error' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
            {toast.type === 'info' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            {toast.message}
          </div>
        </div>
      )}

      {/* ── Floating Claim FAB ── */}
      <button
        type="button"
        onClick={() => { setClaimPickerSearch(''); setShowClaimPicker(true); }}
        style={{ position:'fixed', bottom:'28px', right:'28px', zIndex:200, display:'flex', alignItems:'center', gap:'9px', background:'#fff', border:'none', borderRadius:'14px', color:'#000', fontSize:'13px', fontWeight:700, padding:'13px 20px', cursor:'pointer', boxShadow:'0 4px 24px rgba(0,0,0,0.25), 0 1px 4px rgba(0,0,0,0.15)', transition:'all 0.2s', fontFamily:'Inter, sans-serif', letterSpacing:'0.01em' }}
        onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)'; }}
        onMouseOut={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 24px rgba(0,0,0,0.25), 0 1px 4px rgba(0,0,0,0.15)'; }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        File a Claim
      </button>

      {/* ── Claim Product Picker Modal ── */}
      {showClaimPicker && (
        <div className="modal-overlay claim-picker-overlay" style={{ zIndex:250 }} onClick={e => { if (e.target === e.currentTarget) setShowClaimPicker(false); }}>
          <div className="modal-box claim-picker-box" style={{ maxWidth:'480px', width:'100%', padding:0, overflow:'hidden' }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid #1a1a1a', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:'16px', fontWeight:800, letterSpacing:'-0.02em', color:'#f0f0f0' }}>File a Claim</div>
                <div style={{ fontSize:'12px', color:'#444', marginTop:'3px' }}>Choose a product to get started</div>
              </div>
              <button onClick={() => setShowClaimPicker(false)} style={{ background:'none', border:'1px solid #1e1e1e', borderRadius:'8px', color:'#555', cursor:'pointer', padding:'7px', lineHeight:0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Search */}
            <div style={{ padding:'12px 20px', borderBottom:'1px solid #111' }}>
              <div style={{ position:'relative' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Search warranties…"
                  value={claimPickerSearch}
                  onChange={e => setClaimPickerSearch(e.target.value)}
                  autoFocus
                  style={{ width:'100%', background:'#111', border:'1px solid #222', borderRadius:'8px', color:'#ddd', padding:'9px 12px 9px 34px', fontSize:'13px', outline:'none', fontFamily:'Inter, sans-serif', boxSizing:'border-box' }}
                />
              </div>
            </div>

            {/* Warranty list */}
            <div style={{ maxHeight:'360px', overflowY:'auto' }}>
              {(() => {
                const q = claimPickerSearch.toLowerCase();
                const list = warranties.filter(w =>
                  !q ||
                  w.productName?.toLowerCase().includes(q) ||
                  w.brand?.toLowerCase().includes(q) ||
                  w.category?.toLowerCase().includes(q)
                );
                if (list.length === 0) return (
                  <div style={{ padding:'40px 20px', textAlign:'center', color:'#444', fontSize:'13px' }}>No warranties found.</div>
                );
                return list.map(w => {
                  const st = getStatus(w);
                  const sColor = statusColor[st];
                  const days = daysRemaining(w.expiryDate);
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => { setShowClaimPicker(false); openClaimModal(w); }}
                      style={{ width:'100%', display:'flex', alignItems:'center', gap:'14px', padding:'14px 20px', background:'transparent', border:'none', borderBottom:'1px solid #111', cursor:'pointer', textAlign:'left', transition:'background 0.12s', fontFamily:'Inter, sans-serif' }}
                      onMouseOver={e => e.currentTarget.style.background='#111'}
                      onMouseOut={e => e.currentTarget.style.background='transparent'}>
                      {/* Category icon box */}
                      <div style={{ width:36, height:36, borderRadius:'9px', background:'#161616', border:'1px solid #222', display:'flex', alignItems:'center', justifyContent:'center', color:'#666', flexShrink:0 }}>
                        <CategoryIcon cat={w.category} />
                      </div>
                      {/* Name + brand */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'13px', fontWeight:700, color:'#e0e0e0', letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{w.productName}</div>
                        {w.brand && <div style={{ fontSize:'11px', color:'#555', marginTop:'1px' }}>{w.brand}</div>}
                      </div>
                      {/* Status + days */}
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'3px', flexShrink:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'4px', background:`${sColor}14`, border:`1px solid ${sColor}28`, borderRadius:'20px', padding:'3px 8px' }}>
                          <div style={{ width:4, height:4, borderRadius:'50%', background:sColor }} />
                          <span style={{ fontSize:'9px', fontWeight:700, color:sColor, textTransform:'uppercase', letterSpacing:'0.08em' }}>{st}</span>
                        </div>
                        <div style={{ fontSize:'10px', fontWeight:600, color:'#555' }}>
                          {days < 0 ? `${Math.abs(days)}d ago` : `${days}d left`}
                        </div>
                      </div>
                      {/* Arrow */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dotBounce { 0%,80%,100% { transform: scale(0.6); opacity:0.4; } 40% { transform: scale(1); opacity:1; } }
      `}</style>
    </div>
  );
}
