# Privacy Policy for SanchezMotors

**Effective Date:** February 25, 2026

## Overview

SanchezMotors ("we," "us," "our," or "Company") operates the SanchezMotors mobile application (the "App"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our App.

**SanchezMotors is designed as an offline-first application**, meaning that data is primarily stored locally on your device and does not require internet connectivity to function. We take your privacy and data security seriously.

---

## 1. Information We Collect

### 1.1 Information You Provide Directly

When you use SanchezMotors, we collect the following information that **you voluntarily provide**:

- **Vehicle Information:** Make, model, year, color, VIN, license plate, engine type, and odometer readings
- **Client Information:** Client name, contact information (phone, email), and notes
- **Work Order Details:** Service descriptions, repair notes, photos taken during vehicle inspection and repairs
- **Financial Information:** Labor costs, parts costs, sale prices, and budget/quote data
- **Admin PIN:** A numeric PIN used for authentication and role-based access control (admin vs. mechanic)
- **Photos:** Vehicle inspection photos (exterior, interior angles) and process photos during repairs
- **Authentication Credentials:** Your authentication method (admin PIN or mechanic access level)

### 1.2 Device Information

We may collect the following information automatically:

- **Device Type and Model:** The type and model of your mobile device
- **Operating System:** The version of your device's operating system
- **App Version:** The version of SanchezMotors you are using
- **Camera and Storage Access:** Permissions granted for camera, photo gallery, and file system access

### 1.3 Camera and Photo Permissions

SanchezMotors requires camera and photo library access to function. We collect:

- **Inspection Photos:** Mandatory 6-slot vehicle inspection photos (front, rear, left, right, interior front, interior rear)
- **Process Photos:** Optional evidence photos taken during repair work
- **Photo Metadata:** Timestamps and notes associated with collected photos

All photos are stored locally on your device unless you explicitly export or share them.

---

## 2. How We Use Your Information

We use the information collected for the following purposes:

### 2.1 Core App Functionality
- **Work Order Management:** Create, manage, and track vehicle repair work orders
- **Task Tracking:** Organize repair tasks using a Kanban board system
- **Financial Management:** Generate quotes, track costs, calculate margins, and manage budgets
- **Photo Documentation:** Store vehicle inspection and repair evidence

### 2.2 Administrative Purposes
- **Role-Based Access Control:** Enforce admin/mechanic role distinctions using PIN authentication
- **Financial Privacy:** Show cost data only to admin users; mechanics see only sale prices
- **Data Organization:** Organize work orders by date and status

### 2.3 Data Export and Backup
- **Daily Backup:** Export all work orders created on a specific day as JSON for USB/OTG backup
- **Data Portability:** Enable you to export and backup your workshop data

### 2.4 Analytics and Improvement (Future)
- **Usage Analytics:** We may collect non-personally identifiable usage data to improve the App (planned feature)

---

## 3. Data Storage and Offline-First Design

### 3.1 Local Storage
**All data is stored locally on your device by default.** We use AsyncStorage (device-level encrypted storage compatible with React Native) to persist:

- Work orders and work tasks
- Authentication state and PIN
- Photo references and metadata
- Order counters and daily logs

### 3.2 Device Security
Your data is stored locally on your device using platform-level encryption:
- **Android:** Data is stored using your device's built-in encryption
- **iOS:** Data is stored using iOS KeyChain and encrypted storage mechanisms

We recommend:
- Using a strong device PIN/biometric authentication
- Keeping your device software up to date
- Enabling device encryption
- Protecting access to your device

### 3.3 No Automatic Cloud Backup
**The App does not automatically upload your data to our servers or cloud services.** You maintain full control over your data. Any data export or backup is entirely under your control.

---

## 4. Permissions Required

SanchezMotors requires the following permissions to function:

| Permission | Purpose |
|---|---|
| **CAMERA** | Take inspection and process photos |
| **READ_EXTERNAL_STORAGE** / **READ_MEDIA_IMAGES** | Access photos from your gallery |
| **WRITE_EXTERNAL_STORAGE** | Save exported data to your device storage |
| **RECORD_AUDIO** | Capture audio with photos (if needed) |
| **READ_MEDIA_VIDEO** | Access videos from your gallery (future feature) |

You can manage these permissions in your device settings. If you deny permission, the App may not function fully.

---

## 5. Sharing of Information

### 5.1 We Do Not Share Your Data
We do **not** share, sell, rent, or lease your personal information to third parties for their marketing purposes.

### 5.2 WhatsApp Sharing (User-Initiated)
The App allows you to share budget/quote information via WhatsApp using deep linking. This is entirely **user-initiated**:
- You must manually trigger the share action
- The App only formats the data and directs you to WhatsApp
- We do not send data on your behalf
- WhatsApp's privacy policy applies to any information you share

### 5.3 PDF Export (User-Controlled)
You can export work orders and quotes as PDF files:
- Export is entirely user-controlled
- Files are stored on your device
- You decide whether to share, email, or print these files

### 5.4 Future Cloud Integration (Planned, Opt-In)
The App is planned to integrate with AWS services in the future for optional cloud backup and sync:
- **AWS Amplify DataStore** — for cloud synchronization
- **AWS Cognito** — for improved authentication
- **Amazon S3** — for cloud photo storage

When these features are implemented, they will be **opt-in** and clearly disclosed. You will receive an updated Privacy Policy and must explicitly consent before any data is sent to AWS.

---

## 6. Data Security

### 6.1 Security Measures
- **Local Encryption:** Data is stored in encrypted storage on your device
- **PIN Authentication:** Admin access is protected by a numeric PIN (configurable, default: 1234)
- **No Network Transmission:** By default, data does not leave your device
- **No Analytics Tracking:** We do not track user behavior or collect analytics by default

### 6.2 Security Limitations
While we employ industry-standard security practices, no method of electronic storage is 100% secure. We cannot guarantee absolute security. If your device is compromised, your data may be at risk.

### 6.3 User Responsibility
You are responsible for:
- Protecting your device and Admin PIN
- Enabling device encryption
- Keeping your device software updated
- Regularly backing up your data

---

## 7. Data Retention

### 7.1 Retention Policy
- **Active Data:** You maintain full control over your data. It remains stored locally until you delete it
- **Deletion:** You can delete individual work orders or clear all data at any time through the App
- **Device Removal:** When you uninstall the App, all stored data remains on your device in AsyncStorage until you manually clear it or perform a factory reset

### 7.2 Backup and Export
- **Daily Exports:** You can export today's work orders as JSON at any time
- **Manual Backups:** Use the export feature to back up data to USB/OTG storage
- **Retention:** Exported data is yours to manage; we do not store copies

---

## 8. Children's Privacy

SanchezMotors is **not directed toward children under 13 years of age**. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information immediately.

---

## 9. Your Rights and Choices

### 9.1 Data Access and Portability
You have the right to:
- Access all data stored in the App at any time
- Export your data in portable JSON format using the export feature
- Receive a copy of all your information

### 9.2 Data Deletion
You have the right to:
- Delete individual work orders through the App
- Clear all data by uninstalling the App and clearing the app cache
- Request that we delete any cloud-based data (once cloud features are implemented)

### 9.3 Opt-Out
When optional cloud features are introduced:
- You can opt out of cloud synchronization
- You can choose to use the App in offline-only mode
- You can request deletion of cloud data at any time

### 9.4 Marketing Communications
We do not send marketing communications or promotional emails. Any notifications from the App are functional (e.g., alerts related to App usage).

---

## 10. Regional Compliance

### 10.1 GDPR (European Union)
If you are in the EU, you have rights under the General Data Protection Regulation (GDPR), including:
- Right to access your data
- Right to correct or update your data
- Right to delete your data ("right to be forgotten")
- Right to restrict processing
- Right to data portability
- Right to lodge a complaint with your local Data Protection Authority

### 10.2 CCPA (California)
If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA), including:
- Right to know what data we collect
- Right to access your data
- Right to delete your data
- Right to opt-out of data sales (we do not sell data)
- Right to non-discrimination for exercising your rights

