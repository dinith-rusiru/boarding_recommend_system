import React, { useEffect, useState } from 'react';
import { adminService, AdminStats } from '../services/adminService';
import { BoardingPlace, User } from '../types';
import { ShieldCheck, CheckCircle2, XCircle, Clock, Users, Building2, Sparkles, Filter } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [listings, setListings] = useState<BoardingPlace[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'users'>('listings');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, listRes, usersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getListings(statusFilter === 'ALL' ? undefined : statusFilter),
        adminService.getUsers(),
      ]);
      setStats(statsRes);
      setListings(listRes);
      setUsers(usersRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleUpdateStatus = async (placeId: number, newStatus: string) => {
    try {
      await adminService.updateListingStatus(placeId, newStatus);
      fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Admin Approval & Oversight Portal</h1>
          <p className="text-xs text-slate-400">Review landlord submissions & monitor recommendation system activity</p>
        </div>
      </div>

      {/* Stats Counters */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[11px] text-slate-400">Students</span>
            <div className="mt-1 text-xl font-bold text-cyan-400">{stats.total_students}</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[11px] text-slate-400">Landlords</span>
            <div className="mt-1 text-xl font-bold text-amber-400">{stats.total_landlords}</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[11px] text-slate-400">Total Places</span>
            <div className="mt-1 text-xl font-bold text-white">{stats.total_boarding_places}</div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <span className="text-[11px] font-bold text-amber-300">Pending Review</span>
            <div className="mt-1 text-xl font-bold text-amber-400">{stats.pending_approvals}</div>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <span className="text-[11px] font-bold text-emerald-300">Active Approved</span>
            <div className="mt-1 text-xl font-bold text-emerald-400">{stats.active_listings}</div>
          </div>

          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
            <span className="text-[11px] font-bold text-rose-300">Rejected</span>
            <div className="mt-1 text-xl font-bold text-rose-400">{stats.rejected_listings}</div>
          </div>

          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
            <span className="text-[11px] font-bold text-indigo-300">Recommendations</span>
            <div className="mt-1 text-xl font-bold text-indigo-400">{stats.total_recommendations_computed}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-6 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'listings' ? 'border-rose-400 text-rose-300' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Listing Approval Queue ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'users' ? 'border-rose-400 text-rose-300' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Registered Users ({users.length})
        </button>
      </div>

      {activeTab === 'listings' && (
        <div className="space-y-4">
          {/* Status Filter buttons */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-400">Filter Queue:</span>
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
              No listings found with status "{statusFilter}".
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((p) => (
                <div key={p.id} className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">{p.title}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          p.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : p.status === 'PENDING' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{p.address} • Rs. {p.price.toLocaleString()}/mo • Landlord: {p.landlord_name}</p>
                    <p className="text-xs text-slate-300 line-clamp-2">{p.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {p.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateStatus(p.id, 'APPROVED')}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </button>
                    )}
                    {p.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateStatus(p.id, 'REJECTED')}
                        className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 px-4 font-bold text-cyan-400">#{u.id}</td>
                  <td className="py-3 px-4 font-semibold">{u.name}</td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      u.role === 'admin' ? 'bg-rose-500/20 text-rose-300' : u.role === 'landlord' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">{u.phone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
