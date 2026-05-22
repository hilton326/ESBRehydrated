const API = import.meta.env.VITE_API_BASE;

async function test() {
    // Implementation for test API call
    
    const response = await fetch(`${API}/test`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json();
}

export { test };