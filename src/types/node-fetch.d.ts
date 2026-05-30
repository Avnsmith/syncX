// Declaration for the 'node-fetch' module to satisfy TypeScript compiler
declare module 'node-fetch' {
  interface RequestInit {
    // Simplified version; you can extend as needed
    method?: string;
    headers?: Record<string, string> | Headers;
    body?: any;
    redirect?: 'follow' | 'error' | 'manual';
    signal?: AbortSignal;
  }
  interface Response {
    ok: boolean;
    status: number;
    json(): Promise<any>;
    text(): Promise<string>;
    // ...add other methods if needed
  }
  function fetch(url: string, init?: RequestInit): Promise<Response>;
  export default fetch;
}
