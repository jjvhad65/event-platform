'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function TestPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        setError(error.message);
      } else {
        setProfiles(data || []);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profiles</h1>
      {error && <p className="text-red-500">Error: {error}</p>}
      <ul className="list-disc pl-6">
        {profiles.map((profile, idx) => (
          <li key={idx}>
            {profile.username} — {profile.role}
          </li>
        ))}
      </ul>
    </div>
  );
}
