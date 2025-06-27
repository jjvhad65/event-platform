'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase"; // update path as per your project

function highlightMatch(text: string, query: string) {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.substring(0, index)}
      <mark className="bg-yellow-200 text-black">{text.substring(index, index + query.length)}</mark>
      {text.substring(index + query.length)}
    </>
  );
}

type Profile = {
  username: string;
  about?: string;
  tags?: string[]; // optional: you can store this in DB or compute from `about`
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase.from("profiles").select("username, about");
      if (!error && data) {
        const enhanced = data.map((p) => ({
          ...p,
          tags: p.about ? p.about.toLowerCase().split(" ") : [],
        }));
        setProfiles(enhanced);
      }
      setLoading(false);
    }
    fetchProfiles();
  }, []);

  const filtered = profiles.filter((profile) =>
    profile.username.toLowerCase().includes(query.toLowerCase()) ||
    profile.tags?.some((tag) => tag.includes(query.toLowerCase()))
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">The Home Base for Event Professionals</h1>
      <p className="text-lg text-gray-600 mb-6">
        A clean, powerful space to connect, collaborate, and create.
      </p>
      <Link href="/signup">
        <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800">
          Join the Network
        </button>
      </Link>

      {/* Search Bar */}
      <div className="mt-12 max-w-md w-full">
        <input
          type="text"
          placeholder="Search for services (e.g., wedding, decor)..."
          className="w-full px-4 py-2 border border-gray-300 rounded shadow"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {query.trim() !== "" && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Search Results</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : filtered.length > 0 ? (
            <ul className="space-y-4">
              {filtered.map((profile) => (
                <li key={profile.username} className="text-left">
                  <Link href={`/profile/${profile.username}`} className="text-blue-600 hover:underline text-lg font-medium">
                    {highlightMatch(profile.username.replace(/-/g, " "), query)}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    Tags:{" "}
                    {profile.tags?.map((tag, idx) => (
                      <span key={idx} className="mr-2">
                        {highlightMatch(tag, query)}
                      </span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No profiles found.</p>
          )}
        </div>
      )}
    </main>
  );
}
