'use client';

import { ReactNode, useState } from 'react';

import { handleUpload } from '@/app/actions/upload';

import { getExamDownloadUrl } from '../actions/exams';

export default function TestUploadPage(): ReactNode {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error' | 'loading'>(
    'idle',
  );
  const [message, setMessage] = useState('');
  const [viewKey, setViewKey] = useState(''); // To hold the key you want to view

  async function runTest(formData: FormData): Promise<void> {
    setStatus('uploading');
    setMessage('Sending to R2...');

    const result = await handleUpload(formData);

    if (result.error) {
      setStatus('error');
      setMessage(result.error);
    } else {
      setStatus('success');
      setMessage('File is in R2 and metadata is in Supabase!');
    }
  }

  async function handleViewFile(): Promise<void> {
    if (!viewKey) return alert('Paste a file key first!');

    setStatus('loading');
    const result = await getExamDownloadUrl(viewKey);

    if (result.url) {
      setStatus('success');
      window.open(result.url, '_blank'); // Open PDF/Image in new tab
    } else {
      setStatus('error');
      setMessage(result.error || 'Error fetching file');
    }
  }

  return (
    <div className="p-10 font-mono">
      <h1 className="text-xl font-bold mb-4">🧪 Upload Pipe Tester</h1>

      <form action={runTest} className="space-y-4 border p-6 max-w-md">
        <div>
          <label className="block text-xs uppercase font-bold text-gray-500">
            Course UUID (Paste from Supabase)
          </label>
          <input
            name="courseId"
            placeholder="e.g., 550e8400-e29b..."
            className="w-full border p-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs uppercase font-bold text-gray-500">Test File</label>
          <input type="file" name="file" required className="text-sm" />
        </div>

        <div className="flex gap-4">
          <input type="hidden" name="year" value="2026" />
          <input type="hidden" name="semester" value="spring" />
        </div>

        <button
          type="submit"
          disabled={status === 'uploading'}
          className="bg-black text-white px-4 py-2 hover:bg-gray-800 disabled:bg-gray-400"
        >
          {status === 'uploading' ? 'Testing...' : 'Run Upload Test'}
        </button>
      </form>

      <section className="border p-6 max-w-md bg-blue-50">
        <h1 className="text-xl font-bold mb-4">🔍 Part 2: View Tester</h1>
        <p className="text-xs text-gray-500 mb-4">Paste the key you got from the upload here:</p>

        <input
          type="text"
          placeholder="e.g. 1772528919432-112...pdf"
          value={viewKey}
          onChange={(e) => setViewKey(e.target.value)}
          className="w-full border p-2 text-xs mb-4"
        />

        <button
          onClick={handleViewFile}
          disabled={status === 'loading'}
          className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:bg-gray-400 w-full"
        >
          {status === 'loading' ? 'Generating Link...' : 'Generate & Open Link'}
        </button>
      </section>

      {message && (
        <div
          className={`mt-4 p-4 text-sm border ${status === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}
        >
          <strong>Status:</strong> {message}
        </div>
      )}
    </div>
  );
}
