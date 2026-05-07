// Simple shared store for pre-fetching and caching data
export const instituteStore = {
  data: null as any[] | null,
  subscribers: [] as ((data: any[] | null) => void)[],
  
  setData(newData: any[]) {
    this.data = newData;
    this.subscribers.forEach(sub => sub(newData));
  },
  
  subscribe(callback: (data: any[] | null) => void) {
    this.subscribers.push(callback);
    if (this.data) callback(this.data);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
};
