'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useIntake } from '@/lib/intake-store';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const router = useRouter();
  const { clearIntake, completedSections, intake } = useIntake();

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all your intake data? This cannot be undone.')) {
      clearIntake();
      router.push('/');
    }
  };

  const sections = [
    { id: 'basics', label: 'The Basics', path: '/intake/basics' },
    { id: 'retirement', label: 'Retirement', path: '/intake/retirement' },
    { id: 'education', label: "Kids' Education", path: '/intake/education' },
    { id: 'career', label: 'Company & Career', path: '/intake/career' },
    { id: 'parents', label: 'Aging Parents', path: '/intake/parents' },
    { id: 'monthly', label: 'Monthly Life', path: '/intake/monthly' },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl">🌅</span>
            <span className="font-bold text-gray-700">Family Panorama</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500 text-sm">Settings</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your intake data and panorama.</p>
        </div>

        {/* Intake status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Intake Progress</h2>
          <div className="space-y-3">
            {sections.map((section) => {
              const isDone = completedSections.has(section.id);
              return (
                <div
                  key={section.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${isDone ? 'bg-green-500' : 'bg-gray-200'}`}
                    />
                    <span className="text-sm text-gray-700">{section.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium ${isDone ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {isDone ? 'Complete' : 'Incomplete'}
                    </span>
                    <Link href={section.path}>
                      <span className="text-xs text-teal-600 hover:text-teal-800 cursor-pointer transition-colors">
                        {isDone ? 'Update' : 'Start'}
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="space-y-3">
            {completedSections.size > 0 && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Regenerate panorama</p>
                  <p className="text-xs text-gray-400">
                    Re-run the AI with your current intake data
                  </p>
                </div>
                <Link href="/processing">
                  <Button variant="secondary" size="sm">
                    Regenerate
                  </Button>
                </Link>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-red-700">Clear all data</p>
                <p className="text-xs text-gray-400">
                  Remove all saved intake data and start fresh
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={handleReset}>
                Clear data
              </Button>
            </div>
          </div>
        </div>

        {/* Privacy note */}
        <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
          <p className="text-xs text-teal-800 leading-relaxed">
            <span className="font-semibold">Privacy: </span>
            All your data is stored locally on this device in your browser. Nothing is sent to our
            servers unless you generate a panorama or create a share link. We never sell your data.
          </p>
        </div>
      </main>
    </div>
  );
}
