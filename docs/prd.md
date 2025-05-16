# Product Requirements Document: Personal Subscription Manager

**Version:** 1.2
**Date:** 2025-05-05 *(Updated for Offline Capabilities)*

## 1. Introduction

### 1.1. Purpose
To create a simple web application for tracking personal subscriptions (primarily AI tools, but flexible enough for others) to manage costs and avoid unwanted renewals by providing timely reminders. The application should support basic offline viewing and editing.

### 1.2. Goals
* Maintain a central, accurate list of all active and cancelled subscriptions, accessible both online and offline.
* Clearly visualize upcoming renewal dates.
* Receive timely reminders before subscriptions renew (requires online connection for notification delivery).
* Get a basic overview of subscription spending.
* Easily access key subscription details (cost, renewal date, cancellation info).
* Synchronize offline changes with the backend when connectivity is restored.

### 1.3. Target User
Myself (the builder/user).

### 1.4. Scope
Core features for manual tracking, reminders, basic reporting, and offline viewing/editing for a single user, built using the specified tech stack. Excludes automatic bank scanning, multi-user features, complex analytics, real-time offline collaboration features.

## 2. Functional Requirements

### 2.1. Subscription Management (CRUD Operations)

* **FR1:** Ability to **Add** a new subscription entry (Requires online connection initially to save to backend). Fields:
    * Subscription Name - *Required*
    * Plan/Tier - *Optional*
    * Price - *Required*
    * Currency - *Required* (Default: USD)
    * Billing Cycle - *Required*
    * First Billing Date / Start Date - *Required*
    * Renewal Date - *Required*
    * Payment Method - *Optional*
    * Account Email/Username - *Optional*
    * Category - *Optional*
    * Status - *Required* (Default: Active)
    * Cancellation Link/Notes - *Optional*
    * Notes - *Optional*
* **FR2:** Ability to **View** all subscriptions in a list format, accessible offline using locally persisted data.
* **FR3:** Ability to **Select** a subscription from the list to view all its details, accessible offline.
* **FR4:** Ability to **Edit** any field of an existing subscription while offline. Changes are stored locally.
* **FR5:** Ability to **Update Status** of a subscription while offline. Changes are stored locally.
* **FR6:** Ability to **Delete** a subscription entry while offline (mark for deletion locally). Deletion is finalized on the backend upon sync. Requires confirmation.

### 2.2. Dashboard / Overview

* **FR7:** Display a summary section (Total monthly/annual cost, active count), calculated from locally persisted data when offline.
* **FR8:** Display "Upcoming Renewals" list, calculated from locally persisted data when offline.

### 2.3. Reminders & Notifications

* **FR9:** Backend automatically generates reminders for active subscriptions based on their renewal date (requires online processing).
* **FR10:** Configure reminder lead time (global setting, stored in backend).
* **FR11:** Deliver reminders. *(Implementation Note: Backend processing via NestJS required. Delivery mechanism (e.g., frontend notification, email) depends on implementation and online status).*

### 2.4. Search, Sorting, & Filtering

* **FR12:** Ability to **Search** subscriptions by Name and Notes fields using locally persisted data when offline.
* **FR13:** Ability to **Sort** the main subscription list using locally persisted data when offline.
* **FR14:** Ability to **Filter** the main subscription list using locally persisted data when offline.

### 2.5. Data Management & Synchronization

* **FR15:** Data must persist between application uses via the backend database (Turso) when online.
* **FR16:** *(Optional)* Ability to **Export** all subscription data (from backend) to CSV.
* **FR17:** *(Optional)* Ability to **Import** subscription data (to backend) from CSV.
* **FR18:** Application must persist subscription data locally using TinyBase's persistence features (e.g., Locali Storage, IndexedDB adapter) to enable offline access.
* **FR19:** Application must detect online/offline status.
* **FR20:** When online, the application must synchronize local changes (edits, status updates, deletions made offline) with the NestJS backend/Turso database.
* **FR21:** When online, the application must fetch latest data from the backend and update the local TinyBase store.
* **FR22:** Define a basic synchronization strategy (e.g., last write wins - local changes overwrite server if newer, server changes overwrite local if newer). *(Note: For single-user, simple timestamp comparison might suffice).*

## 3. Non-Functional Requirements

* **NFR1: Usability:** Simple, clean, intuitive interface. Minimal learning curve. Leverage TailwindCSS. Indicate offline status clearly in the UI.
* **NFR2: Performance:** Responsive UI. Frontend optimized via React/Vite/TinyBase. Backend response times reasonable. Offline access should be fast, relying on local TinyBase store.
* **NFR3: Platform:** Web Application hosted on Fly.io.
* **NFR4: Data Storage:**
    * **Persistent Backend Storage:** Turso (via libSQL) managed by NestJS.
    * **Persistent Local Storage (Offline):** TinyBase persistence layer (e.g., IndexedDB) for offline data access and temporary storage of offline modifications.
* **NFR5: Security:** Standard web security practices. Consider basic authentication/authorization for online access. Local data subject to browser security.
* **NFR6: Reliability:** Reliable data saving to Turso when online. Reliable local persistence via TinyBase. Implement basic handling for synchronization errors/conflicts (e.g., notify user, simple resolution strategy).
* **NFR7: Scalability:** Stack provides foundation for scaling, though not an initial requirement. Offline sync complexity might increase with more users/data.
* **NFR8: Maintainability:** TypeScript, NestJS structure, React best practices enhance maintainability.

## 4. UI/UX Considerations

* **UI1:** Clear visual distinction between Active and Cancelled subscriptions.
* **UI2:** Highlight upcoming renewal dates clearly.
* **UI3:** Easy-to-access Add, Edit, and Delete functions.
* **UI4:** Consistent layout and navigation. Responsive design.
* **UI5:** Clear visual indicator when the application is operating in offline mode.
* **UI6:** Provide feedback to the user during synchronization (e.g., "Syncing...", "Sync complete", "Sync failed").

## 5. Future Considerations (Optional)

* More sophisticated conflict resolution for synchronization.
* Allow adding new subscriptions while offline (queue for sync).
* Currency conversion (backend API).
* Advanced reporting/visualization (React charting library).
* User authentication (Password, OAuth).
* Turso backup mechanism.
* Email notifications for reminders (backend email service).

## 6. Technical Architecture / Stack Summary

* **Frontend Framework:** React
* **Frontend Language:** TypeScript
* **Frontend Styling:** TailwindCSS
* **Frontend Build Tool:** Vite
* **Frontend State Management:** TinyBase (for in-memory data, reactivity, and local persistence*)
* **Backend Framework:** NestJS
* **Backend Language:** TypeScript
* **Database:** Turso (libSQL)
* **Hosting Platform:** Fly.io
