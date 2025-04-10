import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * This is a diagnostic component to test if the RAWG API connection is working.
 * Add component to Home.tsx temporarily for debugging.
 */
const ApiTest: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>('');
    const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);
    const [testOutput, setTestOutput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [customKey, setCustomKey] = useState<string>('');

    // Check if the API key exists in environment
    useEffect(() => {
        const key = import.meta.env.VITE_RAWG_API_KEY;
        if (key) {
        // Mask the API key for display
        const maskedKey = `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
        setApiKey(maskedKey);
        
        // Auto-test on load if we have a key
        testApiKey(key);
        }
    }, []);

    // Test the API key
    const testApiKey = async (keyToTest: string) => {
        setIsLoading(true);
        setTestOutput('Testing API connection...');
        
        try {
        const startTime = Date.now();
        
        const response = await axios.get('https://api.rawg.io/api/games', {
            params: {
            key: keyToTest,
            page_size: 1
            }
        });
        
        const duration = Date.now() - startTime;
        
        if (response.data && response.data.results && response.data.results.length > 0) {
            const game = response.data.results[0];
            setIsKeyValid(true);
            setTestOutput(
            `✅ Success! API is working (${duration}ms)\n` +
            `Total games available: ${response.data.count}\n` +
            `Sample game: "${game.name}" (${game.released || 'Unknown release date'})`
            );
        } else {
            setIsKeyValid(false);
            setTestOutput(`⚠️ API responded but no games were returned. Response: ${JSON.stringify(response.data)}`);
        }
        } catch (error) {
        setIsKeyValid(false);
        
        if (axios.isAxiosError(error)) {
            if (error.response) {
            setTestOutput(
                `❌ API Error: ${error.response.status}\n` +
                `Message: ${error.message}\n` +
                `Data: ${JSON.stringify(error.response.data)}`
            );
            
            if (error.response.status === 401) {
                setTestOutput(`❌ API Key Invalid (401 error)\nThe key you're using is not accepted by the RAWG API.`);
            }
            } else if (error.request) {
            setTestOutput(`❌ Network Error: No response received\nCheck your internet connection.`);
            } else {
            setTestOutput(`❌ Error: ${error.message}`);
            }
        } else if (error instanceof Error) {
            setTestOutput(`❌ Error: ${error.message}`);
        } else {
            setTestOutput(`❌ Unknown error occurred`);
        }
        } finally {
        setIsLoading(false);
        }
    };

    // Test with a custom entered key
    const handleCustomTest = () => {
        if (customKey) {
        testApiKey(customKey);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-bold text-white mb-4">API Connection Diagnostics</h2>
        
        <div className="mb-4">
            <h3 className="text-gray-300 font-medium mb-2">Environment API Key Status</h3>
            {apiKey ? (
            <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                <span>API key found in environment variables: {apiKey}</span>
            </div>
            ) : (
            <div className="flex items-center">
                <span className="text-red-400 mr-2">✗</span>
                <span>No API key found in environment variables</span>
            </div>
            )}
        </div>
        
        <div className="mb-4">
            <h3 className="text-gray-300 font-medium mb-2">Test with custom API key</h3>
            <div className="flex">
            <input
                type="text"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="Enter your RAWG API key to test"
                className="flex-grow px-3 py-2 bg-gray-700 text-white rounded-l border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
                onClick={handleCustomTest}
                disabled={!customKey || isLoading}
                className={`px-4 py-2 rounded-r font-medium ${
                !customKey || isLoading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-500'
                }`}
            >
                {isLoading ? 'Testing...' : 'Test Key'}
            </button>
            </div>
        </div>
        
        {testOutput && (
            <div className="mt-4">
            <h3 className="text-gray-300 font-medium mb-2">Test Results</h3>
            <div
                className={`p-3 rounded font-mono text-sm whitespace-pre-wrap ${
                isKeyValid === true
                    ? 'bg-green-900 text-green-200'
                    : isKeyValid === false
                    ? 'bg-red-900 text-red-200'
                    : 'bg-gray-700 text-gray-300'
                }`}
            >
                {testOutput}
            </div>
            </div>
        )}
        
        <div className="mt-6 text-sm text-gray-400">
            <p>
            To fix API key issues:
            </p>
            <ol className="list-decimal list-inside ml-2 mt-1">
            <li>Get a free API key from <a href="https://rawg.io/apidocs" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">RAWG API</a></li>
            <li>Create a <code className="bg-gray-700 px-1 rounded">.env</code> file in your project root</li>
            <li>Add <code className="bg-gray-700 px-1 rounded">VITE_RAWG_API_KEY=your_api_key_here</code></li>
            <li>Restart your development server</li>
            </ol>
        </div>
        </div>
    );
};

export default ApiTest;