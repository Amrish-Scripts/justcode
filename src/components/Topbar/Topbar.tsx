import { auth, firestore } from "@/firebase/firebase";
import Link from "next/link";
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Logout from "../Buttons/Logout";
import { useSetRecoilState } from "recoil";
import { authModalState } from "@/atoms/authModalAtom";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BsList } from "react-icons/bs";
import Timer from "../Timer/Timer";
import { useRouter } from "next/router";
import { problems } from "@/utils/problems";
import { Problem } from "@/utils/types/problem";
import { doc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";

type TopbarProps = {
	problemPage?: boolean;
	setShowForm?: () => void;
};

type CompanyFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (companyName: string) => void;
};

type CompanyDetails = {
  name: string;
  description: string;
  website: string;
  founded: string;
};

const CompanyForm: React.FC<CompanyFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    name: '',
    description: '',
    website: '',
    founded: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(companyDetails.name);

    // Store detailed company information
    const companyDocRef = doc(firestore, 'companiesDetails', companyDetails.name.toUpperCase());
    setDoc(companyDocRef, {
      ...companyDetails,
      name: companyDetails.name.toUpperCase(),
      createdAt: new Date().toISOString()
    });

    setCompanyDetails({
      name: '',
      description: '',
      website: '',
      founded: ''
    });
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCompanyDetails({
      ...companyDetails,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded shadow-lg'>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            name='name'
            value={companyDetails.name}
            onChange={handleInputChange}
            placeholder='Company Name'
            className='w-full mb-2 p-2 border rounded text-black'
            required
          />
          <textarea
            name='description'
            value={companyDetails.description}
            onChange={handleInputChange}
            placeholder='Company Description'
            className='w-full mb-2 p-2 border rounded text-black'
            rows={3}
          />
          <input
            type='url'
            name='website'
            value={companyDetails.website}
            onChange={handleInputChange}
            placeholder='Website URL'
            className='w-full mb-2 p-2 border rounded text-black'
          />
          <input
            type='text'
            name='founded'
            value={companyDetails.founded}
            onChange={handleInputChange}
            placeholder='Founded Year'
            className='w-full mb-2 p-2 border rounded text-black'
          />
          <div className='flex justify-end gap-2'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            >
              Add Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Topbar: React.FC<TopbarProps> = ({ problemPage, setShowForm }) => {
	const [user] = useAuthState(auth);
	const setAuthModalState = useSetRecoilState(authModalState);
	const router = useRouter();
	const [showCompanyForm, setShowCompanyForm] = useState(false);

	const isAdmin = user?.email === "admin@gmail.com";

	const handleProblemChange = (isForward: boolean) => {
		const { order } = problems[router.query.pid as string] as Problem;
		const direction = isForward ? 1 : -1;
		const nextProblemOrder = order + direction;
		const nextProblemKey = Object.keys(problems).find((key) => problems[key].order === nextProblemOrder);

		if (isForward && !nextProblemKey) {
			const firstProblemKey = Object.keys(problems).find((key) => problems[key].order === 1);
			router.push(`/problems/${firstProblemKey}`);
		} else if (!isForward && !nextProblemKey) {
			const lastProblemKey = Object.keys(problems).find(
				(key) => problems[key].order === Object.keys(problems).length
			);
			router.push(`/problems/${lastProblemKey}`);
		} else {
			router.push(`/problems/${nextProblemKey}`);
		}
	};

	const handleAddCompany = async (companyName: string) => {
		try {
			const companiesRef = doc(firestore, 'companies', 'list');
			const companiesDoc = await getDoc(companiesRef);
			
			if (!companiesDoc.exists()) {
				await setDoc(companiesRef, { names: [companyName.toUpperCase()] });
			} else {
				await updateDoc(companiesRef, {
					names: arrayUnion(companyName.toUpperCase())
				});
			}
      window.location.reload();
		} catch (error) {
			console.error('Error adding company:', error);
		}
	};

	return (
		<nav className='relative flex h-[50px] w-full shrink-0 items-center px-5 bg-dark-layer-1 text-dark-gray-7'>
			<div className={`flex w-full items-center justify-between ${!problemPage ? "max-w-[1200px] mx-auto" : ""}`}>
				<Link href='/' className='h-full flex items-center'>
					<Image src='/mylogofull.png' alt='Logo' height={30} width={150} />
				</Link>

				{problemPage && (
					<div className='flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2'>
						<div
							className='flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer'
							onClick={() => handleProblemChange(false)}
						>
							<FaChevronLeft />
						</div>
						<Link
							href='/'
							className='flex items-center gap-2 font-medium max-w-[170px] text-dark-gray-8 cursor-pointer'
						>
							<div>
								<BsList />
							</div>
							<p>Problem List</p>
						</Link>
						<div
							className='flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer'
							onClick={() => handleProblemChange(true)}
						>
							<FaChevronRight />
						</div>
					</div>
				)}

				<div className='flex items-center space-x-4 flex-1 justify-end'>
					<div className='flex items-center space-x-4'>
						<Link
							href='/dashboard'
							className='bg-dark-fill-3 py-1.5 px-3 cursor-pointer rounded text-brand-orange hover:bg-dark-fill-2'
						>
							Dashboard
						</Link>
						<a
							href='https://leetcode.com/problemset/'
							target='_blank'
							rel='noreferrer'
							className='bg-dark-fill-3 py-1.5 px-3 cursor-pointer rounded text-brand-orange hover:bg-dark-fill-2'
						>
							Leetcode
						</a>
					</div>
					{!user && (
						<Link
							href='/auth'
							onClick={() => setAuthModalState((prev) => ({ ...prev, isOpen: true, type: "login" }))}
						>
							<button className='bg-dark-fill-3 py-1 px-2 cursor-pointer rounded '>Sign In</button>
						</Link>
					)}
					{user && problemPage && <Timer />}
					{user && (
						<div className='cursor-pointer group relative'>
							<Image src='/avatar.png' alt='Avatar' width={30} height={30} className='rounded-full' />
							<div
								className='absolute top-10 left-2/4 -translate-x-2/4  mx-auto bg-dark-layer-1 text-brand-orange p-2 rounded shadow-lg
								z-40 group-hover:scale-100 scale-0
								transition-all duration-300 ease-in-out'
							>
								<p className='text-sm'>{user.email}</p>
							</div>
						</div>
					)}
					{user && <Logout />}

					{/* Admin-only Add Problem Button */}
					{user && isAdmin && setShowForm && (
						<button
							className='bg-dark-fill-3 py-1.5 px-3 cursor-pointer rounded text-brand-orange hover:bg-dark-fill-2'
							onClick={setShowForm}
						>
							Add Problem
						</button>
					)}
					<button
						className='bg-dark-fill-3 py-1.5 px-3 cursor-pointer rounded text-brand-orange hover:bg-dark-fill-2'
						onClick={() => setShowCompanyForm(true)}
					>
						Add Company
					</button>
				</div>
			</div>
			<CompanyForm
				isOpen={showCompanyForm}
				onClose={() => setShowCompanyForm(false)}
				onSubmit={handleAddCompany}
			/>
		</nav>
	);
};

export default Topbar;