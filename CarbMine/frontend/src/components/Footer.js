import React from 'react'
import { Link } from 'react-router-dom'
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'

const Footer = () => {
    return (
        <footer className="bg-gray-900 border-t border-gray-800">
            <div className="max-w-screen-xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="text-amber-400 text-2xl font-bold">Zerith</div>
                        <p className="mt-2 text-sm text-gray-400 max-w-sm">
                            Data-driven decision support for carbon emission prediction and decarbonization in Indian coal mines.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 tracking-wider">Explore</h4>
                            <ul className="mt-3 space-y-2 text-sm">
                                <li><Link to="/" className="text-gray-400 hover:text-amber-400 transition">Home</Link></li>
                                <li><Link to="/estimate" className="text-gray-400 hover:text-amber-400 transition">Estimate</Link></li>
                                <li><Link to="/calculation" className="text-gray-400 hover:text-amber-400 transition">Calculations</Link></li>
                                <li><Link to="/predict" className="text-gray-400 hover:text-amber-400 transition">Predict</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 tracking-wider">Resources</h4>
                            <ul className="mt-3 space-y-2 text-sm">
                                <li><a href="#docs" className="text-gray-400 hover:text-amber-400 transition">Docs</a></li>
                                <li><a href="#dataset" className="text-gray-400 hover:text-amber-400 transition">Dataset</a></li>
                                <li><a href="#reports" className="text-gray-400 hover:text-amber-400 transition">Reports</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact & Social */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-300 tracking-wider">Contact</h4>
                        <p className="mt-3 text-sm text-gray-400">support@zerith.app</p>
                        <div className="mt-4 flex items-center gap-4">
                            <a href="#" aria-label="GitHub" className="text-gray-400 hover:text-amber-400 transition"><FaGithub size={20} /></a>
                            <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-amber-400 transition"><FaLinkedin size={20} /></a>
                            <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-amber-400 transition"><FaTwitter size={20} /></a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-screen-xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
                    <p className="text-xs text-gray-500">Zerith — Building a low-carbon mining future</p>
                    <div className="mt-2 sm:mt-0 flex items-center gap-3 text-xs">
                        <a href="#privacy" className="text-gray-500 hover:text-amber-400 transition">Privacy</a>
                        <span className="text-gray-700">•</span>
                        <a href="#terms" className="text-gray-500 hover:text-amber-400 transition">Terms</a>
                        <span className="text-gray-700">•</span>
                        <a href="#status" className="text-gray-500 hover:text-amber-400 transition">Status</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer