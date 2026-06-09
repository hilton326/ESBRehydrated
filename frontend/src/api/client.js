// Client.js: Handles server communications

const API = import.meta.env.VITE_API_BASE;

// registrationRequest: sends registration form data to the server
export async function registrationRequest(email, name, password) {
  // Create object containing all three fields
  const request = { email: email, name: name, password: password };
    
    // Send the POST request
    const response = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(request)
    });

    if (!response) {
      alert("Server unreachable");
      return false;
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("Server failed to create account:", response.status, data.error);
      alert("Error creating account: " + String(data.error));
      return false;
    }

    console.log("Account created successfully! ", response.status, data);
    alert("Account created successfully!")
    return true;
}

// loginRequest: sends login form data to the server
export async function loginRequest(emailOrName, password) {
  // Check if an email or a display name was entered
    console.log(emailOrName);
    console.log(password);

    const isEmail = emailOrName.includes('@');
    console.log("isEmail: ", isEmail);

    const request = { identifier: emailOrName, password: password, isEmail: isEmail };
    console.log("Form: " + JSON.stringify(request));
    
    // Send the POST request
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      console.error("Failed to authenticate: ", response.status);
      return null;
    }

    console.log("Login successful! ", response.status);
    const data = await response.json();
    console.log(data);
    return data;
}

export async function test() {
    // Implementation for test API call
    
    const response = await fetch(`${API}/test`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json();
}