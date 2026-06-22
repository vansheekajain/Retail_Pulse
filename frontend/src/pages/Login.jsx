import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';

const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0F4C81 0%, #0A3260 60%, #030F22 100%)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Noto Sans', sans-serif",
  },
  topBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '12px 16px',
    gap: 8,
  },
  langBtn: (active) => ({
    padding: '6px 12px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    background: active ? '#fff' : 'rgba(255,255,255,0.12)',
    color: active ? '#0F4C81' : '#fff',
  }),
  hero: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 24px 40px',
  },
  brandBox: {
    marginBottom: 32,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  logoWrap: {
    width: 64,
    height: 64,
    background: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32,
  },
  appName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
    textAlign: 'center',
  },
  tagline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    margin: '4px 0 0',
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    background: '#fff',
    borderRadius: 24,
    padding: 24,
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
  heading: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1E293B',
    margin: '0 0 4px',
  },
  subheading: {
    fontSize: 13,
    color: '#94A3B8',
    margin: '0 0 20px',
  },
  fieldWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: (hasError) => ({
    width: '100%',
    height: 44,
    padding: '0 12px',
    borderRadius: 12,
    border: `1.5px solid ${hasError ? '#DC2626' : '#E2E8F0'}`,
    background: hasError ? '#FEF2F2' : '#F8FAFC',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }),
  pwWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 0,
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    margin: '2px 0 0',
  },
  submitBtn: (loading) => ({
    width: '100%',
    height: 48,
    background: loading ? '#6B9ED4' : '#0F4C81',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    marginTop: 20,
    fontFamily: 'inherit',
  }),
  switchRow: {
    textAlign: 'center',
    fontSize: 13,
    color: '#64748B',
    marginTop: 16,
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#0F4C81',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'inherit',
    textDecoration: 'underline',
  },
};

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate    = useNavigate();
  const location    = useLocation();
  const setAuth     = useAuthStore(s => s.setAuth);
  const destination = location.state?.from?.pathname || '/';

  const [mode,    setMode]    = useState('login');
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState({
    name: '', email: '', password: '', phone: '',
  });
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (mode === 'register' && !form.name.trim())
      e.name = t('errors.required');
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = t('errors.invalid_email');
    if (form.password.length < 8)
      e.password = t('errors.password_short');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await authService.login(form.email, form.password);
      } else {
        result = await authService.register({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
        });
      }
      setAuth(result.token, result.user);
      toast.success(
        mode === 'login'
          ? t('auth.success_login')
          : t('auth.success_register')
      );
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || '';
      if (msg.toLowerCase().includes('invalid'))
        toast.error(t('auth.error_invalid'));
      else if (msg.toLowerCase().includes('already'))
        toast.error(t('auth.error_email_taken'));
      else
        toast.error(t('auth.error_network'));
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={S.page}>

      {/* Language toggle */}
      <div style={S.topBar}>
        {['en', 'hi'].map(lang => (
          <button
            key={lang}
            style={S.langBtn(i18n.language === lang)}
            onClick={() => i18n.changeLanguage(lang)}
          >
            {lang === 'en' ? 'EN' : 'हि'}
          </button>
        ))}
      </div>

      <div style={S.hero}>

        {/* Brand */}
        <div style={S.brandBox}>
          <div style={S.logoWrap}>📈</div>
          <p style={S.appName}>{t('app_name')}</p>
          <p style={S.tagline}>{t('app_tagline')}</p>
        </div>

        {/* Card */}
        <div style={S.card}>
          <p style={S.heading}>
            {mode === 'login'
              ? t('auth.login_heading')
              : t('auth.register_heading')}
          </p>
          <p style={S.subheading}>
            {mode === 'login'
              ? t('auth.login_subheading')
              : t('auth.register_subheading')}
          </p>

          {/* Name - register only */}
          {mode === 'register' && (
            <div style={S.fieldWrap}>
              <label style={S.label}>{t('auth.name')}</label>
              <input
                type="text"
                placeholder={t('auth.name_placeholder')}
                value={form.name}
                onChange={e => set('name', e.target.value)}
                onKeyDown={onKey}
                style={S.input(!!errors.name)}
              />
              {errors.name && <p style={S.errorText}>{errors.name}</p>}
            </div>
          )}

          {/* Email */}
          <div style={S.fieldWrap}>
            <label style={S.label}>{t('auth.email')}</label>
            <input
              type="email"
              placeholder={t('auth.email_placeholder')}
              value={form.email}
              onChange={e => set('email', e.target.value)}
              onKeyDown={onKey}
              style={S.input(!!errors.email)}
            />
            {errors.email && <p style={S.errorText}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div style={S.fieldWrap}>
            <label style={S.label}>{t('auth.password')}</label>
            <div style={S.pwWrap}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder={t('auth.password_placeholder')}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                onKeyDown={onKey}
                style={{ ...S.input(!!errors.password), paddingRight: 40 }}
              />
              <button
                style={S.eyeBtn}
                type="button"
                onClick={() => setShowPw(v => !v)}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <p style={S.errorText}>{errors.password}</p>
            )}
          </div>

          {/* Phone - register only */}
          {mode === 'register' && (
            <div style={S.fieldWrap}>
              <label style={S.label}>{t('auth.phone')}</label>
              <input
                type="tel"
                placeholder={t('auth.phone_placeholder')}
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                onKeyDown={onKey}
                style={S.input(false)}
              />
            </div>
          )}

          {/* Submit */}
          <button
            style={S.submitBtn(loading)}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? (mode === 'login'
                  ? t('auth.logging_in')
                  : t('auth.registering'))
              : (mode === 'login'
                  ? t('auth.sign_in')
                  : t('auth.sign_up_free'))}
          </button>

          {/* Switch mode */}
          <p style={S.switchRow}>
            {mode === 'login'
              ? t('auth.no_account')
              : t('auth.have_account')}{' '}
            <button
              style={S.switchBtn}
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrors({});
              }}
            >
              {mode === 'login'
                ? t('auth.sign_up_free')
                : t('auth.sign_in')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}