import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import Papa from 'papaparse'
import './index.css'
import Home from './pages/Home'
import Preferences from './pages/Preferences'
import Results from './pages/Results'
import Landlord from './pages/Landlord'

export const defaultPreferences = { gender: 'male', budget: 30000, maxDistance: 3, roomType: 'any', facilities: [], safety: [], weights: { price: 35, distance: 25, facilities: 20, safety: 20 } }

function Layout({ children }) {
  return <><header className="border-b border-white/10 bg-slate-950/70 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"><Link to="/" className="text-xl font-black tracking-tight text-white">Smart <span className="text-cyan-300">Bodim</span></Link><nav className="flex gap-1 text-sm font-semibold"><NavLink to="/find" className={({isActive}) => `rounded-lg px-3 py-2 ${isActive?'bg-cyan-300/15 text-cyan-200':'text-slate-300 hover:bg-white/5'}`}>Find a place</NavLink><NavLink to="/landlord" className={({isActive}) => `rounded-lg px-3 py-2 ${isActive?'bg-cyan-300/15 text-cyan-200':'text-slate-300 hover:bg-white/5'}`}>List a place</NavLink></nav></div></header>{children}<footer className="mt-12 border-t border-white/10 bg-slate-950/60 py-5 text-center text-sm text-slate-400">Made for students near NSBM Green University, Pitipana.</footer></>
}

function App() {
  const [listings, setListings] = useState([]); const [loading, setLoading] = useState(true); const [preferences, setPreferences] = useState(defaultPreferences)
  useEffect(() => { Papa.parse('/listings.csv', { download: true, header: true, skipEmptyLines: true, complete: ({data}) => { setListings(data); setLoading(false) }, error: () => setLoading(false) }) }, [])
  return <Layout><Routes><Route path="/" element={<Home/>}/><Route path="/find" element={<Preferences preferences={preferences} setPreferences={setPreferences}/>}/><Route path="/results" element={<Results listings={listings} loading={loading} preferences={preferences} setPreferences={setPreferences}/>}/><Route path="/landlord" element={<Landlord onAdd={listing => setListings(old => [{...listing, listing_id: `NEW-${Date.now()}`}, ...old])}/>}/></Routes></Layout>
}
createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>)
