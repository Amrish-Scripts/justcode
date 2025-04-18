
import { auth, firestore } from "@/firebase/firebase";
import { DBProblem } from "@/utils/types/problem";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Topbar from "@/components/Topbar/Topbar";
import Link from "next/link";

type ProblemState = {
	likes: DBProblem[];
	dislikes: DBProblem[];
	starred: DBProblem[];
	solved: string[];
	loading: boolean;
};

const Dashboard = () => {
	const [user] = useAuthState(auth);
	const [problemState, setProblemState] = useState<ProblemState>({
		likes: [],
		dislikes: [],
		starred: [],
		solved: [],
		loading: true,
	});

	useEffect(() => {
		const getUserPreferences = async () => {
			if (!user) return;

			const userRef = doc(firestore, "users", user.uid);
			const userSnap = await getDoc(userRef);

			if (userSnap.exists()) {
				const userData = userSnap.data();
				const { likedProblems, dislikedProblems, starredProblems, solvedProblems } = userData;

				const [likedDocs, dislikedDocs, starredDocs] = await Promise.all([
					likedProblems?.length 
						? getDocs(query(collection(firestore, "problems"), where("id", "in", likedProblems)))
						: Promise.resolve({ docs: [] }),
					dislikedProblems?.length
						? getDocs(query(collection(firestore, "problems"), where("id", "in", dislikedProblems)))
						: Promise.resolve({ docs: [] }),
					starredProblems?.length
						? getDocs(query(collection(firestore, "problems"), where("id", "in", starredProblems)))
						: Promise.resolve({ docs: [] }),
				]);

				setProblemState({
					likes: likedDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DBProblem)),
					dislikes: dislikedDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DBProblem)),
					starred: starredDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DBProblem)),
					solved: solvedProblems || [],
					loading: false,
				});
			}
		};

		getUserPreferences();
	}, [user]);

	if (!user) return (
		<div className='flex items-center justify-center min-h-screen bg-dark-layer-2'>
			<div className='text-center text-gray-400'>
				<h2 className='text-2xl font-semibold mb-4'>Please login to view dashboard</h2>
				<Link href='/auth' className='text-brand-orange hover:underline'>
					Go to Login
				</Link>
			</div>
		</div>
	);

	const ProblemTable = ({ problems, title }: { problems: DBProblem[]; title: string }) => (
		<div className='rounded-lg bg-dark-layer-1 p-6 mb-8'>
			<h2 className='text-xl font-medium text-gray-300 mb-4 flex items-center'>
				{title}
				<span className='ml-2 text-sm text-gray-500'>({problems.length})</span>
			</h2>
			{problems.length === 0 ? (
				<p className='text-gray-500 italic'>No problems found</p>
			) : (
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead className='border-b border-dark-layer-2'>
							<tr>
								<th className='px-4 py-3 text-left text-gray-400 font-medium'>Title</th>
								<th className='px-4 py-3 text-left text-gray-400 font-medium'>Difficulty</th>
								<th className='px-4 py-3 text-left text-gray-400 font-medium'>Category</th>
							</tr>
						</thead>
						<tbody>
							{problems.map((problem) => (
								<tr key={problem.id} className='hover:bg-dark-layer-2 border-b border-dark-layer-2'>
									<td className='px-4 py-4'>
										<Link href={`/problems/${problem.id}`} className='text-gray-300 hover:text-brand-orange'>
											{problem.title}
										</Link>
									</td>
									<td className='px-4 py-4'>
										<span className={`px-3 py-1 rounded-full text-sm ${
											problem.difficulty === "Easy"
												? "bg-olive/20 text-olive"
												: problem.difficulty === "Medium"
												? "bg-dark-yellow/20 text-dark-yellow"
												: "bg-dark-pink/20 text-dark-pink"
										}`}>
											{problem.difficulty}
										</span>
									</td>
									<td className='px-4 py-4 text-gray-400'>{problem.category}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);

	const SolvedProblems = ({ solved }: { solved: string[] }) => (
		<div className='rounded-lg bg-dark-layer-1 p-6 mb-8'>
			<h2 className='text-xl font-medium text-gray-300 mb-4 flex items-center'>
				Solved Problems
				<span className='ml-2 text-sm text-gray-500'>({solved.length})</span>
			</h2>
			{solved.length === 0 ? (
				<p className='text-gray-500 italic'>No problems solved yet</p>
			) : (
				<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
					{solved.map((problemId) => (
						<Link
							href={`/problems/${problemId}`}
							key={problemId}
							className='bg-dark-layer-2 p-3 rounded hover:bg-dark-layer-3 transition-colors'
						>
							<div className='text-gray-300 font-medium'>{problemId}</div>
							<div className='text-green-500 text-sm mt-1'>Completed ✓</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);

	return (
		<div className='bg-dark-layer-2 min-h-screen'>
			<Topbar />
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
				<div className='flex items-center justify-between mb-8'>
					<h1 className='text-3xl font-bold text-gray-300'>Your Dashboard</h1>
					<div className='bg-dark-layer-1 px-4 py-2 rounded'>
						<span className='text-gray-400'>Total Problems Solved: </span>
						<span className='text-green-500 font-medium'>{problemState.solved.length}</span>
					</div>
				</div>

				{problemState.loading ? (
					<div className='flex items-center justify-center h-32'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange'></div>
					</div>
				) : (
					<>
						<SolvedProblems solved={problemState.solved} />
						<ProblemTable problems={problemState.starred} title="Starred Problems" />
						<ProblemTable problems={problemState.likes} title="Liked Problems" />
						<ProblemTable problems={problemState.dislikes} title="Disliked Problems" />
					</>
				)}
			</div>
		</div>
	);
};

export default Dashboard;
