export const commonStyles = {
  // Container styles
  container: "max-w-2xl mx-auto px-4",
  card: "bg-white border border-gray-100 rounded-lg p-4 transition-all duration-200 hover:border-gray-200",

  // Typography
  heading: {
    h1: "text-2xl font-medium text-gray-900 mb-6",
    h2: "text-xl font-medium text-gray-900 mb-4",
    h3: "text-lg font-medium text-gray-800 mb-3",
  },

  // Form elements
  input:
    "w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:border-gray-400 transition-colors duration-200 text-gray-700 placeholder-gray-400 text-sm",
  select:
    "w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:border-gray-400 transition-colors duration-200 text-gray-700 text-sm",

  // Buttons
  button: {
    primary:
      "bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed",
    secondary:
      "bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed",
    danger:
      "bg-white text-red-600 px-4 py-2 rounded-md border border-red-200 hover:bg-red-50 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed",
    success:
      "bg-white text-green-600 px-4 py-2 rounded-md border border-green-200 hover:bg-green-50 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed",
  },

  // List items
  listItem:
    "flex justify-between items-center border-b border-gray-100 py-3 last:border-b-0",

  // Loading and error states
  loadingContainer: "flex justify-center items-center min-h-[200px]",
  loadingText: "text-gray-500 text-sm",
  errorContainer: "flex justify-center items-center min-h-[200px]",
  errorText: "text-red-500 text-sm",

  // Animations
  fadeIn: "animate-fadeIn",
  slideIn: "animate-slideIn",
  scaleIn: "animate-scaleIn",
};
