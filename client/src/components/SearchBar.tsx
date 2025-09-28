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
        <div className="absolute inset-y-0 left-0 pl-notion-lg flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 text-notion-400 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-notion-400" />
          )}
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className="input-notion pl-12 pr-32 py-notion-lg text-notion-lg placeholder:text-notion-400"
        />
        <button
          type="submit"
          disabled={!searchTerm.trim() || loading}
          className="absolute inset-y-0 right-0 pr-notion-md flex items-center"
        >
          <span className={`btn-notion-primary px-notion-lg py-notion-sm ${
            (!searchTerm.trim() || loading) ? 'opacity-50 cursor-not-allowed' : ''
          }`}>
            {loading ? 'Searching...' : 'Search'}
          </span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
