import React, { useState, useRef, useEffect } from 'react';
import { IoLogOutOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { useFirebase } from '../context/Firebase';
import { FiMenu } from 'react-icons/fi';

const Navbar = ({ onToggleSidebar }) => {

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const menuRef = useRef(null);

    const firebase = useFirebase();
    const loggedIn = firebase.isLoggedIn;

    const handleClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuRef]);

    return (
        <nav className="flex flex-col lg:flex-row justify-between items-center fixed w-full p-3 bg-gray-900 text-gray-100 z-50 shadow-md">

            <div className="flex items-center justify-between w-full lg:w-auto">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggleSidebar}
                        className="text-amber-400 hover:text-amber-300 focus:outline-none"
                        aria-label="Toggle sidebar"
                    >
                        <FiMenu className="w-7 h-7" />
                    </button>
                    {/* <img src="/assets/logo.jpg" alt="Logo" className="h-12" /> */}
                    <p className="text-amber-400 text-2xl font-bold">Zerith</p>
                </div>
                <button
                    onClick={toggleNav}
                    className="lg:hidden text-gray-100 focus:outline-none"
                >
                    {isNavOpen ? (
                        // Close icon
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        // Hamburger menu icon
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    )}
                </button>
            </div>
            <ul className={`flex flex-col lg:flex-row lg:space-x-6 mt-3 lg:mt-0 lg:mr-6 ${isNavOpen ? 'block' : 'hidden'} lg:flex`}>
                <div className="flex flex-col lg:flex-row lg:justify-center lg:flex-grow lg:mr-0 ">
                    <li className="lg:mr-6 py-1">
                        <Link to="/" className="text-gray-200 text-lg hover:text-amber-400 transition">Home</Link>
                    </li>
                    <li className="lg:mr-6 py-1">
                        <Link to="/calculation" className="text-gray-200 text-lg hover:text-amber-400 transition">Calculation</Link>
                    </li>
                    <li className="lg:mr-6 py-1">
                        <Link to="/estimate" className="text-gray-200 text-lg hover:text-amber-400 transition">Estimate</Link>
                    </li>
                    <li className="lg:mr-6 py-1">
                        <Link to="/predict" className="text-gray-200 text-lg hover:text-amber-400 transition">Predict</Link>
                    </li>
                    <li className="lg:mr-6 py-1">
                        <Link to="/dashboard" className="text-gray-200 text-lg hover:text-amber-400 transition">Dashboard</Link>
                    </li>
                    <li className="lg:mr-6 py-1">
                        <Link to="/recommendations" className="text-gray-200 text-lg hover:text-amber-400 transition">Recommendations</Link>
                    </li>
                    <li className="lg:mr-6 py-1">
                        <Link to="/view" className="text-gray-200 text-lg hover:text-amber-400 transition">Display</Link>
                    </li>
                </div>
                <li className="relative lg:ml-auto py-1">
                    {!loggedIn && (
                        <Link
                            to="/login"
                            className="text-amber-400 text-lg hover:bg-amber-500 hover:text-black transition border border-amber-500 rounded-3xl py-2 px-3"
                        >
                            Login
                        </Link>
                    )}
                    {loggedIn && (
                        <div className='flex items-center'>
                            <div className='w-10 h-10 rounded-full flex items-center justify-center bg-amber-600 hover:bg-amber-500 cursor-pointer' onClick={handleClick}>
                                <img src='/assets/profile.jpg' alt="Profile" className="rounded-full" />
                            </div>
                            {isMenuOpen && (
                                <div ref={menuRef} className="absolute bg-gray-800 text-gray-100 rounded shadow-lg z-50 p-4 mt-3 right-0 w-48">
                                    <div className="flex flex-col items-start gap-4">
                                        <div className='flex flex-row space-x-2'>
                                            <Link to="/">
                                                <button className="text-amber-400 hover:text-red-400" onClick={firebase.handleLogout}>Logout</button>
                                            </Link>
                                            <Link to="/">
                                                <button className="text-amber-400 text-lg">
                                                    <IoLogOutOutline />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;