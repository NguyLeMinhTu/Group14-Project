import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ className }) => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-gray-700 hover:text-gray-900 font-medium ${className || ''}`}
            aria-label="Quay lại"
        >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
        </button>
    );
};

export default BackButton;
