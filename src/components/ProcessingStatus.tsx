import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface ProcessingStatusProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  progress?: number;
  errorMessage?: string;
  successMessage?: string;
}

export default function ProcessingStatus({
  status,
  progress = 0,
  errorMessage,
  successMessage,
}: ProcessingStatusProps) {
  if (status === 'idle') return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {status === 'loading' && (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
                <Loader className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Processing File
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Please wait while we analyze your log file...
              </p>
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm font-semibold text-blue-600">
                  {progress}%
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Success!
              </h3>
              <p className="text-sm text-gray-600">
                {successMessage || 'File processed successfully'}
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error Processing File
              </h3>
              <p className="text-sm text-gray-600">
                {errorMessage || 'An error occurred while processing your file'}
              </p>
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs text-red-700 text-left">
                  {errorMessage === 'File too large (max 500MB)'
                    ? 'Your file exceeds the 500MB limit. Please use a smaller file.'
                    : errorMessage === 'Invalid IIS log file format'
                    ? 'The file format is not recognized. Please ensure it is a valid IIS log file.'
                    : errorMessage === 'No data entries found in file'
                    ? 'The file appears to be empty or contains no valid log entries.'
                    : null}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
