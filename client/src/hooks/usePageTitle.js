import { useEffect } from 'react';

const usePageTitle = (title) => {
  useEffect(() => {
    const appName = 'Real Stay - PG Finder';
    document.title = title ? `${title} | ${appName}` : appName;
  }, [title]);
};

export default usePageTitle;