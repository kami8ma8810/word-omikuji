import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// テストごとにDOMをクリーンアップ
afterEach(() => {
  cleanup()
})

// IndexedDBのモック（IDBOpenDBRequest互換）
const mockIndexedDB = {
  open: (_name: string, _version?: number) => {
    const mockDB = {
      name: _name,
      version: _version || 1,
      objectStoreNames: { contains: () => false, length: 0 },
      createObjectStore: (_storeName: string) => ({
        createIndex: () => ({}),
        indexNames: { contains: () => false }
      }),
      transaction: (_storeNames: string | string[], _mode?: string) => ({
        objectStore: (_storeName: string) => ({
          get: (_key: any) => ({ 
            result: null,
            onsuccess: null,
            onerror: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
          }),
          add: (_value: any, _key?: any) => ({
            result: 1,
            onsuccess: null,
            onerror: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
          }),
          put: (_value: any, _key?: any) => ({
            result: 1,
            onsuccess: null,
            onerror: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
          }),
          delete: (_key: any) => ({ 
            result: undefined,
            onsuccess: null,
            onerror: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
          }),
          getAll: () => ({ 
            result: [],
            onsuccess: null,
            onerror: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
          }),
          getAllKeys: () => ({ 
            result: [],
            onsuccess: null,
            onerror: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
          }),
          count: () => ({ 
            result: 0,
            onsuccess: null,
            onerror: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
          }),
          index: (_name: string) => ({
            get: () => ({ result: null }),
            getAll: () => ({ result: [] })
          })
        }),
        oncomplete: null,
        onerror: null,
        onabort: null
      }),
      close: vi.fn(),
      deleteObjectStore: vi.fn()
    }
    
    // IDBOpenDBRequest互換オブジェクト
    const request: any = {
      result: mockDB,
      error: null,
      readyState: 'done',
      onsuccess: null,
      onerror: null,
      onblocked: null,
      onupgradeneeded: null,
      addEventListener: vi.fn((event: string, handler: any) => {
        if (event === 'success' && request.onsuccess) {
          setTimeout(() => handler({ target: request }), 0)
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }
    
    // 非同期でsuccessイベントを発火
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess({ target: request })
      }
    }, 0)
    
    return request
  },
  deleteDatabase: (_name: string) => {
    const request: any = {
      result: undefined,
      error: null,
      onsuccess: null,
      onerror: null,
      onblocked: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }
    
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess({ target: request })
      }
    }, 0)
    
    return request
  }
}

// @ts-ignore
global.indexedDB = mockIndexedDB

// localStorageのモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

global.localStorage = localStorageMock as any