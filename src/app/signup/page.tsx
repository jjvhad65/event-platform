'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [about, setAbout] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedUsername = username.trim().toLowerCase().replace(/\s+/g, '-');

    if (!normalizedUsername || !email || !password) {
      setError('All fields are required.');
      return;
    }

    // 1. Sign up securely via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setError("User ID not returned.");
      return;
    }

    // 2. Create the profile in `profiles` table
    const { error: insertError } = await supabase.from('profiles').insert([
      {
        id: userId,
        username: normalizedUsername,
        email,
        role,
        about,
        rating: 0,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    // 3. Optionally store username locally
    localStorage.setItem('username', normalizedUsername);

    // 4. Redirect to profile page
    router.push(`/profile/${normalizedUsername}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Your Account</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-2 border rounded-md"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Role (e.g. Photographer)"
            className="w-full px-4 py-2 border rounded-md"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <textarea
            placeholder="About your business"
            className="w-full px-4 py-2 border rounded-md"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600"
          >
            Sign Up
          </button>
        </form>
      </div>
    </main>
  );
}
