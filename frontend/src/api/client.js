// Client.js: Handles server communications

const API = import.meta.env.VITE_API_BASE;

// Reusable error handler
function handleServerUnreachable(error) {
  console.error("Critical error: " + error)
  alert("Server unreachable");
  return {successful: false, error: "Server unreachable"};
}

// registrationRequest: sends registration form data to the server
export async function registrationRequest(email, name, password) {
  try {
    // Create object containing all three fields
    const request = { email: email, name: name, password: password };
    
    // Send the POST request
    const response = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(request)
    });

    if (!response) {
      return handleServerUnreachable("No response from server");
    }

    // Retrieve response
    const data = await response.json();

    if (!response.ok) {
      console.error("Server failed to create account:", response.status, data.error);
      alert("Error creating account: " + String(data.error));
      return {successful: false, error: String(data.error)};
    }

    console.log("Account created successfully! ", response.status, data);
    alert("Account created successfully!")
    return {successful: true, error: null};

  } catch (error) {
      return handleServerUnreachable(error);
  }
}

// loginRequest: sends login form data to the server
export async function loginRequest(emailOrName, password) {
  try {
    // Always set isEmail to true for now
    const request = { identifier: emailOrName, password: password, isEmail: true };
    
    // Send the POST request
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(request)
    });

    if (!response) {
      return handleServerUnreachable("No response from server");
    }

    // Retrieve response
    const data = await response.json();

    // Authentication error
    if (!response.ok) {
      console.error("Failed to authenticate:", response.status, data.error);
      alert(String(data.error));
      return {successful: false, token: null, error: String(data.error)};
    }

    // Authentication successful: Return the session token
    console.log("Login successful! ", response.status);
    return {successful: true, token: data.token, error: null};

  } catch (error) {
      return handleServerUnreachable(error);
  }
}

export async function test() {
    // test API call
    const response = await fetch(`${API}/test`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json();
}