# Feature 1: Authentication (Frontend Flow)

This document explains the complete data flow for Authentication (Login, Register, Forgot Password, Reset Password) in the frontend application.

## High-Level Flow
When a user interacts with an authentication form, the data flows through several layers before reaching the backend:
`User Input (Forms) -> Custom Hook (useAuth) -> State Provider (AuthContext) -> API Service (auth.service) -> Network (Axios) -> Backend`

---

## 1. User Interface (Pages & Components)
The user interacts with React forms located in `src/pages` and `src/components`.

### Register & Login (`RegisterForm.jsx`, `LoginForm.jsx`)
- **State**: The forms use `useState` to capture input (email, password, etc.).
- **Validation**: They perform basic checks (e.g., matching passwords).
- **Submission**: On submit, they call `login(formData)` or `register(submitData)` provided by the `useAuth()` hook.
- **Google Auth**: They integrate `@react-oauth/google` to handle Google Sign-In, passing the resulting token to `googleLogin(token)`.

### Password Recovery (`ForgotPassword.jsx`, `ResetPassword.jsx`)
- **Forgot Password**: Captures the user's email, calls `forgotPassword(email)`, and upon success, redirects to the Reset Password page.
- **Reset Password**: Captures the 6-digit OTP from the email and the new password, then calls `resetPassword({email, otp, newPassword})`.

## 2. The Hook Layer (`useAuth.js`)
- This is a custom React hook that wraps `useContext(AuthContext)`.
- It allows any component to easily access authentication functions (`login`, `register`) and state (`user`) without having to manually import the context every time.

## 3. The Global State (`AuthContext.jsx`)
This is the "Brain" of the frontend authentication.
- **State Management**: It holds the global `user` object. If `user` is null, the user is logged out.
- **Action Handlers**: When a form calls `login()`, the context takes that data and calls the Service layer (`auth.service.js`).
- **State Updates**: If the Service layer succeeds, the backend returns the logged-in user data. The Context calls `setUser(data)`, which instantly updates the UI (like redirecting to the Dashboard and showing the username in the top right).

## 4. The API Service (`auth.service.js`)
This layer is purely responsible for backend communication.
- **API Calls**: It uses Axios to send `POST` requests to specific endpoints (e.g., `/auth/register`).
- **Error Handling**: It catches errors from the backend. If the backend sends Zod validation errors, it parses them into user-friendly messages and throws them back to the Context (which then shows them on the Form).

## 5. The Network Configuration (`axios.js`)
This file configures how requests are physically sent.
- **Base URL**: It automatically prepends the backend server URL (`API_BASE_URL`).
- **Cookies**: It sets `withCredentials: true`. This is critical because the backend uses HTTP-only cookies to store the JWT token. This setting allows the browser to receive and send these cookies securely.
