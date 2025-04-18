
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase/firebase';
import { DBProblem } from '@/utils/types/problem';
import ProblemsTable from '@/components/ProblemsTable/ProblemsTable';
import Topbar from '@/components/Topbar/Topbar';

const CompanyProblemsPage = () => {
  const router = useRouter();
  const { name } = router.query;
  const [problems, setProblems] = useState<DBProblem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      if (!name) return;
      
      const q = query(
        collection(firestore, "problems"),
        where("companies", "array-contains", name.toString().toUpperCase())
      );
      
      const querySnapshot = await getDocs(q);
      const problems: DBProblem[] = [];
      querySnapshot.forEach((doc) => {
        problems.push({ id: doc.id, ...doc.data() } as DBProblem);
      });
      
      setProblems(problems);
      setLoading(false);
    };

    fetchProblems();
  }, [name]);

  return (
    <div className='bg-dark-layer-2 min-h-screen'>
      <Topbar />
      <h1 className='text-2xl text-center text-gray-700 dark:text-gray-400 font-medium uppercase mt-10 mb-5'>
        {name?.toString().toUpperCase()} Problems
      </h1>
      <div className='relative overflow-x-auto mx-auto px-6 pb-10'>
        <table className='text-sm text-left text-gray-500 dark:text-gray-400 sm:w-7/12 w-full max-w-[1200px] mx-auto'>
          {!loading && (
            <thead className='text-xs text-gray-700 uppercase dark:text-gray-400 border-b'>
              <tr>
                <th scope='col' className='px-1 py-3 w-0 font-medium'>Status</th>
                <th scope='col' className='px-6 py-3 w-0 font-medium'>Title</th>
                <th scope='col' className='px-6 py-3 w-0 font-medium'>Difficulty</th>
                <th scope='col' className='px-6 py-3 w-0 font-medium'>Category</th>
                <th scope='col' className='px-6 py-3 w-0 font-medium'>Solution</th>
              </tr>
            </thead>
          )}
          <ProblemsTable setLoadingProblems={setLoading} />
        </table>
      </div>
    </div>
  );
};

export default CompanyProblemsPage;
