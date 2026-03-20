import React, { useState } from 'react';
import { Search, Loader2, ArrowRight } from 'lucide-react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  loading?: boolean;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  loading = false,
  placeholder = "Search for groceries (e.g., pasta, milk, bread...)"
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && !loading) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-5 w-5 text-notion-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-notion-400 group-focus-within:text-notion-blue transition-colors" />
          )}
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className="w-full h-14 pl-14 pr-36 bg-white border border-notion-200 rounded-notion-2xl text-notion-base text-notion-900 placeholder:text-notion-400 focus:outline-none focus:border-notion-blue focus:ring-2 focus:ring-notion-blue/10 transition-all duration-200 shadow-notion-md focus:shadow-notion-lg disabled:opacity-60"
        />
        <div className="absolute inset-y-0 right-2 flex items-center">
          <button
            type="submit"
            disabled={!searchTerm.trim() || loading}
            className={`h-10 px-notion-xl rounded-notion-xl font-medium text-notion-sm transition-all duration-200 flex items-center gap-notion-sm ${
              searchTerm.trim() && !loading
                ? 'bg-notion-blue text-white shadow-sm hover:bg-notion-blue-dark hover:shadow-md active:scale-[0.98]'
                : 'bg-notion-100 text-notion-400 cursor-not-allowed'
            }`}
          >
            {loading ? 'Searching...' : 'Search'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
