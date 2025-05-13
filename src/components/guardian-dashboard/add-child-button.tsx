import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function AddChildButton() {
  return (
    <Link
      href="/guardian/add-child"
      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      <Plus className="w-5 h-5" />
      Add Child
    </Link>
  );
}
