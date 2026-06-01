import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-white/95 backdrop-blur-md px-6 py-4 shadow-sm border-b border-slate-100">
      <div className="flex items-center space-x-3">
        <Link href="/" className="flex items-center space-x-2.5">
          <Image src="/logo.png" alt="SyncX Logo" width={36} height={36} className="rounded-xl shadow-sm" />
          <span className="text-xl font-bold text-slate-900 tracking-tight">SyncX</span>
        </Link>
      </div>
      <nav className="flex space-x-6">
        <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Dashboard</Link>
        <Link href="/wallet" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Wallet</Link>
        <Link href="/send" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Send</Link>
        <Link href="/activity" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Activity</Link>
        <Link href="/assistant" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">AI Assistant</Link>
        <Link href="/settings" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Settings</Link>
      </nav>
    </header>
  );
}
