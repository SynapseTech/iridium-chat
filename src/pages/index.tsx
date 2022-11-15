import type { NextPage } from "next";
import Head from "next/head";
import { signIn } from "next-auth/react";
import { faRocket } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Home: NextPage = () => {
	return (
		<div className="bg-slate-900 flex h-screen">
			<Head>
				<title>Iridium Chat</title>
				<meta name="description" content="A privacy-centric alternative to Discord for professional communications" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div className="max-w-[50rem] flex flex-col mx-auto w-full h-full">
				<header className="mb-auto flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full text-sm py-4">
					<nav className="w-full px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8" aria-label="Global">
						<div className="flex items-center justify-between">
							<a className="flex flex-none w-auto content-center text-xl font-semibold text-white" href="#" aria-label="Brand">
								<img className="h-8 w-8 inline" alt="iridium logo" src="/iridium_logo.svg" />
								Iridium Chat
							</a>
							<div className="sm:hidden">
								<button type="button" className="hs-collapse-toggle p-2 inline-flex justify-center items-center gap-2 rounded-md border border-gray-700 hover:border-gray-600 font-medium text-gray-300 hover:text-white shadow-sm align-middle focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-600 transition-all text-sm" data-hs-collapse="#navbar-collapse-with-animation" aria-controls="navbar-collapse-with-animation" aria-label="Toggle navigation">
									<svg className="hs-collapse-open:hidden w-4 h-4" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
										<path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
									</svg>
									<svg className="hs-collapse-open:block hidden w-4 h-4" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
										<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
									</svg>
								</button>
							</div>
						</div>
						<div id="navbar-collapse-with-animation" className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow sm:block">
							<div className="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:pl-5">
								{/* <a className="font-medium text-white" href="#" aria-current="page">Home</a>
								<a class="font-medium text-gray-400 hover:text-gray-500" href="#">Account</a>
								<a class="font-medium text-gray-400 hover:text-gray-500" href="#">Work</a>
								<a class="font-medium text-gray-400 hover:text-gray-500" href="#">Blog</a> */}
								<button onClick={() => signIn()} type="button" className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-white text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800 rounded-full">
									Sign in
								</button>
							</div>
						</div>
					</nav>
				</header>
				<main id="content" role="main">
					<div className="text-center py-10 px-4 sm:px-6 lg:px-8">
						<h1 className="block text-2xl font-bold text-white sm:text-4xl">Welcome to a secure, seamless chat</h1>
						<p className="mt-3 text-lg text-gray-300">Iridium Chat helps teams and professionals connect and do what matters most: get sh*t done.</p>
						<div className="mt-5 flex flex-col justify-center items-center gap-2 sm:flex-row sm:gap-3">
							<a className="w-full sm:w-auto inline-flex justify-center items-center gap-x-3.5 text-center bg-white shadow-sm text-sm font-medium rounded-md hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition py-3 px-4">
								<FontAwesomeIcon icon={faRocket} className='h-[1rem]' fixedWidth />
								Sign In / Open App
							</a>
							<a className="w-full sm:w-auto inline-flex justify-center items-center gap-x-3.5 text-center border border-2 border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 hover:text-white hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition py-3 px-4" href="" target="_blank" rel="noopener noreferrer">
								<FontAwesomeIcon icon={faGithub} className='h-[1rem]' fixedWidth />
								Star on GitHub
							</a>
						</div>
					</div>
				</main>
				<footer className="mt-auto text-center py-5">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<p className="text-sm text-gray-400">Crafted with love by <a className="text-white decoration-2 underline underline-offset-2 font-medium hover:text-gray-200 hover:decoration-gray-400" href="https://synapsetech.dev" target="_blank">Synapse Technologies</a></p>
					</div>
				</footer>
			</div>
		</div>
	);
};

export default Home;
