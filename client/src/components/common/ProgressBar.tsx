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
        return <Clock className="h-4 w-4 text-notion-300" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 text-notion-blue animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-notion-green" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-notion-red" />;
      default:
        return <Clock className="h-4 w-4 text-notion-300" />;
    }
  };

  const getStatusText = () => {
    switch (store.status) {
      case 'pending':
        return 'Waiting...';
      case 'loading':
        return 'Searching...';
      case 'completed':
        return `${store.products?.length || 0} products`;
      case 'error':
        return store.error || 'Failed';
      default:
        return 'Waiting...';
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
    <div className={`flex items-center gap-notion-md p-notion-md rounded-notion-lg bg-notion-50 ${className}`}>
      <div className="flex-shrink-0">
        {getStatusIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-notion-sm font-medium text-notion-800 truncate">
            {store.name}
          </span>
          <span className="text-notion-xs text-notion-400 flex-shrink-0 ml-2">
            {getStatusText()}
          </span>
        </div>
        <div className="w-full bg-notion-200 rounded-full h-1 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressBarColor()}`}
            style={{ width: `${store.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
