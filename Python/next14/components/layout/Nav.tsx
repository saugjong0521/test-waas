'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/subpage1', label: 'Subpage 1' },
  { href: '/subpage2', label: 'Subpage 2' },
];

const Nav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex justify-center gap-6">
      {navItems.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`px-3 py-2 rounded-md transition ${
            pathname === href ? 'bg-white text-black font-bold' : 'hover:bg-gray-700'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default Nav;
