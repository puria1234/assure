'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [strengthScore, setStrengthScore] = useState(0);
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.push('/app');
    });
    return () => unsub();
  }, [router]);

  const checkStrength = (pw) => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    setStrengthScore(score);
  };

  const getFirebaseError = (code) => {
    switch (code) {
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/wrong-password': return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential': return 'Invalid email or password.';
      case 'auth/email-already-in-use': return 'An account with this email already exists.';
      case 'auth/weak-password': return 'Password must be at least 6 characters.';
      case 'auth/invalid-email': return 'Please enter a valid email address.';
      case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed': return 'Network error. Check your connection.';
      case 'auth/operation-not-allowed': return 'Email/password sign-in is not enabled. Go to Firebase Console → Authentication → Sign-in method → Email/Password and enable it.';
      case 'auth/admin-restricted-operation': return 'Sign-up is currently disabled. Enable Email/Password in Firebase Console → Authentication → Sign-in method.';
      default: return 'Something went wrong. Please try again.';
    }
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/app');
    } catch (err) {
      setError(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!acceptedTerms) { setError('You must accept the Terms of Service and Privacy Policy to create an account.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      // Create Firestore user profile
      await setDoc(doc(db, 'users', cred.user.uid), {
        name,
        email,
        notificationPrefs: { enabled: false, daysBefore: 30 },
        createdAt: serverTimestamp()
      });
      router.push('/app');
    } catch (err) {
      setError(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      // Create Firestore profile if first time
      const { doc: firestoreDoc, getDoc: firestoreGetDoc } = await import('firebase/firestore');
      const profileRef = firestoreDoc(db, 'users', cred.user.uid);
      const snap = await firestoreGetDoc(profileRef);
      if (!snap.exists()) {
        await import('firebase/firestore').then(({ setDoc, serverTimestamp }) =>
          setDoc(profileRef, {
            name: cred.user.displayName || cred.user.email.split('@')[0],
            email: cred.user.email,
            notificationPrefs: { enabled: false, daysBefore: 30 },
            createdAt: serverTimestamp()
          })
        );
      }
      router.push('/app');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(getFirebaseError(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width:'100%', background:'#141414', border:'1px solid #242424', borderRadius:'10px',
    color:'#fff', padding:'13px 16px', fontSize:'14px', outline:'none',
    transition:'border-color 0.15s', fontFamily:'Inter, sans-serif', boxSizing:'border-box'
  };

  const SpinnerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.7s linear infinite' }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );

  return (
    <div style={{ background:'#080808', color:'#fff', fontFamily:'Inter, sans-serif', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      {/* Background grid */}
      <div style={{ position:'fixed', inset:'0', pointerEvents:'none', zIndex:'0', backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize:'60px 60px', maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)' }}></div>
      <div style={{ position:'fixed', top:'-30%', left:'50%', transform:'translateX(-50%)', width:'50vw', height:'50vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)', pointerEvents:'none', zIndex:'0' }}></div>

      <div style={{ background:'#0f0f0f', border:'1px solid #1e1e1e', borderRadius:'24px', padding:'40px 36px', width:'100%', maxWidth:'420px', position:'relative', zIndex:'1', boxShadow:'0 40px 120px rgba(0,0,0,0.6)' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <a href="/" style={{ display:'block', marginBottom:'20px' }}>
            <img src="/favicon.png" width="48" height="48" alt="ASSURE" style={{ display: 'block', margin: '0 auto' }} />
          </a>
          <div style={{ fontSize:'24px', fontWeight:'800', letterSpacing:'0.15em', textTransform:'uppercase', lineHeight:1, color:'#fff' }}>Assure</div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', background:'#141414', border:'1px solid #1e1e1e', borderRadius:'10px', padding:'4px', marginBottom:'28px' }}>
          {[['signin','Sign In'],['signup','Create Account']].map(([t,label]) => (
            <button key={t} onClick={() => { setTab(t); setError(''); setSuccessMsg(''); }} style={{ flex:1, padding:'9px 4px', borderRadius:'7px', border:'none', background:tab===t?'#fff':'transparent', color:tab===t?'#000':'#666', fontSize:'13px', fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s', fontFamily:'Inter, sans-serif' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Success message */}
        {successMsg && (
          <div style={{ background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', color:'#4ade80', marginBottom:'16px' }}>
            {successMsg}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', color:'#ef4444', marginBottom:'16px' }}>
            {error}
          </div>
        )}

        {/* ── Sign In ── */}
        {tab === 'signin' && (
          <form onSubmit={handleSignin}>
            <div style={{ marginBottom:'16px' }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#666', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>Email address</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} onFocus={e => e.target.style.borderColor='#555'} onBlur={e => e.target.style.borderColor='#242424'} />
            </div>
            <div style={{ marginBottom:'8px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#666', textTransform:'uppercase', letterSpacing:'0.1em' }}>Password</label>
                <button type="button" onClick={() => { setTab('forgot'); setError(''); setSuccessMsg(''); }} style={{ background:'none', border:'none', color:'#444', fontSize:'11px', cursor:'pointer', padding:'0', fontFamily:'Inter, sans-serif', transition:'color 0.15s', fontWeight:500 }} onMouseOver={e=>e.currentTarget.style.color='#888'} onMouseOut={e=>e.currentTarget.style.color='#444'}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position:'relative' }}>
                <input type={showPassword?'text':'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ ...inputStyle, paddingRight:'44px' }} onFocus={e => e.target.style.borderColor='#555'} onBlur={e => e.target.style.borderColor='#242424'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#555', cursor:'pointer', padding:'4px', lineHeight:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px' }}>
              <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ appearance:'none', width:'16px', height:'16px', border:'1px solid #333', borderRadius:'4px', background:rememberMe ? '#fff' : 'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }} />
              <style dangerouslySetInnerHTML={{ __html: `
                #rememberMe:checked::after { content: ''; position: absolute; width: 4px; height: 8px; border: solid #000; border-width: 0 2px 2px 0; transform: rotate(45deg); margin-top: -2px; }
              ` }} />
              <label htmlFor="rememberMe" style={{ fontSize:'12px', color:'#888', cursor:'pointer', userSelect:'none' }}>Remember me</label>
            </div>
            <button type="submit" disabled={loading} style={{ width:'100%', background:'#fff', color:'#000', border:'none', borderRadius:'10px', padding:'14px', fontSize:'13px', fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', cursor:loading?'not-allowed':'pointer', transition:'all 0.2s', fontFamily:'Inter, sans-serif', opacity:loading?0.6:1 }}>
              {loading ? <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}><SpinnerIcon /></div> : 'Sign In'}
            </button>
          </form>
        )}

        {/* ── Sign Up ── */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#666', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>Full Name</label>
              <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} onFocus={e => e.target.style.borderColor='#555'} onBlur={e => e.target.style.borderColor='#242424'} />
            </div>
            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#666', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>Email address</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} onFocus={e => e.target.style.borderColor='#555'} onBlur={e => e.target.style.borderColor='#242424'} />
            </div>
            <div style={{ marginBottom:'6px' }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#666', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPassword?'text':'password'} placeholder="Min. 6 characters" value={password} onChange={e => { setPassword(e.target.value); checkStrength(e.target.value); }} required style={{ ...inputStyle, paddingRight:'44px' }} onFocus={e => e.target.style.borderColor='#555'} onBlur={e => e.target.style.borderColor='#242424'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#555', cursor:'pointer', padding:'4px', lineHeight:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <div style={{ height:'3px', borderRadius:'2px', background:'#1a1a1a', marginTop:'6px', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:'2px', transition:'all 0.3s', width:['0%','25%','50%','75%','100%'][strengthScore], background:['','#ef4444','#f59e0b','#3b82f6','#4ade80'][strengthScore] }}></div>
              </div>
              <div style={{ fontSize:'11px', color:['','#ef4444','#f59e0b','#3b82f6','#4ade80'][strengthScore], marginTop:'4px', height:'14px' }}>
                {['','Weak','Fair','Good','Strong'][strengthScore]}
              </div>
            </div>
            <div style={{ marginBottom:'20px' }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#666', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>Confirm password</label>
              <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={inputStyle} onFocus={e => e.target.style.borderColor='#555'} onBlur={e => e.target.style.borderColor='#242424'} />
            </div>
            <label style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'20px', cursor:'pointer', userSelect:'none' }}>
              <div
                onClick={() => setAcceptedTerms(!acceptedTerms)}
                style={{ width:'18px', height:'18px', minWidth:'18px', border:`1px solid ${acceptedTerms ? '#fff' : '#333'}`, borderRadius:'4px', background: acceptedTerms ? '#fff' : 'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', marginTop:'1px', transition:'all 0.15s' }}
              >
                {acceptedTerms && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize:'12px', color:'#666', lineHeight:'1.6' }}>
                I have read and agree to the{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color:'#aaa', textDecoration:'underline' }} onClick={e => e.stopPropagation()}>Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color:'#aaa', textDecoration:'underline' }} onClick={e => e.stopPropagation()}>Privacy Policy</a>.
                I am at least 16 years of age.
              </span>
            </label>
            <button type="submit" disabled={loading || !acceptedTerms} style={{ width:'100%', background: acceptedTerms ? '#fff' : '#1a1a1a', color: acceptedTerms ? '#000' : '#444', border: acceptedTerms ? 'none' : '1px solid #2a2a2a', borderRadius:'10px', padding:'14px', fontSize:'13px', fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', cursor:(loading || !acceptedTerms)?'not-allowed':'pointer', transition:'all 0.2s', fontFamily:'Inter, sans-serif', opacity:loading?0.6:1 }}>
              {loading ? <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}><SpinnerIcon /></div> : 'Create Account'}
            </button>
          </form>
        )}

        {/* ── Forgot Password ── */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <button type="button" onClick={() => { setTab('signin'); setError(''); setSuccessMsg(''); }} style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'none', border:'none', color:'#555', fontSize:'12px', cursor:'pointer', padding:'0', fontFamily:'Inter, sans-serif', marginBottom:'20px', transition:'color 0.15s' }} onMouseOver={e=>e.currentTarget.style.color='#888'} onMouseOut={e=>e.currentTarget.style.color='#555'}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back to sign in
            </button>
            <div style={{ marginBottom:'6px' }}>
              <div style={{ fontSize:'17px', fontWeight:800, letterSpacing:'-0.02em', marginBottom:'6px' }}>Reset password</div>
              <div style={{ fontSize:'13px', color:'#555', lineHeight:'1.5' }}>Enter your email and we'll send you a reset link.</div>
            </div>
            <div style={{ margin:'20px 0' }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#666', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>Email address</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} onFocus={e => e.target.style.borderColor='#555'} onBlur={e => e.target.style.borderColor='#242424'} />
            </div>
            <button type="submit" disabled={loading} style={{ width:'100%', background:'#fff', color:'#000', border:'none', borderRadius:'10px', padding:'14px', fontSize:'13px', fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', cursor:loading?'not-allowed':'pointer', transition:'all 0.2s', fontFamily:'Inter, sans-serif', opacity:loading?0.6:1 }}>
              {loading ? <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}><SpinnerIcon /></div> : 'Send Reset Link'}
            </button>
          </form>
        )}

        {tab !== 'forgot' && (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'24px 0 12px', color:'#333', fontSize:'12px' }}>
              <div style={{ flex:1, height:'1px', background:'#1e1e1e' }}></div>
              <span>or</span>
              <div style={{ flex:1, height:'1px', background:'#1e1e1e' }}></div>
            </div>
            <button type="button" onClick={handleGoogleLogin} disabled={loading} style={{ width:'100%', background:'#141414', border:'1px solid #2a2a2a', borderRadius:'10px', padding:'13px 16px', fontSize:'13px', fontWeight:700, color:'#ccc', cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', transition:'all 0.2s', fontFamily:'Inter, sans-serif', opacity:loading?0.6:1 }}
              onMouseOver={e=>{if(!loading){e.currentTarget.style.borderColor='#444';e.currentTarget.style.color='#fff';}}}
              onMouseOut={e=>{e.currentTarget.style.borderColor='#2a2a2a';e.currentTarget.style.color='#ccc';}}>
              {/* Google "G" logo */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <p style={{ fontSize:'11px', color:'#3a3a3a', textAlign:'center', marginTop:'12px', lineHeight:'1.6' }}>
              By continuing, you agree to our{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color:'#555', textDecoration:'underline' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color:'#555', textDecoration:'underline' }}>Privacy Policy</a>.
            </p>
          </>
        )}
        <div style={{ textAlign:'center', marginTop:'20px' }}>
          <a href="/" style={{ fontSize:'13px', color:'#444', textDecoration:'none', transition:'color 0.15s' }} onMouseOver={e=>e.target.style.color='#888'} onMouseOut={e=>e.target.style.color='#444'}>
            ← Back to Assure
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) {
          div[style*="maxWidth: 420px"] { padding: 28px 20px !important; }
        }
      `}</style>
    </div>
  );
}
