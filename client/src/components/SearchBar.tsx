import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  loading?: boolean;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  loading = false, 
  placeholder = "Search for groceries (e.g., Cut Macaroni Pasta)" 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && !loading) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className="input-primary pl-12 pr-4 py-4 text-lg"
        />
        <button
          type="submit"
          disabled={!searchTerm.trim() || loading}
          className="absolute inset-y-0 right-0 pr-4 flex items-center"
        >
          <span className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Searching...' : 'Search'}
          </span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
