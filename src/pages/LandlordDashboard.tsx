import React, { useEffect, useState } from 'react';
import { landlordService } from '../services/landlordService';
import { boardingService } from '../services/boardingService';
import { BoardingPlace, Facility } from '../types';
import { Building2, Plus, Edit, Trash2, Eye, Heart, ShieldCheck, Clock, AlertTriangle, CheckCircle, Upload, Image as ImageIcon, X, Link as LinkIcon } from 'lucide-react';
import { FacilitiesPicker } from '../components/FacilitiesPicker';

export const LandlordDashboard: React.FC = () => {
  const [listings, setListings] = useState<BoardingPlace[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 20000,
    address: '',
    latitude: 6.9000,
    longitude: 79.8588,
    accommodation_type: 'Single Room',
    occupancy_count: 1,
    gender_policy: 'Any',
    safety_rating: 4.5,
    study_environment_rating: 4.5,
    house_rules: '',
    contact_phone: '',
    facility_ids: [] as number[],
    image_urls: [''],
  });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const [facRes, listRes] = await Promise.all([
        boardingService.getFacilities(),
        landlordService.getMyListings(),
      ]);
      setFacilities(facRes);
      setListings(listRes);
    } catch (err) {
      console.error('Failed to load landlord listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      price: 20000,
      address: '',
      latitude: 6.9000,
      longitude: 79.8588,
      accommodation_type: 'Single Room',
      occupancy_count: 1,
      gender_policy: 'Any',
      safety_rating: 4.5,
      study_environment_rating: 4.5,
      house_rules: '',
      contact_phone: '',
      facility_ids: [],
      image_urls: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: BoardingPlace) => {
    setEditingId(p.id);
    setFormData({
      title: p.title,
      description: p.description,
      price: p.price,
      address: p.address,
      latitude: p.latitude,
      longitude: p.longitude,
      accommodation_type: p.accommodation_type,
      occupancy_count: p.occupancy_count,
      gender_policy: p.gender_policy,
      safety_rating: p.safety_rating,
      study_environment_rating: p.study_environment_rating,
      house_rules: p.house_rules || '',
      contact_phone: p.contact_phone || '',
      facility_ids: p.facilities.map((f) => f.id),
      image_urls: p.images.map((img) => img.image_url).concat(p.images.length === 0 ? [''] : []),
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          setFormData((prev) => ({
            ...prev,
            image_urls: [...prev.image_urls.filter((url) => url.trim() !== ''), base64Url],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await landlordService.deleteListing(id);
      fetchListings();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanImages = formData.image_urls.filter((url) => url.trim() !== '');
      const payload = { ...formData, image_urls: cleanImages };

      if (editingId) {
        await landlordService.updateListing(editingId, payload);
      } else {
        await landlordService.createListing(payload);
      }
      setIsModalOpen(false);
      fetchListings();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const approvedCount = listings.filter((l) => l.status === 'APPROVED').length;
  const pendingCount = listings.filter((l) => l.status === 'PENDING').length;
  const rejectedCount = listings.filter((l) => l.status === 'REJECTED').length;
  const totalViews = listings.reduce((sum, l) => sum + l.views_count, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Landlord Dashboard</h1>
          <p className="text-xs text-slate-400">Manage your boarding place listings & view status</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add New Boarding Place
        </button>
      </div>

      {/* Stats Counter Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
          <span className="text-xs text-slate-400">Total Listings</span>
          <div className="mt-1 text-2xl font-black text-white">{listings.length}</div>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 backdrop-blur">
          <span className="text-xs text-emerald-400 font-semibold">Approved (Active)</span>
          <div className="mt-1 text-2xl font-black text-emerald-300">{approvedCount}</div>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur">
          <span className="text-xs text-amber-400 font-semibold">Pending Approval</span>
          <div className="mt-1 text-2xl font-black text-amber-300">{pendingCount}</div>
        </div>

        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 backdrop-blur">
          <span className="text-xs text-rose-400 font-semibold">Rejected</span>
          <div className="mt-1 text-2xl font-black text-rose-300">{rejectedCount}</div>
        </div>

        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 backdrop-blur">
          <span className="text-xs text-cyan-400 font-semibold">Student Views</span>
          <div className="mt-1 text-2xl font-black text-cyan-300">{totalViews}</div>
        </div>
      </div>

      {/* Listings Table / Cards */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-base font-bold text-white">No Boarding Places Listed Yet</h3>
          <p className="mt-1 text-xs text-slate-400">Click below to create your first boarding place listing.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
          >
            Create First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((p) => (
            <div key={p.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white line-clamp-1">{p.title}</h3>
                  <span className="text-xs text-slate-400">{p.address}</span>
                </div>

                {/* Status Badge */}
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold border ${
                    p.status === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : p.status === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
                <span className="text-lg font-black text-amber-400">Rs. {p.price.toLocaleString()}/mo</span>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{p.views_count}</span>
                  <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-rose-400" />{p.favorites_count || 0}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => openEditModal(p)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  <Edit className="h-3.5 w-3.5 text-cyan-400" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Listing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Boarding Listing' : 'Add New Boarding Place'}</h2>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Listing Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Green View Luxury Student Boarding - Reid Avenue"
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the boarding place, distance to campus, atmosphere..."
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Monthly Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Accommodation Type</label>
                  <select
                    value={formData.accommodation_type}
                    onChange={(e) => setFormData({ ...formData, accommodation_type: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Single Room">Single Room</option>
                    <option value="Shared Room">Shared Room</option>
                    <option value="Annex">Annex</option>
                    <option value="Apartment">Apartment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Address Location</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="No. 45 Reid Avenue, Colombo 07"
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Latitude Coords</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                    className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Longitude Coords</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                    className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Facilities Available</label>
                <div className="mt-2">
                  <FacilitiesPicker
                    facilities={facilities}
                    selectedIds={formData.facility_ids}
                    onChange={(ids) => setFormData({ ...formData, facility_ids: ids })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Boarding Photos & Images</label>
                <div className="mt-2 space-y-3">
                  {/* File Upload Drop Area */}
                  <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/60 p-5 text-center transition-all hover:border-amber-500/50 hover:bg-slate-950">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                    />
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-200">
                      Click or drag & drop images to upload from your computer
                    </p>
                    <p className="text-[11px] text-slate-400">PNG, JPG, WEBP, GIF supported</p>
                  </div>

                  {/* Image Thumbnails */}
                  {formData.image_urls.filter((url) => url.trim() !== '').length > 0 && (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {formData.image_urls
                        .filter((url) => url.trim() !== '')
                        .map((url, idx) => (
                          <div key={idx} className="group relative h-20 overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
                            <img src={url} alt={`Upload ${idx + 1}`} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Web URL Option */}
                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[11px] font-medium text-slate-400">Or enter an Image Web URL:</span>
                    <input
                      type="url"
                      value={formData.image_urls[0] || ''}
                      onChange={(e) => setFormData({ ...formData, image_urls: [e.target.value] })}
                      placeholder="https://images.unsplash.com/..."
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                >
                  {editingId ? 'Update Listing' : 'Submit for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
