# CometChat Integration Setup Guide

## ✅ Completed Setup

1. ✅ CometChat packages installed (`@cometchat/chat-sdk-javascript` and `@cometchat/chat-uikit-react`)
2. ✅ CometChat initialization file created (`src/lib/cometchat.ts`)
3. ✅ Mobile Expert Chat updated to use CometChat UI Kit
4. ✅ Expert Chat View created for admin dashboard
5. ✅ AuthContext updated to create CometChat users on signup
6. ✅ Expert assignment flow updated to create CometChat users

## 🔧 Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# CometChat Configuration
# Get these values from: CometChat Dashboard → Settings → API & Auth Keys
VITE_COMETCHAT_APP_ID=your_app_id_here
VITE_COMETCHAT_REGION=ap
VITE_COMETCHAT_AUTH_KEY=your_auth_key_here
```

### How to Get Your CometChat Credentials:

1. Go to [CometChat Dashboard](https://app.cometchat.com/)
2. Select your app (or create a new one)
3. Navigate to **Settings → API & Auth Keys**
4. Copy:
   - **APP ID**
   - **REGION** (e.g., `ap`, `in`, `us`)
   - **AUTH KEY**

## 🚀 How It Works

### User Flow:
1. User signs up → CometChat user automatically created (UID = Supabase user ID)
2. User submits authentication request with payment
3. Admin assigns expert to request
4. Expert CometChat user created (if doesn't exist)
5. User can chat with expert via `/expert-chat/:requestId`
6. Expert can chat with user via `/admin/expert-chat/:requestId`

### Key Rules:
- **Supabase user ID = CometChat UID** (critical for mapping)
- Chat is only accessible if:
  - Request is paid (`paid = true`)
  - Expert is assigned (`assigned_expert_id != null`)
- CometChat automatically creates 1-on-1 conversations when first message is sent

## 📱 Pages Updated

1. **MobileExpertChat** (`/expert-chat/:id`)
   - User-facing chat interface
   - Uses CometChat UI Kit
   - Shows expert details in header

2. **ExpertChatView** (`/admin/expert-chat/:requestId`)
   - Expert-facing chat interface
   - Only accessible to assigned expert
   - Uses CometChat UI Kit

3. **ExpertAuthDashboard** (`/admin/expert-auth`)
   - Shows "Open Chat" button for assigned requests
   - Creates CometChat users when assigning experts

## 🔄 After Adding Environment Variables

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Test the flow**:
   - Sign up a new user
   - Submit an authentication request
   - Assign an expert (as admin)
   - Open chat from both user and expert sides

## 📝 Notes

- CometChat users are created automatically on signup
- If a user already exists in CometChat, creation is skipped (non-blocking)
- Chat conversations are created automatically by CometChat when first message is sent
- The UI Kit provides full chat functionality: messages, images, read receipts, typing indicators

## 🐛 Troubleshooting

If chat doesn't work:
1. Check environment variables are set correctly
2. Verify CometChat App ID, Region, and Auth Key
3. Check browser console for errors
4. Ensure both user and expert CometChat users exist
5. Verify user is logged in to CometChat (happens automatically in chat pages)

