import React from 'react';
import { Compass, Shield, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-900 bg-slate-950/90 py-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-cyan-400" />
              <span className="text-lg font-bold text-white">Smart Bodim</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intelligent context-aware boarding place recommendation system for university students. Powered by Python Weighted Scoring Algorithms & Haversine Distance calculations.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-200">System Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/recommendations" className="hover:text-cyan-300">Personalized Engine</Link></li>
              <li><Link to="/algorithm" className="hover:text-cyan-300">Mathematical Methodology</Link></li>
              <li><Link to="/evaluation" className="hover:text-cyan-300">Research Evaluation & Metrics</Link></li>
              <li><Link to="/student/preferences" className="hover:text-cyan-300">Preference Profile Config</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-200">User Roles</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/register?role=student" className="hover:text-cyan-300">Student Portal</Link></li>
              <li><Link to="/landlord/dashboard" className="hover:text-cyan-300">Landlord Listing Hub</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-cyan-300">Admin Approval Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-200">Research Artifact</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Context-aware decision support tool minimizing student search time and accommodation mismatch.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-900 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Smart Bodim Research Project. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
