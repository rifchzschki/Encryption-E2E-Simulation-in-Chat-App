import { isRouteErrorResponse, useNavigate } from 'react-router';

interface ErrorProp {
  error: unknown;
}

export default function ErrorPage({ error }: ErrorProp) {
  const navigate = useNavigate();

  if (!isRouteErrorResponse(error)) return null;

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md text-center border border-gray-200">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-blue-100">
          <span className="text-blue-400 text-4xl font-bold">
            {error.status}
          </span>
        </div>

        <h2 className="text-2xl font-semibold text-blue-500 mb-2">
          {error.statusText || 'Oops!'}
        </h2>

        {error.data && (
          <p className="text-sm text-gray-500 mb-6">{String(error.data)}</p>
        )}

        <button
          onClick={() => navigate('/')}
          className="
            mt-2 px-5 py-2 rounded-lg font-medium
            bg-blue-400 text-white 
            hover:bg-blue-500 transition-colors
          "
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
