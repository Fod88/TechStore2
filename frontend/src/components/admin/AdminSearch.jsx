import { Search } from 'lucide-react';

export default function AdminSearch({ value, onChange, placeholder, label }) {
  return (
    <div className="admin-search">
      <Search size={17} aria-hidden="true" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label ?? placeholder} />
    </div>
  );
}
