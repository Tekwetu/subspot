import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <div className="flex justify-center gap-8">
        <a href="https://vite.dev" target="_blank" className="transition-transform hover:scale-110">
          <img 
            src={viteLogo} 
            className="h-24 p-6" 
            alt="Vite logo" 
          />
        </a>
        <a href="https://react.dev" target="_blank" className="transition-transform hover:scale-110">
          <img 
            src={reactLogo} 
            className="h-24 p-6 animate-spin-slow" 
            alt="React logo" 
          />
        </a>
      </div>
      <h1 className="text-5xl font-bold my-6">Vite + React + Tailwind</h1>
      <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md mb-6">
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg mb-4 transition-colors"
        >
          count is {count}
        </button>
        <p className="mt-4">
          Edit <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded">src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="text-gray-500 dark:text-gray-400">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
