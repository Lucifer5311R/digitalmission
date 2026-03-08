import React, { useState, useEffect, useRef } from 'react';
import { User as UserIcon, Mail, Phone, Camera, Lock, Save } from 'lucide-react';
import { profileApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { LoadingSpinner } from './LoadingSpinner';

export function ProfilePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const response = await profileApi.get();
      const profile = response.data.data;
      if (profile) {
        setName(profile.name || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
        setProfilePhoto(profile.profile_photo || null);
      }
    } catch {
      addToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  }

  function getPhotoUrl(photo: string | null): string | null {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    // Vite proxies /api but not /uploads — use origin-relative URL
    // In dev the backend runs on the same host via proxy
    return photo;
  }

  function getInitials(): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  async function handlePhotoClick() {
    fileInputRef.current?.click();
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      setUploadingPhoto(true);
      const response = await profileApi.uploadPhoto(file);
      const newPhoto = response.data.data?.profile_photo;
      if (newPhoto) {
        setProfilePhoto(newPhoto);
        setPhotoPreview(null);
      }
      addToast('Photo updated successfully', 'success');
    } catch {
      setPhotoPreview(null);
      addToast('Failed to upload photo', 'error');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');

    if (showPasswordSection && newPassword) {
      if (!currentPassword) {
        setPasswordError('Current password is required');
        return;
      }
      if (newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
    }

    try {
      setSaving(true);
      const data: { name?: string; email?: string; phone?: string; password?: string; current_password?: string } = {};
      if (name) data.name = name;
      if (email) data.email = email;
      data.phone = phone;
      if (showPasswordSection && newPassword) {
        data.password = newPassword;
        data.current_password = currentPassword;
      }

      await profileApi.update(data);
      addToast('Profile updated successfully', 'success');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setShowPasswordSection(false);
    } catch {
      addToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingSpinner className="mt-20" size="lg" />;
  }

  const displayPhoto = photoPreview || getPhotoUrl(profilePhoto);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Section */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={handlePhotoClick}
                className="relative w-24 h-24 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 min-w-[44px] min-h-[44px]"
              >
                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary-600">
                    {getInitials()}
                  </span>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                </div>
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </button>
              <div className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-1.5 shadow-md">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="text-center sm:text-left">
              <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              <p className="text-xs text-gray-400 mt-1">Click the avatar to change your photo</p>
            </div>
          </div>
        </Card>

        {/* Profile Fields */}
        <Card>
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-gray-400" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
            <div className="relative">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
              <Mail className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
              <Phone className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </Card>

        {/* Password Section */}
        <Card>
          <button
            type="button"
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="w-full flex items-center justify-between text-left min-h-[44px]"
          >
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" />
              Change Password
            </h3>
            <span className="text-sm text-primary-600">
              {showPasswordSection ? 'Cancel' : 'Change'}
            </span>
          </button>

          {showPasswordSection && (
            <div className="mt-4 space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Enter your current password"
                error={passwordError && !newPassword ? passwordError : undefined}
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Enter new password (min 6 chars)"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Confirm new password"
                error={passwordError && newPassword ? passwordError : undefined}
              />
            </div>
          )}
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" isLoading={saving} className="min-w-[120px]">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
