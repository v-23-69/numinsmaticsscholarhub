import { CometChat } from "@cometchat/chat-sdk-javascript";
import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";

let isInitialized = false;
let isUIKitInitialized = false;

export const initCometChat = async () => {
  if (isInitialized && CometChat.isInitialized()) {
    return;
  }

  const appID = import.meta.env.VITE_COMETCHAT_APP_ID;
  const region = import.meta.env.VITE_COMETCHAT_REGION;

  if (!appID || !region) {
    throw new Error("CometChat App ID and Region must be set in environment variables");
  }

  const settings = new CometChat.AppSettingsBuilder()
    .subscribePresenceForAllUsers()
    .setRegion(region)
    .build();

  try {
    await CometChat.init(appID, settings);
    isInitialized = true;
    console.log("CometChat initialized successfully");
  } catch (error) {
    console.error("CometChat initialization failed:", error);
    throw error;
  }
};

export const loginCometChat = async (uid: string) => {
  const appID = import.meta.env.VITE_COMETCHAT_APP_ID;
  const region = import.meta.env.VITE_COMETCHAT_REGION;
  const authKey = import.meta.env.VITE_COMETCHAT_AUTH_KEY;
  
  if (!appID || !region || !authKey) {
    throw new Error("CometChat environment variables must be set");
  }

  try {
    // Initialize CometChat first if not already initialized
    if (!isInitialized || !CometChat.isInitialized()) {
      await initCometChat();
    }

    const user = await CometChat.login(uid, authKey);
    console.log("CometChat login successful:", user);
    return user;
  } catch (error: any) {
    // If user doesn't exist, create them first
    if (error.code === "ERR_UID_NOT_FOUND") {
      throw new Error("User not found. Please create user first.");
    }
    console.error("CometChat login failed:", error);
    throw error;
  }
};

export const createCometChatUser = async (uid: string, name: string) => {
  // Check if environment variables are set
  const appID = import.meta.env.VITE_COMETCHAT_APP_ID;
  const region = import.meta.env.VITE_COMETCHAT_REGION;
  const authKey = import.meta.env.VITE_COMETCHAT_AUTH_KEY;
  
  if (!appID || !region || !authKey) {
    console.warn("CometChat environment variables not set. Skipping user creation.");
    return null;
  }

  try {
    // Initialize CometChat first if not already initialized
    if (!isInitialized || !CometChat.isInitialized()) {
      await initCometChat();
    }

    const user = new CometChat.User(uid);
    user.setName(name);

    const createdUser = await CometChat.createUser(user, authKey);
    console.log("CometChat user created:", createdUser);
    return createdUser;
  } catch (error: any) {
    // User might already exist, which is fine
    if (error.code === "ERR_UID_ALREADY_EXISTS") {
      console.log("CometChat user already exists:", uid);
      return null;
    }
    // Don't throw error - just log it so it doesn't break the signup flow
    console.error("CometChat user creation failed:", error);
    return null;
  }
};

export const logoutCometChat = async () => {
  try {
    await CometChat.logout();
    console.log("CometChat logout successful");
  } catch (error) {
    console.error("CometChat logout failed:", error);
  }
};

export const initCometChatUIKit = async () => {
  if (isUIKitInitialized) {
    return;
  }

  const appID = import.meta.env.VITE_COMETCHAT_APP_ID;
  const region = import.meta.env.VITE_COMETCHAT_REGION;
  const authKey = import.meta.env.VITE_COMETCHAT_AUTH_KEY;

  if (!appID || !region || !authKey) {
    throw new Error("CometChat environment variables must be set");
  }

  try {
    // Initialize SDK first if not already initialized
    if (!isInitialized || !CometChat.isInitialized()) {
      await initCometChat();
    }

    // Initialize UIKit
    const UIKitSettings = new UIKitSettingsBuilder()
      .setAppId(appID)
      .setRegion(region)
      .subscribePresenceForAllUsers()
      .build();

    await CometChatUIKit.init(UIKitSettings);
    isUIKitInitialized = true;
    console.log("CometChat UIKit initialized successfully");
  } catch (error) {
    console.error("CometChat UIKit initialization failed:", error);
    throw error;
  }
};

export const getCometChatUser = async (uid: string) => {
  try {
    // Ensure SDK is initialized
    if (!isInitialized || !CometChat.isInitialized()) {
      await initCometChat();
    }
    
    // Check if user is logged in first
    const currentUser = await CometChat.getLoggedInUser();
    if (!currentUser) {
      console.warn("No user logged in to CometChat");
      return null;
    }
    
    const user = await CometChat.getUser(uid);
    
    // Validate user object
    if (!user || typeof user !== 'object') {
      console.warn("Invalid user object returned from CometChat");
      return null;
    }
    
    return user;
  } catch (error: any) {
    // Handle specific error codes
    if (error.code === "ERR_UID_NOT_FOUND") {
      console.warn(`CometChat user not found: ${uid}`);
      return null;
    }
    console.error("Failed to get CometChat user:", error);
    // Return null instead of throwing to prevent crashes
    return null;
  }
};

