'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Image from 'next/image';

interface Profile {
  id: string;
  username: string;
  email: string;
  role: string;
  rating: number;
  about: string;
  avatar_url?: string;
  website?: string;
  instagram?: string;
  phone?: string;
  created_at: string;
}

export default function ProfilePage() {
  const params = useParams();
  const rawUsername = params?.username as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const normalized = rawUsername?.trim().toLowerCase().replace(/\s+/g, '-');

      console.log("🔍 Searching for normalized username:", normalized);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', normalized);

      console.log("🔁 Supabase response:", { data, error });

      if (error || !data || data.length === 0) {
        console.error(`❌ Profile not found for: "${normalized}"`);
        setError('Profile not found.');
        return;
      }

      const profileData = data[0];
      setProfile(profileData);
      setAvatarPreview(profileData.avatar_url || null);

      // 🔐 Securely fetch current logged-in user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authData?.user?.id === profileData.id) {
        setIsOwner(true);
      }
    };

    if (rawUsername) fetchProfile();
  }, [rawUsername]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!profile) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Avatar and Header */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <Image
            src={avatarPreview || '/default-avatar.png'}
            alt="Profile"
            width={100}
            height={100}
            className="rounded-full object-cover"
          />
          {isOwner && (
            <label className="mt-2 text-sm text-gray-600 cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">
              Upload Avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold capitalize">{profile.username}</h1>
          <p className="text-sm text-gray-500">{profile.role}</p>
          <p className="text-yellow-500">⭐⭐⭐⭐☆ ({profile.rating ?? 0})</p>
        </div>
      </div>

      {/* About & Contact */}
      <div className="mt-6">
        <h2 className="font-semibold text-lg mb-2">About</h2>
        <p className="text-gray-600">{profile.about}</p>
      </div>

      <div className="mt-6 space-x-4">
        {profile.website && (
          <a href={profile.website} target="_blank" className="text-blue-600 underline">Website</a>
        )}
        {profile.instagram && (
          <a href={profile.instagram} target="_blank" className="text-pink-600 underline">Instagram</a>
        )}
        {profile.email && (
          <a href={`mailto:${profile.email}`} className="text-green-600 underline">Email</a>
        )}
        {profile.phone && (
          <a href={`tel:${profile.phone}`} className="text-indigo-600 underline">Call</a>
        )}
      </div>

      <div className="mt-10">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md">
          Request Booking
        </button>
      </div>
    </div>
  );
}
