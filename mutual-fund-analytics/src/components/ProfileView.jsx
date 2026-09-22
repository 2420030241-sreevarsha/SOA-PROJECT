import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  CreditCard,
  Target,
  FileCheck,
  Users,
  Edit3,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Lock,
  ExternalLink,
  Percent,
  TrendingUp,
  Globe,
  Coins
} from 'lucide-react';
import { storeClient } from '../services/storeClient.js';
import {
  SUPPORTED_COUNTRIES,
  SUPPORTED_CURRENCIES,
  formatCurrency,
  getCurrencyMeta
} from '../utils/currencyUtils.js';

export function ProfileView({
  profile,
  summary,
  currentUser,
  onProfileUpdate,
  onNavigateToSip,
  onNavigateToHoldings
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const activeCurrency = currentUser?.currency || profile.currency || 'INR';
  const activeCurrencySymbol = currentUser?.currencySymbol || profile.currencySymbol || '₹';
  const activeCountry = currentUser?.country || profile.country || 'India';
  const isDemo = Boolean(currentUser?.isDemo || profile.isDemo);

  // Form State for editing
  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    country: activeCountry,
    currency: activeCurrency,
    riskProfile: profile.riskProfile || 'Moderate',
    investmentHorizon: profile.investmentHorizon || '5 - 10 Years',
    primaryGoal: profile.primaryGoal || 'Wealth Creation & Capital Growth',
    annualIncome: profile.annualIncome || '₹15,00,000 - ₹25,00,000',
    monthlyTarget: profile.monthlyTarget || 25000,
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    pincode: profile.pincode || ''
  });

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    const countryObj = SUPPORTED_COUNTRIES.find((c) => c.name === selectedCountry);
    const updatedCurrency = countryObj ? countryObj.defaultCurrency : formData.currency;
    setFormData((prev) => ({
      ...prev,
      country: selectedCountry,
      currency: updatedCurrency
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    storeClient.updateCountryAndCurrency(formData.country, formData.currency);
    storeClient.userProfile = {
      ...storeClient.userProfile,
      ...formData
    };
    if (onProfileUpdate) onProfileUpdate();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      country: activeCountry,
      currency: activeCurrency,
      riskProfile: profile.riskProfile || 'Moderate',
      investmentHorizon: profile.investmentHorizon || '5 - 10 Years',
      primaryGoal: profile.primaryGoal || 'Wealth Creation & Capital Growth',
      annualIncome: profile.annualIncome || '₹15,00,000 - ₹25,00,000',
      monthlyTarget: profile.monthlyTarget || 25000,
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      pincode: profile.pincode || ''
    });
    setIsEditing(false);
  };

  const sipTargetPercentage = Math.min(
    100,
    Math.round(
      (summary.monthlySipAmount / (formData.monthlyTarget || profile.monthlyTarget || 25000)) * 100
    ) || 0
  );

  return (
    <div id="view-profile" className="max-w-5xl mx-auto space-y-6">
      {/* Toast Banner */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center gap-2 text-xs shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile, country and currency preferences saved successfully to your account!</span>
        </div>
      )}

      {/* Demo Account Indicator Banner */}
      {isDemo && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-xs text-indigo-900">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold uppercase tracking-wider text-[10px]">
              DEMO ACCOUNT
            </span>
            <span>
              You are currently viewing <strong>Ananya Sharma’s ₹1.1L sample portfolio</strong>. Changes in this demo account do not affect other registered accounts.
            </span>
          </div>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md ring-4 ring-white/10">
                {profile.name
                  ? profile.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()
                  : 'MF'}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-white">{profile.name}</h1>
                  {isDemo ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                      <Sparkles className="w-3.5 h-3.5" />
                      Demo Investor
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Account
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-3 flex-wrap">
                  <span>
                    Investor ID: <strong className="text-white font-mono">{profile.investorId || 'INV-USR'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Country: <strong className="text-white">{activeCountry}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Currency: <strong className="text-white">{activeCurrency} ({activeCurrencySymbol})</strong>
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  type="button"
                  id="edit-profile-btn"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl transition border border-white/20 flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile & Preferences</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50 border-b border-slate-200">
          <div className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Country & Currency
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">{activeCountry}</span>
            </div>
            <span className="text-xs text-indigo-600 font-semibold mt-0.5 block">
              {activeCurrency} ({activeCurrencySymbol})
            </span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Risk Tolerance
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">{profile.riskProfile}</span>
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">{profile.investmentHorizon}</span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Monthly SIP Target
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">
                {formatCurrency(profile.monthlyTarget || 25000, activeCurrency, activeCurrencySymbol)}
              </span>
            </div>
            <span className="text-xs text-slate-600 mt-0.5 block font-medium">
              {formatCurrency(summary.monthlySipAmount, activeCurrency, activeCurrencySymbol)} active ({sipTargetPercentage}%)
            </span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Bank Mandate
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">
                {profile.mandateStatus === 'Inactive' ? 'Not Set Up' : 'Active eNACH'}
              </span>
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">
              {profile.mandateLimit
                ? `Limit: ${formatCurrency(profile.mandateLimit, activeCurrency, activeCurrencySymbol)}/cycle`
                : 'No active mandate'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Edit Form OR Read-Only Overview */}
      {isEditing ? (
        <form
          onSubmit={handleSave}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Edit Investor Profile & Settings</h2>
              <p className="text-xs text-slate-500">
                Update your country, preferred display currency, contact details, and financial goals.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="save-profile-btn"
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          {/* COUNTRY & CURRENCY SELECTION SECTION */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Country and Currency Preferences</span>
            </div>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Select your residence country and preferred currency. All portfolio valuations, transactions, charts, and SIP amounts will be automatically formatted using this currency.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="font-semibold text-slate-800 text-xs block mb-1">
                  Country / Region
                </label>
                <select
                  id="select-country"
                  value={formData.country}
                  onChange={handleCountryChange}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-800 text-xs block mb-1">
                  Preferred Currency
                </label>
                <select
                  id="select-currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {SUPPORTED_CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">Risk Profile</label>
              <select
                value={formData.riskProfile}
                onChange={(e) => setFormData({ ...formData, riskProfile: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Conservative">Conservative (Capital preservation priority)</option>
                <option value="Moderate">Moderate (Balanced debt and equity)</option>
                <option value="Moderately High">Moderately High (Focus on capital growth)</option>
                <option value="Aggressive">Aggressive (High equity allocation)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">Investment Horizon</label>
              <select
                value={formData.investmentHorizon}
                onChange={(e) => setFormData({ ...formData, investmentHorizon: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="< 3 Years">&lt; 3 Years (Short Term)</option>
                <option value="3 - 5 Years">3 - 5 Years (Medium Term)</option>
                <option value="5 - 10 Years">5 - 10 Years (Long Term)</option>
                <option value="10+ Years">10+ Years (Retirement / Multi-decade)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Monthly SIP Target ({getCurrencyMeta(formData.currency).symbol})
              </label>
              <input
                type="number"
                value={formData.monthlyTarget}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyTarget: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold text-slate-800 block mb-1">Primary Investment Goal</label>
              <input
                type="text"
                value={formData.primaryGoal}
                onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold text-slate-800 block mb-1">Residential Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">State & Postal PIN</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity & Account Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900">Account & Verification</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                {isDemo ? 'Demo Verified' : 'Active Account'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Residence Country</span>
                <span className="font-medium text-slate-900">{activeCountry}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Active Currency</span>
                <span className="font-medium text-indigo-600">
                  {activeCurrency} ({activeCurrencySymbol})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Registered Email</span>
                <span className="font-medium text-slate-900">{profile.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Mobile Number</span>
                <span className="font-medium text-slate-900">{profile.phone || 'Not Provided'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Location</span>
                <span className="font-medium text-slate-900">
                  {profile.city ? `${profile.city}, ${profile.state}` : activeCountry}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Financial Details */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900">Linked Bank & Mandate</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-200">
                Banking Details
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Bank Name</span>
                <span className="font-medium text-slate-900">{profile.bankName || 'Primary Savings Bank'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Account Number</span>
                <span className="font-mono font-medium text-slate-900">
                  {profile.accountNumberMasked || '•••• •••• •••• 4092'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Mandate Status</span>
                <span className="font-medium text-slate-900">
                  {profile.mandateStatus || 'Active Auto-Debit'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Mandate Limit</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(profile.mandateLimit || 50000, activeCurrency, activeCurrencySymbol)} / cycle
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Nominee</span>
                <span className="font-medium text-slate-900">
                  {profile.nomineeName ? `${profile.nomineeName} (${profile.nomineeRelation})` : 'Primary Family Member'}
                </span>
              </div>
            </div>
          </div>

          {/* Investment Objectives & SIP Tracker */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 md:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900">Portfolio Strategy & Target</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onNavigateToSip}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 cursor-pointer"
                >
                  Manage Active SIPs →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 block">Primary Strategy</span>
                <div className="font-semibold text-slate-900">{profile.primaryGoal}</div>
                <p className="text-slate-500">Horizon: {profile.investmentHorizon}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 block">Risk Profile</span>
                <div className="font-semibold text-slate-900">{profile.riskProfile}</div>
                <p className="text-slate-500">Income: {profile.annualIncome}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 block">Monthly SIP Target Progress</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {formatCurrency(summary.monthlySipAmount, activeCurrency, activeCurrencySymbol)}
                  </span>
                  <span className="text-slate-600 font-medium">
                    {sipTargetPercentage}% of {formatCurrency(profile.monthlyTarget || 25000, activeCurrency, activeCurrencySymbol)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${sipTargetPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
