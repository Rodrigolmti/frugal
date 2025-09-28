import { StreamingEvent, StreamingSearchState, StoreProgress } from '../types';

export class StreamingSearchService {
  private eventSource: EventSource | null = null;
  private onUpdate: ((state: StreamingSearchState) => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private currentState: StreamingSearchState = {
    searchTerm: '',
    stores: {},
    isComplete: false,
    hasError: false
  };

  constructor() {
    this.handleMessage = this.handleMessage.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  public startSearch(
    searchTerm: string,
    onUpdate: (state: StreamingSearchState) => void,
    onError: (error: string) => void
  ): void {
    // Clean up any existing connection
    this.cleanup();

    this.onUpdate = onUpdate;
    this.onError = onError;
    
    // Initialize state
    this.currentState = {
      searchTerm,
      stores: {},
      isComplete: false,
      hasError: false
    };

    // Create EventSource connection
    const url = `/api/stores/search/stream?q=${encodeURIComponent(searchTerm)}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = this.handleMessage;
    this.eventSource.onerror = this.handleError;
  }

  public stopSearch(): void {
    this.cleanup();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data: StreamingEvent = JSON.parse(event.data);
      
      switch (data.type) {
        case 'progress':
          // Initialize stores with their initial state
          const storesMap: Record<string, StoreProgress> = {};
          data.stores.forEach(store => {
            storesMap[store.id] = store;
          });
          
          this.currentState = {
            ...this.currentState,
            searchTerm: data.searchTerm,
            stores: storesMap
          };
          break;

        case 'store_update':
          // Update store progress
          if (this.currentState.stores[data.storeId]) {
            this.currentState.stores[data.storeId] = {
              ...this.currentState.stores[data.storeId],
              status: data.status,
              progress: data.progress
            };
          }
          break;

        case 'store_complete':
          // Complete store search
          if (this.currentState.stores[data.storeId]) {
            this.currentState.stores[data.storeId] = {
              ...this.currentState.stores[data.storeId],
              status: data.status,
              progress: data.progress,
              products: data.products,
              error: data.error
            };
          } else {
            // Store wasn't initialized, create it
            this.currentState.stores[data.storeId] = {
              id: data.storeId,
              name: data.storeName,
              status: data.status,
              progress: data.progress,
              products: data.products,
              error: data.error
            };
          }
          break;

        case 'complete':
          this.currentState.isComplete = true;
          this.cleanup();
          break;

        case 'error':
          this.currentState.hasError = true;
          if (this.onError) {
            this.onError(data.error);
          }
          this.cleanup();
          return;
      }

      // Notify update
      if (this.onUpdate) {
        this.onUpdate({ ...this.currentState });
      }

    } catch (error) {
      console.error('Error parsing streaming data:', error);
      if (this.onError) {
        this.onError('Failed to parse search results');
      }
    }
  }

  private handleError(error: Event): void {
    console.error('EventSource error:', error);
    if (this.onError) {
      this.onError('Connection error occurred');
    }
    this.cleanup();
  }

  private cleanup(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  public getCurrentState(): StreamingSearchState {
    return { ...this.currentState };
  }
}

// Singleton instance
export const streamingSearchService = new StreamingSearchService();
