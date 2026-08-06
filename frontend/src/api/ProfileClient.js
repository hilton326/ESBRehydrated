// ProfileClient.js: Handles retrieving and updating user profile data. Communicates with backend AccountController.

import {handleServerUnreachable} from './test';

/* getYourProfilePicture: Retrieve the user's profile picture from the server. */
export async function getYourProfilePicture() {
  try {
    const response = await fetch(`/api/account/me/picture`, {
      method: 'GET',
      headers: { 'Accept': 'image/*', },
      credentials: 'include', // Required for cookies
    });

    if (!response) {
      handleServerUnreachable("No response from server");
      return null;
    }
    if (!response.ok) {
      console.log("Failed to retrieve profile picture:", response.status);
      return null;
    }

    const blob = await response.blob(); // image bytes
    const url = URL.createObjectURL(blob); // usable as <img src="...">
    
    return { url };

  } catch (error) {
    handleServerUnreachable(error);
    return null;
  }
}

/* updateYourProfile: Change profile picture and/or display name. */
export async function updateYourProfile(newName, newPicture) {
  try {
    if (!newName && !newPicture) {
      return {ok: false, error: "Nothing to update"};
    }
    const form = new FormData();
    if (newName) {
      form.append("name", newName);
    }
    if (newPicture) {
      form.append("picture", newPicture);
    }
    console.log(form);
    
    const response = await fetch(`/api/account/me/update-profile`, {
      method: 'POST',
      credentials: 'include', // Required for cookies
      body: form,
    });

    if (!response) {
      handleServerUnreachable("No response from server");
      return {ok: false, error: "No response from server"};
    }
    if (!response.ok) {
      console.log("Failed to update profile picture:", response.status);
      return {ok: false, error: response.error};
    }

    return {ok: true};

  } catch (error) {
    handleServerUnreachable(error);
    return {ok: false, error: error};
  }
}

/* getProfilePicture: get profile picture of any person (not just yourself). */
export async function getProfilePictureForId(accountID) {
  try {
    const request = { id: accountID };

    const response = await fetch(`/api/account/picture`, {
      method: 'POST',
      headers: { 'Accept': 'image/*', 'Content-Type': 'application/json'},
      body: JSON.stringify(request)
    });

    if (!response) {
      handleServerUnreachable("No response from server");
      return null;
    }
    if (!response.ok) {
      console.error("Failed to retrieve profile picture for", accountID, ":", response.status);
      return null;
    }

    const blob = await response.blob(); // image bytes
    const url = URL.createObjectURL(blob); // usable as <img src="...">
    
    return { url };

  } catch (error) {
    handleServerUnreachable(error);
    return null;
  }
}

/* getDisplayName: get display name of any person (not just yourself). */
export async function getDisplayNameForId(accountID) {
  try {
    const request = { id: accountID };
    
    const response = await fetch(`/api/account/name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(request)
    });

    if (!response) {
      handleServerUnreachable("No response from server");
      return null;
    }
    if (!response.ok) {
      console.log("Failed to retrieve display name:", response.status);
      return null;
    }

    const data = await response.json();
    return data;

  } catch (error) {
    handleServerUnreachable(error);
    return null;
  }
}

export async function walkGary(accountID, currentStatus) {
  try {
    const request = { id: accountID, status: currentStatus };
    
    const response = await fetch(`/api/account/walk-gary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(request)
    });

    if (!response) {
      handleServerUnreachable("No response from server");
      return null;
    }
    if (!response.ok) {
      console.log("Failed to update status:", response.status);
      return null;
    }
    
    const data = await response.json();
    return data;

  } catch (error) {
    handleServerUnreachable(error);
    return null;
  }
}