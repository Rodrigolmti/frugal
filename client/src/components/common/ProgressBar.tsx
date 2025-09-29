import { FC } from 'react';
import { StoreProgress } from '../../types';
import { CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';

interface ProgressBarProps {
  store: StoreProgress;
  className?: string;
}

const ProgressBar: FC<ProgressBarProps> = ({ store, className = '' }) => {
  const getStatusIcon = () => {
    switch (store.status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-notion-400" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 text-notion-blue animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-notion-green" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-notion-red" />;
      default:
        return <Clock className="h-4 w-4 text-notion-400" />;
    }
  };

  const getStatusText = () => {
    switch (store.status) {
      case 'pending':
        return 'Waiting...';
      case 'loading':
        return 'Searching...';
      case 'completed':
        return `${store.products?.length || 0} products found`;
      case 'error':
        return store.error || 'Search failed';
      default:
        return 'Waiting...';
    }
  };

  const getStatusColor = () => {
    switch (store.status) {
      case 'pending':
        return 'text-notion-400';
      case 'loading':
        return 'text-notion-blue';
      case 'completed':
        return 'text-notion-green';
      case 'error':
        return 'text-notion-red';
      default:
        return 'text-notion-400';
    }
  };

  const getProgressBarColor = () => {
    switch (store.status) {
      case 'loading':
        return 'bg-notion-blue';
      case 'completed':
        return 'bg-notion-green';
      case 'error':
        return 'bg-notion-red';
      default:
        return 'bg-notion-200';
    }
  };

  return (
    <div className={`space-y-notion-xs ${className}`}>
      {/* Compact Store Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-notion-xs">
          {getStatusIcon()}
          <span className="text-notion-sm font-medium text-notion-900">
            {store.name}
          </span>
        </div>
        {store.status === 'loading' && (
          <span className="text-notion-xs text-notion-400">
            {store.progress}%
          </span>
        )}
      </div>

      {/* Compact Progress Bar */}
      <div className="w-full bg-notion-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out ${getProgressBarColor()}`}
          style={{ width: `${store.progress}%` }}
        >
          {/* Animated shimmer effect for loading state */}
          {store.status === 'loading' && (
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white via-transparent animate-pulse opacity-30"></div>
          )}
        </div>
      </div>

      {/* Status Text */}
      <div className="text-right">
        <span className={`text-notion-xs ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
