"use client";

/**
 * クライアントサイドでのみ利用可能な localStorage アクセスのためのユーティリティ関数
 */

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

/**
 * クライアントサイドかどうかを判定する関数
 */
export const isClient = typeof window !== 'undefined';
