import { useState, useCallback } from 'react';

type Page = 'home' | 'profile';

export function useNavigate() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  return { currentPage, navigateTo };
}