import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-gray-900/80 backdrop-blur-md px-4 py-2 shadow-md">
      <div className="flex items-center space-x-2">
        <Link href="/">
          <Image src="/logo.png" alt="SyncX Logo" width={40} height={40} className="rounded" />
        </Link>
        <span className="text-xl font-semibold text-white">SyncX</span>
      </div>
      <nav className="flex space-x-4">
        <Link href="/" className="text-sm font-medium text-gray-200 hover:text-white transition-colors">Home</Link>
        <Link href="/wallet" className="text-sm font-medium text-gray-200 hover:text-white transition-colors">Wallet</Link>
        <Link href="/send" className="text-sm font-medium text-gray-200 hover:text-white transition-colors">Send</Link>
        <Link href="/activity" className="text-sm font-medium text-gray-200 hover:text-white transition-colors">Activity</Link>
        <Link href="/assistant" className="text-sm font-medium text-gray-200 hover:text-white transition-colors">Assistant</Link>
        <Link href="/settings" className="text-sm font-medium text-gray-200 hover:text-white transition-colors">Settings</Link>
      </nav>
    </header>
  );
}
