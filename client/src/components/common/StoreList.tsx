import { FC } from 'react';
import { Store } from 'lucide-react';
import { CANADIAN_STORES } from '../../constants';

interface StoreListProps {
  onStoreSelect?: (storeId: string) => void;
}

const StoreList: FC<StoreListProps> = ({ onStoreSelect }) => {
  const handleStoreClick = (storeId: string) => {
    if (onStoreSelect) {
      onStoreSelect(storeId);
    }
  };

  return (
    <div className="space-y-notion-xl">
      <div className="text-center">
        <p className="text-notion-sm font-medium text-notion-500 uppercase tracking-wider">
          Supported Stores
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-notion-md">
        {CANADIAN_STORES.map((store) => (
          <button
            key={store.id}
            onClick={() => handleStoreClick(store.id)}
            className="group flex items-center gap-notion-sm py-notion-sm px-notion-lg rounded-notion-2xl border border-notion-200 hover:border-notion-300 bg-white hover:shadow-notion-md transition-all duration-200"
          >
            <div className={`w-8 h-8 ${store.color} rounded-notion-lg flex items-center justify-center text-white flex-shrink-0`}>
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-5 h-5 object-contain"
                />
              ) : (
                <Store className="h-4 w-4" />
              )}
            </div>
            <span className="text-notion-sm font-medium text-notion-700 group-hover:text-notion-900 transition-colors whitespace-nowrap">
              {store.displayName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StoreList;
