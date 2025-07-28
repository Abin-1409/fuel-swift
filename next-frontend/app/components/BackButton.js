'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const BackButton = ({ 
  href = null, 
  onClick = null, 
  className = '',
  variant = 'default',
  showText = true 
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50';
      case 'filled':
        return 'bg-blue-600 text-white hover:bg-blue-700 shadow-md';
      case 'ghost':
        return 'text-gray-600 hover:text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm';
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${getVariantStyles()} ${className}`}
    >
      <motion.svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        initial={{ x: 0 }}
        whileHover={{ x: -2 }}
        transition={{ duration: 0.2 }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
      </motion.svg>
      {showText && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Back
        </motion.span>
      )}
    </motion.button>
  );
};

export default BackButton; 