### 10.3 LGPD (Brazil)
If you are in Brazil, your data is protected under the Lei Geral de Proteção de Dados (LGPD), including:
- Right to access, correct, and delete your data
- Right to data portability
- Right to lodge complaints with ANPD

---

## 11. Third-Party Services and Links

### 11.1 Third-Party Libraries
SanchezMotors uses the following third-party libraries (all local/offline):
- **React Native** — UI framework
- **Expo** — Build platform
- **AsyncStorage** — Local data persistence
- **expo-camera** — Camera functionality
- **expo-print** — PDF generation
- **expo-sharing** — File sharing (user-initiated)

These libraries operate locally on your device and do not transmit data externally.

### 11.2 External Links
The App may contain links to external websites. We are not responsible for the privacy practices of those websites. Please review their privacy policies before providing any information.

---

## 12. Privacy Policy Updates

We may update this Privacy Policy periodically to reflect changes in our practices, technology, or legal requirements. When we make material changes, we will:
- Update the "Effective Date" at the top of this policy
- Notify you within the App (when cloud features are introduced, notifications will be in-App)

Your continued use of the App after updates constitute your acceptance of the updated Privacy Policy.

---

## 13. Contact Us

If you have any questions about this Privacy Policy or our privacy practices, please contact us:

**Email:** [INSERT CONTACT EMAIL]
**Mailing Address:** [INSERT MAILING ADDRESS]
**Phone:** [INSERT PHONE NUMBER]

For data subject requests (access, deletion, portability), please include:
- Your full name
- Your email address
- A description of your request
- Proof of your identity (for security purposes)

We will respond to your request within **30 days** (or as required by applicable law).

---

## 14. Additional Information

### 14.1 Compliance with Laws
We are committed to complying with all applicable privacy laws, including:
- GDPR (EU)
- CCPA (California)
- LGPD (Brazil)
- Mexico's Federal Law on Protection of Personal Data (Ley Federal de Protección de Datos Personales en Posesión de Particulares)

### 14.2 Offline-First Commitment
SanchezMotors is designed to work without internet connectivity. We are committed to maintaining your privacy by:
- Keeping your data on your device by default
- Never sending data without your explicit consent
- Providing transparent notice of any future cloud features

### 14.3 No Tracking or Advertising
- We do **not** use tracking technologies (cookies, pixels, web beacons)
- We do **not** display targeted advertisements
- We do **not** sell or share your data with advertisers

---

## 15. Acknowledgment

By downloading and using SanchezMotors, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.

---

**Last Updated:** February 25, 2026

**Version:** 1.0
