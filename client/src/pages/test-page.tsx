export default function TestPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-center text-green-600 mb-8">
        Test Page - Routing Working
      </h1>
      <div className="max-w-md mx-auto bg-green-50 p-6 rounded-lg">
        <p className="text-lg text-gray-800">
          If you can see this page, the routing system is working properly.
        </p>
        <p className="text-sm text-gray-600 mt-4">
          This confirms that the React application is loading correctly.
        </p>
      </div>
    </div>
  );
}