// Test function
export async function testAPI() {
    // test API call
    const response = await fetch(`/api/test`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json();
}

// Reusable error handler
export function handleServerUnreachable(error) {
  console.error("Critical error: " + error);
  return {successful: false, error: "Server unreachable"};
}