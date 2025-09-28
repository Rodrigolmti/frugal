import { FC } from 'react';
import { Store } from 'lucide-react';

interface StoreInfo {
  id: string;
  name: string;
  displayName: string;
  logo?: string;
  color: string;
}

interface StoreListProps {
  onStoreSelect?: (storeId: string) => void;
}

const StoreList: FC<StoreListProps> = ({ onStoreSelect }) => {
  const stores: StoreInfo[] = [
    {
      id: 'real-canadian-superstore',
      name: 'Real Canadian Superstore',
      displayName: 'Superstore',
      color: 'bg-red-500',
    },
    {
      id: 'safeway',
      name: 'Safeway',
      displayName: 'Safeway',
      color: 'bg-green-600',
    },
    {
      id: 'no-frills',
      name: 'No Frills',
      displayName: 'No Frills',
      color: 'bg-yellow-500',
    },
    {
      id: 'sobeys',
      name: 'Sobeys',
      displayName: 'Sobeys',
      color: 'bg-blue-600',
    },
  ];

  const handleStoreClick = (storeId: string) => {
    if (onStoreSelect) {
      onStoreSelect(storeId);
    }
  };

  return (
    <div className="space-y-notion-lg">
      <div className="text-center">
        <h3 className="text-notion-subheading mb-notion-sm">
          Supported Stores
        </h3>
        <p className="text-notion-caption text-notion-500">
          Compare prices across these popular grocery stores
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-notion-lg">
        {stores.map((store) => (
          <button
            key={store.id}
            onClick={() => handleStoreClick(store.id)}
            className="group flex flex-col items-center gap-notion-md p-notion-lg rounded-notion-lg border border-notion-200 hover:border-notion-300 hover:shadow-notion transition-all duration-200 bg-white min-w-[120px]"
          >
            <div className={`w-12 h-12 ${store.color} rounded-notion-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-200`}>
              {store.logo ? (
                <img 
                  src={store.logo} 
                  alt={store.name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <Store className="h-6 w-6" />
              )}
            </div>
            <div className="text-center">
              <div className="text-notion-sm font-medium text-notion-900 group-hover:text-notion-700">
                {store.displayName}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-notion-xs text-notion-400">
          Click on a store to see available products (coming soon)
        </p>
      </div>
    </div>
  );
};

export default StoreList;
