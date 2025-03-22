import React from 'react';
// import { useNavigate } from 'react-router-dom';
import Link from 'next/link';

interface IssueDetailsModalProps {
  issue: any; // The selected issue data
  onClose: () => void; // Function to close the modal
}

const IssueDetailsModal: React.FC<IssueDetailsModalProps> = ({ issue, onClose }) => {
//  const navigate = useNavigate();

  if (!issue) return null;

  const handleDescriptionClick = () => {
    // navigate(`/issue/${issue.id}`);
  };

  // Format the date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format the currency
  const formatCurrency = (amount: string) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full mx-4 sm:mx-auto sm:max-w-lg max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold line-clamp-2">{issue.title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 -mr-2 sm:p-0 sm:mr-0 touch-manipulation"
            aria-label="Close"
          >
            <span className="text-xl sm:text-base">✕</span>
          </button>
        </div>
        
        {issue.photos && issue.photos.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <img
              src={issue.photos[0]}
              alt={issue.title}
              className="w-full h-40 sm:h-48 object-cover rounded"
            />
          </div>
        )}
        
        <div
          onClick={handleDescriptionClick}
          className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 active:bg-gray-300 transition"
        >
          <p className="font-medium text-gray-800 text-sm sm:text-base">{issue.description}</p>
          <Link href={`/issues/${issue.id}`}>
          <p className="text-xs sm:text-sm text-blue-600 mt-1 sm:mt-2">sell detail →</p>
            </Link>
        </div>

   
      </div>
    </div>
  );
};

export default IssueDetailsModal;