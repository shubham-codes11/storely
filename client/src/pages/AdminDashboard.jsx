import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Store,
  Star,
  Search,
  Filter,
  ArrowUpDown,
  PlusCircle,
  Eye,
  Check,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Shield,
  UserCheck,
  Lock,
  Mail,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import UserDetailsModal from '../components/UserDetailsModal';

export default function AdminDashboard() {
  const { user } = useAuth();

  // Metrics
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });

  // Directory listings & filters
  const [usersList, setUsersList] = useState([]);
  const [storesList, setStoresList] = useState([]);
  const [viewType, setViewType] = useState('users'); // 'users' or 'stores'
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'admin', 'user', 'store_owner'
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  // Form: Quick Add Entity (User or Store)
  const [entityType, setEntityType] = useState('user'); // 'user' or 'store'
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('user');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formOwnerId, setFormOwnerId] = useState('');

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formFieldErrors, setFormFieldErrors] = useState({});

  // View User Details Modal
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Load dashboard metrics
  const fetchDashboardMetrics = async () => {
    try {
      const res = await api.getAdminDashboard();
      setMetrics(res.metrics);
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
    }
  };

  // Load directory list
  const fetchDirectory = async () => {
    setLoading(true);
    try {
      if (viewType === 'users') {
        const res = await api.getAdminUsers({
          search,
          role: roleFilter,
          sortBy,
          sortOrder
        });
        setUsersList(res.users);
      } else {
        const res = await api.getAdminStores({
          search,
          sortBy,
          sortOrder
        });
        setStoresList(res.stores);
      }
    } catch (err) {
      console.error('Error fetching directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  useEffect(() => {
    fetchDirectory();
  }, [viewType, search, roleFilter, sortBy, sortOrder]);

  // Validation rules helper
  const isNameValid = formName.trim().length >= 20 && formName.trim().length <= 60;
  const isAddressValid = formAddress.trim().length > 0 && formAddress.trim().length <= 400;
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formEmail.trim());
  const isPassLengthValid = formPassword.length >= 8 && formPassword.length <= 16;
  const hasPassUpper = /[A-Z]/.test(formPassword);
  const hasPassSpecial = /[^A-Za-z0-9]/.test(formPassword);
  const isPasswordValid = isPassLengthValid && hasPassUpper && hasPassSpecial;

  // Handle Quick Add Entity submit
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormFieldErrors({});

    // Validations
    const errors = {};
    if (!isNameValid) errors.name = 'Name must be 20 to 60 characters long.';
    if (!isEmailValid) errors.email = 'Valid email is required.';
    if (!isAddressValid) errors.address = 'Address cannot exceed 400 characters.';

    if (entityType === 'user' && !isPasswordValid) {
      errors.password = 'Password must meet all complexity rules.';
    }

    if (Object.keys(errors).length > 0) {
      setFormFieldErrors(errors);
      return;
    }

    setFormLoading(true);

    try {
      if (entityType === 'user') {
        await api.createUser({
          name: formName,
          email: formEmail,
          password: formPassword,
          address: formAddress,
          role: formRole
        });
        setFormSuccess(`User "${formName}" created successfully!`);
      } else {
        await api.createStore({
          name: formName,
          email: formEmail,
          address: formAddress,
          category: formCategory,
          owner_id: formOwnerId ? Number(formOwnerId) : null
        });
        setFormSuccess(`Store "${formName}" created successfully!`);
      }

      // Reset form
      setFormName('');
      setFormEmail('');
      setFormAddress('');
      setFormPassword('');
      fetchDashboardMetrics();
      fetchDirectory();

      setTimeout(() => setFormSuccess(''), 4000);
    } catch (err) {
      setFormError(err.message || 'Failed to create entity.');
      if (err.errors) setFormFieldErrors(err.errors);
    } finally {
      setFormLoading(false);
    }
  };

  // View User Details Modal
  const handleViewUser = async (userId) => {
    try {
      const data = await api.getAdminUser(userId);
      setSelectedUserDetail(data);
      setIsDetailModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const roleBadgeStyles = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    store_owner: 'bg-teal-100 text-teal-700 border-teal-200',
    user: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            System Administrator Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full management of system users, registered stores, ratings, and role permissions.
          </p>
        </div>
      </div>

      {/* Top Metric Cards with Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Users */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Users
            </span>
            <span className="text-3xl font-black text-slate-900 tracking-tight mt-1 block">
              {metrics.totalUsers}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12% this month
            </span>
          </div>
          {/* Trend line SVG */}
          <div className="w-24 h-12">
            <svg viewBox="0 0 100 40" className="w-full h-full stroke-slate-700 fill-none stroke-[2.5]">
              <path d="M 0,35 Q 25,28 50,30 T 100,10" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Stores */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Stores
            </span>
            <span className="text-3xl font-black text-slate-900 tracking-tight mt-1 block">
              {metrics.totalStores}
            </span>
            <span className="text-[11px] font-semibold text-teal-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +4 new registered
            </span>
          </div>
          {/* Trend line SVG */}
          <div className="w-24 h-12">
            <svg viewBox="0 0 100 40" className="w-full h-full stroke-slate-400 fill-none stroke-[2.5]">
              <path d="M 0,32 Q 25,18 50,25 T 100,20" />
            </svg>
          </div>
        </div>

        {/* Card 3: Submitted Ratings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Submitted Ratings
            </span>
            <span className="text-3xl font-black text-teal-600 tracking-tight mt-1 block">
              {metrics.totalRatings}
            </span>
            <span className="text-[11px] font-semibold text-teal-700 flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5 fill-teal-500 text-teal-600" /> Active community engagement
            </span>
          </div>
          {/* Trend line SVG */}
          <div className="w-24 h-12">
            <svg viewBox="0 0 100 40" className="w-full h-full stroke-teal-500 fill-none stroke-[2.5]">
              <path d="M 0,38 Q 30,35 60,18 T 100,8" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Grid: Left "Quick Add Entity" & Right "System Directory" */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Add Entity */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Quick Add Entity
              </h3>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setEntityType('user')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    entityType === 'user' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  User
                </button>
                <button
                  type="button"
                  onClick={() => setEntityType('store')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    entityType === 'store' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Store
                </button>
              </div>
            </div>

            {/* Alert notices */}
            {formError && (
              <div className="p-3 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="p-3 mb-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleQuickAdd} className="space-y-3.5">
              {/* Name */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {entityType === 'user' ? 'Full Name' : 'Store Name'}
                  </label>
                  <span
                    className={`text-[10px] font-bold ${
                      isNameValid ? 'text-teal-600' : 'text-rose-500'
                    }`}
                  >
                    min 20, max 60 chars ({formName.length})
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={
                    entityType === 'user'
                      ? 'e.g. Jonathan Robert Reynolds Jr'
                      : 'e.g. Apex Electronics Superstore LLC'
                  }
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                    formFieldErrors.name ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500'
                  }`}
                />
                {formFieldErrors.name && (
                  <p className="text-[10px] text-rose-500 mt-1">{formFieldErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="contact@storely.com"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                    formFieldErrors.email ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500'
                  }`}
                />
                {formFieldErrors.email && (
                  <p className="text-[10px] text-rose-500 mt-1">{formFieldErrors.email}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Address
                  </label>
                  <span
                    className={`text-[10px] font-bold ${
                      formAddress.length > 400 ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  >
                    {formAddress.length}/400 max
                  </span>
                </div>
                <textarea
                  rows="2"
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Street, City, State, Country"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                    formFieldErrors.address ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500'
                  }`}
                />
                {formFieldErrors.address && (
                  <p className="text-[10px] text-rose-500 mt-1">{formFieldErrors.address}</p>
                )}
              </div>

              {/* User Only: Password & Role */}
              {entityType === 'user' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="e.g. Admin@2026"
                      className={`w-full px-3.5 py-2 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                        formFieldErrors.password ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500'
                      }`}
                    />
                    <div className="grid grid-cols-3 gap-1 mt-1.5 text-[9px] font-bold">
                      <span className={`p-1 rounded text-center ${isPassLengthValid ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-400'}`}>
                        {isPassLengthValid ? '✓' : '•'} 8-16 Chars
                      </span>
                      <span className={`p-1 rounded text-center ${hasPassUpper ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-400'}`}>
                        {hasPassUpper ? '✓' : '•'} 1 Uppercase
                      </span>
                      <span className={`p-1 rounded text-center ${hasPassSpecial ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-400'}`}>
                        {hasPassSpecial ? '✓' : '•'} 1 Special
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      User Role
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="user">Normal User</option>
                      <option value="admin">System Administrator</option>
                      <option value="store_owner">Store Owner</option>
                    </select>
                  </div>
                </>
              ) : (
                /* Store Only: Category & Owner */
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Food & Grocery">Food & Grocery</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Retail">General Retail</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Assign Store Owner (Optional)
                    </label>
                    <select
                      value={formOwnerId}
                      onChange={(e) => setFormOwnerId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="">None (Unassigned)</option>
                      {usersList
                        .filter((u) => u.role === 'store_owner')
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {formLoading
                    ? 'Saving...'
                    : entityType === 'user'
                    ? 'Save Account'
                    : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: System Directory */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
            {/* Header with Search and Role Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-extrabold text-slate-900">
                  System Directory
                </h3>
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                  <button
                    onClick={() => setViewType('users')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      viewType === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Users
                  </button>
                  <button
                    onClick={() => setViewType('stores')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      viewType === 'stores' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Stores
                  </button>
                </div>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by name, email, or role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Role Filter Pills when in Users view */}
            {viewType === 'users' && (
              <div className="flex flex-wrap items-center gap-1.5 mb-4 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px] mr-1">Role:</span>
                {[
                  { id: 'all', label: 'All Roles' },
                  { id: 'admin', label: 'Admins' },
                  { id: 'store_owner', label: 'Store Owners' },
                  { id: 'user', label: 'Normal Users' }
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setRoleFilter(pill.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      roleFilter === pill.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-3 w-8">
                      <input type="checkbox" className="rounded text-teal-600 focus:ring-0" />
                    </th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:text-slate-900"
                      onClick={() => {
                        setSortBy('name');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Name <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:text-slate-900"
                      onClick={() => {
                        setSortBy('email');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Email <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    {viewType === 'users' ? (
                      <>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Store Rating</th>
                      </>
                    ) : (
                      <>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Overall Rating</th>
                      </>
                    )}
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        Loading directory records...
                      </td>
                    </tr>
                  ) : viewType === 'users' ? (
                    usersList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400">
                          No users matched your criteria.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <input type="checkbox" className="rounded text-teal-600 focus:ring-0" />
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                                {u.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-900 truncate max-w-[140px]" title={u.name}>
                                {u.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 truncate max-w-[150px]" title={u.email}>
                            {u.email}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                                roleBadgeStyles[u.role] || 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {u.role.replace('_', ' ')}
                            </span>
                          </td>
                          {/* Display store owner rating */}
                          <td className="py-3 px-3">
                            {u.role === 'store_owner' ? (
                              <div className="flex items-center gap-1 font-bold text-amber-600">
                                <span>{u.store_rating > 0 ? `${u.store_rating} ★` : 'No rating yet'}</span>
                                {u.store_name && (
                                  <span className="text-[10px] text-slate-400 truncate max-w-[90px]" title={u.store_name}>
                                    ({u.store_name})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleViewUser(u.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    /* Stores List */
                    storesList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400">
                          No stores matched your criteria.
                        </td>
                      </tr>
                    ) : (
                      storesList.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <input type="checkbox" className="rounded text-teal-600 focus:ring-0" />
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-[10px]">
                                {s.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-900 truncate max-w-[150px]" title={s.name}>
                                {s.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 truncate max-w-[150px]" title={s.email}>
                            {s.email}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border">
                              {s.category || 'Retail'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1 font-bold text-amber-600">
                              <span>{s.overall_rating > 0 ? `${s.overall_rating} ★` : 'New'}</span>
                              <span className="text-[10px] text-slate-400">({s.total_ratings} reviews)</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-[11px] font-semibold text-slate-500">
                              {s.owner_name || 'No Owner'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal (opens when clicking "View Details") */}
      <UserDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        userDetails={selectedUserDetail}
      />
    </div>
  );
}
