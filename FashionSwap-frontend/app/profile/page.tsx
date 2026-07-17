"use client";

import React, { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Protected from '../../components/common/Protected';
import { useAuth } from '@/context/AuthContext';
import { getMyListings, getOrders, getFavorites, deleteListing, markListingAsSold } from '@/lib/api';
import { whoAmI, updateProfile } from '@/lib/api/auth';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { ShoppingBag, Package, TrendingUp, Plus, ArrowUpRight, Mail, Shield, Lightbulb, Download, Edit2, X, Phone, MapPin, AlignLeft, Camera, Heart } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ListingCard from '@/components/ui/ListingCard';

export default function ProfilePage() {
  const router = useRouter();
  const { user, checkAuth } = useAuth();
  const { pushToast } = useToast();
  const [fullUser, setFullUser] = useState<any>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    bio: ''
  });
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; listingId: string | null }>({
    isOpen: false,
    listingId: null
  });
  const profileInitializedRef = useRef(false);
  const dataInitializedRef = useRef(false);

  // Fetch full user profile separately so it doesn't block listings
  useEffect(() => {
    // Guard against Strict Mode double invocation
    if (profileInitializedRef.current) return;
    profileInitializedRef.current = true;

    whoAmI()
      .then(res => {
        // whoAmI resolved
        const userData = res?.data ?? res;
        if (userData && typeof userData === 'object') {
          setFullUser(userData);
          setEditFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phone: userData.phone || '',
            location: userData.location || '',
            bio: userData.bio || ''
          });
        }
      })
      .catch((err) => {
        console.error("whoAmI catch error:", err);
        // fallback: use cookie user if available
        if (user) {
          setEditFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            location: user.location || '',
            bio: user.bio || ''
          });
        }
      })
      .finally(() => setProfileLoading(false));
  }, [user]);

  useEffect(() => {
    // Guard against Strict Mode double invocation
    if (dataInitializedRef.current) return;
    dataInitializedRef.current = true;

    (async () => {
      try {
        const [listingsRes, ordersRes, favRes] = await Promise.all([getMyListings(), getOrders(), getFavorites()]);
        setMyListings(Array.isArray(listingsRes?.data) ? listingsRes.data : Array.isArray(listingsRes) ? listingsRes : []);
        setOrders(Array.isArray(ordersRes?.data) ? ordersRes.data : Array.isArray(ordersRes) ? ordersRes : []);
        setFavorites(Array.isArray(favRes?.data) ? favRes.data : Array.isArray(favRes) ? favRes : []);
      } catch (e) {
        setMyListings([]);
        setOrders([]);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => ({
    listings: myListings.length,
    orders: orders.length,
    active: myListings.filter((item) => (item.status || '').toLowerCase() !== 'sold').length,
  }), [myListings, orders]);

  const exportData = () => {
    const u = fullUser || user;
    const userName = u?.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u?.name || 'User');
    
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(229, 115, 115); // Terracotta color
    doc.text('FashionSwap', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Personal Data Export • Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 28);
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(220, 220, 220);
    doc.line(14, 32, 196, 32);

    // Profile Information
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('Profile Information', 14, 45);

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`Name: ${userName}`, 14, 55);
    doc.text(`Email: ${u?.email || 'Not provided'}`, 14, 63);
    doc.text(`Phone: ${u?.phone || 'Not provided'}`, 14, 71);
    doc.text(`Location: ${u?.location || 'Not provided'}`, 14, 79);
    doc.text(`Role: ${u?.role || 'User'}`, 14, 87);

    // Listings
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text(`My Listings (${myListings.length})`, 14, 105);

    if (myListings.length > 0) {
      const tableData = myListings.map(item => [
        item.title || item.name || 'Untitled',
        item.category || 'N/A',
        item.askingPrice ? `Rs. ${item.askingPrice}` : 'N/A',
        item.status || 'Active'
      ]);

      autoTable(doc, {
        startY: 110,
        head: [['Title', 'Category', 'Price', 'Status']],
        body: tableData,
        headStyles: { fillColor: [229, 115, 115] },
        theme: 'striped'
      });
    } else {
      doc.setFontSize(11);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'italic');
      doc.text('No listings created yet.', 14, 115);
      doc.setFont('helvetica', 'normal');
    }

    doc.save('fashionswap-data-export.pdf');
  };

  const statCards = [
    { label: 'Listings', value: stats.listings, icon: ShoppingBag, bg: 'bg-terracotta/10', iconColor: 'text-terracotta' },
    { label: 'Active listings', value: stats.active, icon: TrendingUp, bg: 'bg-sage/10', iconColor: 'text-sage' },
    { label: 'Orders', value: stats.orders, icon: Package, bg: 'bg-sand', iconColor: 'text-charcoal-soft' },
  ];

  const displayUser = fullUser || user;
  const userName = displayUser?.firstName ? `${displayUser.firstName} ${displayUser.lastName || ''}`.trim() : (displayUser?.name || displayUser?.fullName || 'User');

  const openEditModal = () => {
    // Re-sync form with latest user data when opening
    const u = displayUser;
    setEditFormData({
      firstName: u?.firstName || '',
      lastName: u?.lastName || '',
      phone: u?.phone || '',
      location: u?.location || '',
      bio: u?.bio || ''
    });
    setAvatarPreview(null);
    setAvatarFile(null);
    setIsEditModalOpen(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayUser?._id && !displayUser?.id) return;
    setSaving(true);
    try {
      let payload: Record<string, string> = { ...editFormData };

      // If avatar selected, convert to base64 and include
      if (avatarFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(avatarFile);
        });
        payload.avatar = base64;
      }

      const res = await updateProfile(displayUser._id || displayUser.id, payload);
      pushToast({ title: 'Profile updated', description: 'Your profile has been updated successfully', tone: 'success' });
      const updatedUser = res.data || res;
      setFullUser(updatedUser);
      setEditFormData({
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        phone: updatedUser.phone || '',
        location: updatedUser.location || '',
        bio: updatedUser.bio || ''
      });
      setIsEditModalOpen(false);
      await checkAuth();
    } catch (err: any) {
      pushToast({ title: 'Failed to update', description: err.message, tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setDeleteConfirmation({ isOpen: true, listingId: id });
  };

  const executeDelete = async () => {
    const id = deleteConfirmation.listingId;
    if (!id) return;
    try {
      await deleteListing(id);
      setMyListings(prev => prev.filter(l => (l.id || l._id) !== id));
      pushToast({ title: 'Listing deleted', tone: 'success' });
    } catch (err: any) {
      pushToast({ title: 'Failed to delete listing', description: err.message, tone: 'error' });
    } finally {
      setDeleteConfirmation({ isOpen: false, listingId: null });
    }
  };

  const handleMarkAsSold = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    try {
      const res = await markListingAsSold(id);
      setMyListings(prev => prev.map(l => (l.id || l._id) === id ? { ...l, status: 'sold' } : l));
      pushToast({ title: 'Listing marked as sold', tone: 'success' });
    } catch (err: any) {
      pushToast({ title: 'Failed to mark as sold', description: err.message, tone: 'error' });
    }
  };

  return (
    <Protected>
      <div className="w-full px-6 py-10 md:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-terracotta/12 text-terracotta-dark mb-3">
              My account
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal" style={{ letterSpacing: '-0.02em' }}>
              Welcome back, {userName}
            </h1>
            <p className="mt-2 text-sm text-ink leading-relaxed max-w-md">
              Manage your listings, track your orders, and export your account data.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 border border-border bg-white px-5 py-2.5 rounded-[14px] text-sm font-medium text-charcoal-soft hover:bg-parchment-dark transition-colors"
            >
              Open settings
            </Link>
            <button
              onClick={exportData}
              className="inline-flex items-center gap-2 bg-terracotta text-white px-5 py-2.5 rounded-[14px] text-sm font-medium hover:bg-terracotta-dark transition-colors"
            >
              <Download size={15} />
              Export my data
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mb-10 grid gap-4 md:grid-cols-3">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="listing-card bg-white rounded-[20px] p-5 border border-border/60"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-ink">{stat.label}</p>
                <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${stat.bg}`}>
                  <stat.icon className={`h-[18px] w-[18px] ${stat.iconColor}`} />
                </div>
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-charcoal">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* My Listings */}
          <section className="bg-white rounded-[20px] p-6 border border-border/60 flex flex-col">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-charcoal" style={{ letterSpacing: '-0.01em' }}>My listings</h2>
              <Link
                href="/listing/create"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors"
              >
                <Plus size={15} />
                New listing
              </Link>
            </div>
            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-24 animate-pulse rounded-[14px] bg-sand-light" />
                ))}
              </div>
            ) : myListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 rounded-[14px] bg-parchment-dark/50 border border-border/40 p-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[14px] bg-terracotta/10">
                  <ShoppingBag className="h-6 w-6 text-terracotta" />
                </div>
                <p className="font-display font-semibold text-charcoal">No listings yet</p>
                <p className="mt-1 text-sm text-ink">Create your first listing to start selling.</p>
                <Link
                  href="/listing/create"
                  className="mt-5 inline-flex items-center gap-2 bg-terracotta text-white px-5 py-2.5 rounded-[14px] text-sm font-medium hover:bg-terracotta-dark transition-colors"
                >
                  <Plus size={15} /> Create listing
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {myListings.map((listing) => {
                  const id = listing.id || listing._id;
                  const displayImage = listing.image || (listing.images && listing.images[0]) || "";
                  const displayPrice = listing.askingPrice || listing.price || 0;
                  const status = (listing.status || 'active').toLowerCase();
                  
                  return (
                    <Link
                      key={id}
                      href={`/listing/${id}`}
                      className="group flex flex-col sm:flex-row gap-4 listing-card rounded-[16px] border border-border/60 bg-white p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Image Thumbnail */}
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-[12px] bg-sand-light relative">
                        {displayImage ? (
                          <img src={displayImage} alt={listing.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-ink/30">
                            <ShoppingBag className="h-8 w-8" />
                          </div>
                        )}
                        {status === 'sold' && (
                          <div className="absolute inset-0 bg-charcoal/40 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white bg-charcoal px-2 py-0.5 rounded-sm uppercase tracking-wider">Sold</span>
                          </div>
                        )}
                      </div>

                      {/* Listing Details */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-charcoal group-hover:text-terracotta transition-colors line-clamp-1">
                              {listing.title || listing.name || 'Untitled listing'}
                            </h3>
                            <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-ink opacity-0 transition-all group-hover:opacity-100 group-hover:text-terracotta" />
                          </div>
                          
                          <p className="mt-1 font-display font-bold text-charcoal">
                            {displayPrice ? `Rs. ${displayPrice.toLocaleString()}` : 'Price not set'}
                          </p>
                          
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                              status === 'sold' ? 'bg-ink/10 text-ink' : 'bg-sage/15 text-sage-dark'
                            }`}>
                              {status}
                            </span>
                            {listing.category && (
                              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-parchment-dark text-ink">
                                {listing.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/50">
                          {status !== 'sold' && (
                            <button
                              onClick={(e) => handleMarkAsSold(e, id)}
                              className="text-xs font-medium text-sage hover:text-sage-dark px-2 py-1 rounded-md hover:bg-sage/10 transition-colors"
                            >
                              Mark as Sold
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.preventDefault(); router.push(`/listing/${id}/edit`); }}
                            className="text-xs font-medium text-charcoal-soft hover:text-charcoal px-2 py-1 rounded-md hover:bg-parchment-dark transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => confirmDelete(e, id)}
                            className="text-xs font-medium text-terracotta hover:text-red-700 ml-auto px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Account details */}
          <section className="bg-white rounded-[20px] p-6 border border-border/60">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-charcoal" style={{ letterSpacing: '-0.01em' }}>Account details</h2>
              <button 
                onClick={openEditModal}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors px-3 py-1.5 rounded-lg hover:bg-terracotta/10"
              >
                <Edit2 size={14} /> Edit
              </button>
            </div>
            <div className="space-y-3">
              {/* Avatar */}
              <div className="flex items-center gap-4 rounded-[14px] bg-gradient-to-r from-terracotta/8 to-transparent p-4 border border-terracotta/15">
                <div className="relative flex-shrink-0">
                  {displayUser?.avatar ? (
                    <img src={displayUser.avatar} alt={userName} className="h-16 w-16 rounded-full object-cover ring-2 ring-terracotta/20" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-terracotta text-white flex items-center justify-center text-2xl font-bold ring-2 ring-terracotta/20">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-charcoal">{userName}</p>
                  <p className="text-xs text-ink mt-0.5 capitalize">{displayUser?.role || 'User'}</p>
                  <button type="button" onClick={openEditModal} className="mt-1.5 text-xs text-terracotta hover:underline font-medium">Change photo</button>
                </div>
              </div>

              {/* Name */}
              <div className="flex items-center gap-3 rounded-[14px] bg-parchment p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-terracotta/10">
                  <svg className="h-[18px] w-[18px] text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-ink">Name</p>
                  <p className="text-sm font-semibold text-charcoal">{userName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[14px] bg-parchment p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-sage/10">
                  <Mail className="h-[18px] w-[18px] text-sage" />
                </div>
                <div>
                  <p className="text-xs text-ink">Email</p>
                  <p className="text-sm font-semibold text-charcoal">{displayUser?.email || '—'}</p>
                </div>
              </div>
              
              {displayUser?.phone && (
                <div className="flex items-center gap-3 rounded-[14px] bg-parchment p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-blue-500/10">
                    <Phone className="h-[18px] w-[18px] text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-ink">Phone</p>
                    <p className="text-sm font-semibold text-charcoal">{displayUser.phone}</p>
                  </div>
                </div>
              )}

              {displayUser?.location && (
                <div className="flex items-center gap-3 rounded-[14px] bg-parchment p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-orange-500/10">
                    <MapPin className="h-[18px] w-[18px] text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-ink">Location</p>
                    <p className="text-sm font-semibold text-charcoal">{displayUser.location}</p>
                  </div>
                </div>
              )}

              {displayUser?.bio && (
                <div className="flex items-center gap-3 rounded-[14px] bg-parchment p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-purple-500/10">
                    <AlignLeft className="h-[18px] w-[18px] text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-ink">Bio</p>
                    <p className="text-sm font-semibold text-charcoal line-clamp-2">{displayUser.bio}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 rounded-[14px] bg-parchment p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-sand">
                  <Shield className="h-[18px] w-[18px] text-charcoal-soft" />
                </div>
                <div>
                  <p className="text-xs text-ink">Role</p>
                  <p className="text-sm font-semibold text-charcoal capitalize">{displayUser?.role || 'member'}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-[14px] bg-sage/8 border border-sage/20 p-4">
              <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-sage" />
              <p className="text-sm text-ink leading-relaxed">
                Keep your profile updated so buyers and sellers can trust your listings.
              </p>
            </div>
          </section>
        </div>

        {/* My Favorites */}
        <div className="mt-6">
          <section className="bg-white rounded-[20px] p-6 border border-border/60">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-charcoal flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
                <Heart size={20} className="text-terracotta" /> My Favorites
              </h2>
            </div>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-64 animate-pulse rounded-[14px] bg-sand-light" />
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Heart className="h-10 w-10 text-ink/20 mb-3" />
                <p className="text-ink">No favorited items yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {favorites.map((listing) => (
                  <Link
                    key={listing.id || listing._id}
                    href={`/listing/${listing.id || listing._id}`}
                  >
                    <ListingCard listing={{ ...listing, saved: true }} size="sm" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-parchment/50">
              <h3 className="font-display font-bold text-xl text-charcoal">Edit Profile</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-ink hover:text-charcoal hover:bg-black/5 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto max-h-[75vh]">
              <div className="space-y-5">

                {/* Avatar upload */}
                <div className="flex flex-col items-center gap-3 pb-4 border-b border-border/50">
                  <div className="relative group cursor-pointer">
                    {avatarPreview || displayUser?.avatar ? (
                      <img 
                        src={avatarPreview || displayUser?.avatar} 
                        alt="Avatar" 
                        className="h-20 w-20 rounded-full object-cover ring-4 ring-parchment-dark"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-terracotta/90 text-white flex items-center justify-center text-3xl font-bold ring-4 ring-parchment-dark">
                        {editFormData.firstName?.charAt(0)?.toUpperCase() || userName.charAt(0)}
                      </div>
                    )}
                    <label 
                      htmlFor="avatar-upload" 
                      className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera size={20} className="text-white" />
                    </label>
                    <input 
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-charcoal">Profile Photo</p>
                    <p className="text-xs text-ink">Click the photo to change it</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-charcoal">First Name</label>
                    <input 
                      type="text"
                      value={editFormData.firstName}
                      onChange={e => setEditFormData({...editFormData, firstName: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-[12px] border border-border bg-white text-charcoal focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-charcoal">Last Name</label>
                    <input 
                      type="text"
                      value={editFormData.lastName}
                      onChange={e => setEditFormData({...editFormData, lastName: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-[12px] border border-border bg-white text-charcoal focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-charcoal">Phone Number</label>
                  <input 
                    type="tel"
                    value={editFormData.phone}
                    onChange={e => setEditFormData({...editFormData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-[12px] border border-border bg-white text-charcoal focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-charcoal">Location</label>
                  <input 
                    type="text"
                    value={editFormData.location}
                    onChange={e => setEditFormData({...editFormData, location: e.target.value})}
                    placeholder="e.g. New York, NY"
                    className="w-full px-4 py-2.5 rounded-[12px] border border-border bg-white text-charcoal focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-charcoal">Bio</label>
                  <textarea 
                    value={editFormData.bio}
                    onChange={e => setEditFormData({...editFormData, bio: e.target.value})}
                    rows={3}
                    placeholder="Tell us a bit about yourself"
                    className="w-full px-4 py-2.5 rounded-[12px] border border-border bg-white text-charcoal focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-charcoal-soft border border-border rounded-[12px] hover:bg-parchment-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-terracotta rounded-[12px] hover:bg-terracotta-dark transition-colors disabled:opacity-70"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] w-full max-w-sm shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl text-charcoal mb-2">Delete Listing?</h3>
            <p className="text-sm text-ink mb-6">Are you sure you want to delete this listing? This action cannot be undone.</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={executeDelete}
                className="w-full px-5 py-2.5 text-sm font-medium text-white bg-terracotta rounded-[12px] hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteConfirmation({ isOpen: false, listingId: null })}
                className="w-full px-5 py-2.5 text-sm font-medium text-charcoal bg-parchment rounded-[12px] hover:bg-parchment-dark transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Protected>
  );
}
