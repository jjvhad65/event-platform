'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Image from 'next/image';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    about: '',
    website: '',
    instagram: '',
    avatar_url: '',
    gallery_urls: [] as string[],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('Not logged in');
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        setError('Profile not found.');
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setFormData({ ...formData, ...profileData });
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const uploadImageToStorage = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from(path)
      .upload(`${Date.now()}-${file.name}`, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage.from(path).getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  };

  const handleSave = async () => {
    setLoading(true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setError('Not logged in');
      setLoading(false);
      return;
    }

    const updates: any = { ...formData };

    try {
      // Upload avatar if changed
      if (avatarFile) {
        const avatarUrl = await uploadImageToStorage(avatarFile, 'avatars');
        updates.avatar_url = avatarUrl;
      }

      // Upload gallery images if any
      if (galleryFiles && galleryFiles.length > 0) {
        const uploadedUrls = [];
        for (const file of Array.from(galleryFiles)) {
          const url = await uploadImageToStorage(file, 'gallery');
          uploadedUrls.push(url);
        }
        updates.gallery_urls = [...(formData.gallery_urls || []), ...uploadedUrls];
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      router.push(`/profile/${formData.username}`);
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGalleryRemove = (urlToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      gallery_urls: prev.gallery_urls.filter((url) => url !== urlToRemove),
    }));
  };

  if (loading) return <p className="text-center p-6">Loading...</p>;
  if (error) return <p className="text-red-500 text-center p-6">{error}</p>;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

      {/* Avatar Preview */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Avatar</label>
        {formData.avatar_url && (
          <Image
            src={formData.avatar_url}
            alt="avatar"
            width={100}
            height={100}
            className="rounded-full mb-2"
          />
        )}
        <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
      </div>

      {/* Phone */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Phone</label>
        <input
          name="phone"
          className="border rounded p-2 w-full"
          value={formData.phone}
          onChange={handleInputChange}
        />
      </div>

      {/* About */}
      <div className="mb-4">
        <label className="block text-sm font-medium">About</label>
        <textarea
          name="about"
          className="border rounded p-2 w-full"
          rows={4}
          value={formData.about}
          onChange={handleInputChange}
        />
      </div>

      {/* Website */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Website</label>
        <input
          name="website"
          className="border rounded p-2 w-full"
          value={formData.website}
          onChange={handleInputChange}
        />
      </div>

      {/* Instagram */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Instagram</label>
        <input
          name="instagram"
          className="border rounded p-2 w-full"
          value={formData.instagram}
          onChange={handleInputChange}
        />
      </div>

      {/* Gallery Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Add Service Images</label>
        <input type="file" accept="image/*" multiple onChange={(e) => setGalleryFiles(e.target.files)} />
        <div className="grid grid-cols-2 gap-2 mt-2">
          {formData.gallery_urls?.map((url, idx) => (
            <div key={idx} className="relative">
              <Image src={url} alt={`Gallery ${idx}`} width={150} height={150} className="rounded" />
              <button
                onClick={() => handleGalleryRemove(url)}
                className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </main>
  );
}
