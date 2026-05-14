import { useEffect } from 'react';

const BASE_TITLE = 'ProblemSolver';

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE_TITLE}` : `${BASE_TITLE} — Real Problems. Real Engineers. Real Impact.`;
    return () => { document.title = BASE_TITLE; };
  }, [title]);
}
