# Comprehensive Prompt: TOTP-Based QR Code Student ID System

You are an expert full-stack developer. Your task is to build a highly secure, Time-Based One-Time Password (TOTP) QR Code ID Verification system. This system is designed to prevent students from sharing static screenshots of their QR codes to grant unauthorized access to campus.

## System Architecture Overview
The system leverages the MERN stack (MongoDB, Express, React, Node.js) and is split into three distinct components:
1. **Backend API Server** (Node.js, Express, MongoDB)
2. **Student Frontend App** (React.js, Mobile-First)
3. **Security Guard Scanner App** (React.js, Tablet/Web)

## Core Mechanism & Security Flow
- **Data Payload**: The QR code data must combine the student's unique identifier and a dynamic token: `USN:TOKEN` (e.g., `1AY25AI037:849302`).
- **Offline Generation**: The Student App generates this QR code locally using a securely stored Secret Key and the device's clock. The code refreshes every 30 seconds and requires NO internet connection on the student's device.
- **Verification**: The Guard App scans the QR code and pings the Backend over the internet. The Backend validates the token cryptography against the current time window.
- **Visual Confirmation**: To prevent the "unlocked phone hand-off" loophole, upon successful validation, the Backend sends the student's official photo to the Guard App. The guard must physically verify the face before granting entry.

---

## Detailed Requirements

### 1. Backend (Node.js, Express, MongoDB, Socket.io)
- **Database Model**: Create a Mongoose `Student` model containing: `usn` (String, unique), `name` (String), `totpSecret` (String), and `profilePhotoUrl` (String).
- **Secret Generation**: Create a secure route to provision a new student, generating a unique, cryptographically secure `totpSecret` (using a library like `otplib`).
- **Verification Endpoint**: Create a `POST /api/verify` route that accepts a payload `{ usn, token }`.
  - Look up the student by `USN`.
  - Validate the `token` against the student's `totpSecret` (allow for a standard 30-second time drift).
  - If valid, return a success status along with the student's `profilePhotoUrl` and `name`.
  - If invalid, return a 401/403 error status.
- **Real-Time Feedback**: Integrate `Socket.io`. When a scan is successful at the gate, emit a `scan_success` event to a room specifically identified by the student's USN.

### 2. Student Frontend (React.js, Mobile-First)
- **Design Aesthetic**: Implement a sleek, mobile-first UI (dark mode, glassmorphism panels, neon accents).
- **State & Storage**: Securely store the student's `USN` and `totpSecret` (simulate with local storage).
- **QR Code Generation**:
  - Use `otplib` to generate the 6-digit TOTP token locally based on the current time and the stored `totpSecret`.
  - Combine the string `USN:TOKEN`.
  - Render this string as a large, scannable QR code (using `qrcode.react`).
- **Live Updating**: Implement a React `useEffect` with a strict timer that recalculates the token and re-renders the QR code every 30 seconds. Include a smooth visual countdown progress bar.
- **Instant Validation Feedback**: Listen for the Socket.io `scan_success` event. When received, overlay the screen with a bright green "Verified - Proceed" checkmark to indicate the guard has granted access.

### 3. Guard Frontend (React.js, Tablet/Web)
- **Scanner Implementation**: Integrate a real-time camera QR scanner using `html5-qrcode` or a similar library.
- **Processing**: Upon successfully reading a QR code, parse the `USN:TOKEN` string. Immediately send this data to the `/api/verify` backend endpoint.
- **Visual Confirmation UI**:
  - **Success**: If the API returns valid, stop the scanner and prominently display the returned `profilePhotoUrl` and student `name` on the screen with a stark green background. Provide a clear "Next Scan" button to reset the view.
  - **Failure**: If the API returns invalid or expired, flash a bold red "Invalid or Expired ID" error message and allow immediate rescanning.