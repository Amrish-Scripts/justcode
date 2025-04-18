import Link from "next/link";
import ProblemsTable from "@/components/ProblemsTable/ProblemsTable";
import Topbar from "@/components/Topbar/Topbar";
import { firestore } from "@/firebase/firebase";
import useHasMounted from "@/hooks/useHasMounted";
import { doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { ChangeEvent, useState, useEffect } from "react";

export default function Home() {
  const [inputs, setInputs] = useState({
    id: "",
    title: "",
    difficulty: "",
    category: "",
    videoId: "",
    link: "",
    order: 0,
    likes: 0,
    dislikes: 0,
    company: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [companies, setCompanies] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const hasMounted = useHasMounted();

  const handleDeleteCompanies = async () => {
    try {
      for (const company of selectedCompanies) {
        await deleteDoc(doc(firestore, 'companiesDetails', company));
      }
      setShowDeleteModal(false);
      setSelectedCompanies([]);
      window.location.reload();
    } catch (error) {
      console.error('Error deleting companies:', error);
    }
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesRef = collection(firestore, 'companiesDetails');
        const companiesSnapshot = await getDocs(companiesRef);
        const companiesList = companiesSnapshot.docs.map(doc => doc.data().name);
        setCompanies(companiesList || []);
        setLoadingProblems(false);
      } catch (error) {
        console.error('Error fetching companies:', error);
        setLoadingProblems(false);
      }
    };
    fetchCompanies();
  }, [setLoadingProblems]);

  if (!hasMounted) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newProblem = {
      ...inputs,
      order: Number(inputs.order),
      companies: inputs.company !== "general" ? [inputs.company] : []
    };

    await setDoc(doc(firestore, "problems", inputs.id), newProblem);
    setShowForm(false);
    window.location.reload();
  };

  return (
    <>
      <main className='bg-dark-layer-2 min-h-screen relative'>
        <Topbar setShowForm={() => setShowForm(true)} />
        <div className='max-w-[1200px] mx-auto px-6'>
          <div className='flex justify-between items-center mt-10 mb-5'>
            <h2 className='text-2xl text-gray-700 dark:text-gray-400 font-medium uppercase'>
              Companies
            </h2>
            <button
              onClick={() => setShowDeleteModal(true)}
              className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded'
            >
              Delete Companies
            </button>
          </div>

          {/* Delete Companies Modal */}
          {showDeleteModal && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
              <div className='bg-white p-6 rounded shadow-lg w-96'>
                <h3 className='text-lg font-medium mb-4 text-gray-900'>Select Companies to Delete</h3>
                <div className='max-h-60 overflow-y-auto'>
                  {companies.map((company) => (
                    <div key={company} className='flex items-center mb-2'>
                      <input
                        type='checkbox'
                        id={company}
                        value={company}
                        checked={selectedCompanies.includes(company)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCompanies([...selectedCompanies, company]);
                          } else {
                            setSelectedCompanies(selectedCompanies.filter(c => c !== company));
                          }
                        }}
                        className='mr-2'
                      />
                      <label htmlFor={company} className='text-gray-900'>{company}</label>
                    </div>
                  ))}
                </div>
                <div className='flex justify-end gap-2 mt-4'>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedCompanies([]);
                    }}
                    className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCompanies}
                    className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded'
                    disabled={selectedCompanies.length === 0}
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className='flex justify-center gap-4 mb-8 flex-wrap'>
            {companies.map((company) => (
              <Link
                key={company}
                href={`/company/${company.toLowerCase()}`}
                className='bg-dark-layer-1 hover:bg-dark-layer-2 text-gray-400 px-6 py-3 rounded'
              >
                {company}
              </Link>
            ))}
          </div>
          <h1 className='text-2xl text-center text-gray-700 dark:text-gray-400 font-medium uppercase mb-5'>
            Problem List
          </h1>
        </div>

        <div className='relative overflow-x-auto mx-auto px-6 pb-10'>
          {loadingProblems && (
            <div className='max-w-[1200px] mx-auto sm:w-7/12 w-full animate-pulse'>
              {[...Array(10)].map((_, idx) => (
                <LoadingSkeleton key={idx} />
              ))}
            </div>
          )}
          <table className='text-sm text-left text-gray-500 dark:text-gray-400 sm:w-7/12 w-full max-w-[1200px] mx-auto'>
            {!loadingProblems && (
              <thead className='text-xs text-gray-700 uppercase dark:text-gray-400 border-b '>
                <tr>
                  <th scope='col' className='px-1 py-3 w-0 font-medium'>Status</th>
                  <th scope='col' className='px-6 py-3 w-0 font-medium'>Title</th>
                  <th scope='col' className='px-6 py-3 w-0 font-medium'>Difficulty</th>
                  <th scope='col' className='px-6 py-3 w-0 font-medium'>Category</th>
                  <th scope='col' className='px-6 py-3 w-0 font-medium'>Solution</th>
                </tr>
              </thead>
            )}
            <ProblemsTable setLoadingProblems={setLoadingProblems} />
          </table>
        </div>

        {/* Add Problem Form (Only opened if triggered by admin via Topbar) */}
        {showForm && (
          <form
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
            onSubmit={handleSubmit}
          >
            <div className='bg-white p-6 rounded shadow-lg'>
              <input onChange={handleInputChange} type='text' name='id' placeholder='Problem ID' className='w-full mb-2 p-2 border rounded' />
              <input onChange={handleInputChange} type='text' name='title' placeholder='Title' className='w-full mb-2 p-2 border rounded' />
              <select 
                name='difficulty' 
                onChange={handleInputChange} 
                className='w-full mb-2 p-2 border rounded'
                value={inputs.difficulty}
              >
                <option value="">Select Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <input onChange={handleInputChange} type='text' name='category' placeholder='Category' className='w-full mb-2 p-2 border rounded' />
              <input onChange={handleInputChange} type='text' name='order' placeholder='Order' className='w-full mb-2 p-2 border rounded' />
              <input onChange={handleInputChange} type='text' name='videoId' placeholder='Video ID' className='w-full mb-2 p-2 border rounded' />
              <input onChange={handleInputChange} type='text' name='link' placeholder='Link' className='w-full mb-2 p-2 border rounded' />
              <select 
                name='company' 
                onChange={handleInputChange} 
                className='w-full mb-2 p-2 border rounded'
                value={inputs.company}
              >
                <option value="general">General</option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
              <button className='bg-blue-500 text-white px-4 py-2 rounded'>Save to DB</button>
              <button type='button' onClick={() => setShowForm(false)} className='ml-2 bg-red-500 text-white px-4 py-2 rounded'>Cancel</button>
            </div>
          </form>
        )}
      </main>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className='flex items-center space-x-12 mt-4 px-6'>
      <div className='w-6 h-6 shrink-0 rounded-full bg-dark-layer-1'></div>
      <div className='h-4 sm:w-52 w-32 rounded-full bg-dark-layer-1'></div>
      <div className='h-4 sm:w-52 w-32 rounded-full bg-dark-layer-1'></div>
      <div className='h-4 sm:w-52 w-32 rounded-full bg-dark-layer-1'></div>
      <span className='sr-only'>Loading...</span>
    </div>
  );
}