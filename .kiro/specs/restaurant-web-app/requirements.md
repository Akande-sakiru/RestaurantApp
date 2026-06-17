# Requirements Document

## Introduction

A full-stack restaurant web application built with Laravel, React, and Inertia.js as a single-page application (SPA). The system serves three distinct audiences: public visitors browsing the restaurant's landing page, authenticated customers managing reservations and orders, and restaurant staff/owners administering the entire operation through a protected admin dashboard. All three areas share a single codebase with role-based access control.

## Glossary

- **Application**: The full restaurant web application built on Laravel + React + Inertia.js
- **Guest**: An unauthenticated public visitor browsing the landing page
- **Customer**: An authenticated user with the `customer` role who can place orders and make reservations
- **Admin**: An authenticated user with the `admin` role (restaurant owner or staff) who manages the restaurant
- **Menu_Item**: A dish or beverage offered by the restaurant, belonging to a Category
- **Category**: A grouping of Menu_Items (e.g., Starters, Mains, Desserts, Drinks)
- **Order**: A collection of Order_Items submitted by a Customer for dine-in, takeaway, or delivery
- **Order_Item**: A single Menu_Item with a quantity and optional customization notes within an Order
- **Reservation**: A table booking made by a Customer for a specific date, time, and party size
- **Cart**: A temporary, session-scoped collection of Order_Items assembled by a Customer before checkout
- **RBAC**: Role-Based Access Control — the mechanism restricting access based on a user's assigned role
- **Inertia**: Inertia.js, the full-stack bridge connecting Laravel controllers to React page components
- **SPA**: Single-Page Application — the Application navigates without full page reloads

---

## Requirements

### Requirement 1: Public Landing Page

**User Story:** As a Guest, I want to view an attractive public landing page, so that I can learn about the restaurant and decide whether to visit or order.

#### Acceptance Criteria

1. THE Application SHALL render the landing page at the root URL (`/`) without requiring authentication.
2. THE Landing_Page SHALL display the restaurant name, logo, tagline, and a hero image or banner.
3. THE Landing_Page SHALL display a featured or highlighted selection of Menu_Items with names, descriptions, and prices.
4. THE Landing_Page SHALL display the restaurant's opening hours, physical address, and contact information.
5. THE Landing_Page SHALL provide navigation links to the full menu, reservation booking, and customer login/registration pages.
6. WHEN a Guest clicks the reservation call-to-action, THE Application SHALL navigate the Guest to the reservation booking page.
7. THE Landing_Page SHALL be fully responsive and render correctly on mobile, tablet, and desktop viewports.

---

### Requirement 2: User Registration and Authentication

**User Story:** As a Guest, I want to register for an account and log in, so that I can place orders and make reservations.

#### Acceptance Criteria

1. THE Application SHALL provide a registration form collecting name, email address, and password.
2. WHEN a Guest submits a valid registration form, THE Application SHALL create a Customer account, assign the `customer` role, and redirect the Guest to the customer dashboard.
3. IF a Guest submits a registration form with an email address already in use, THEN THE Application SHALL return a validation error identifying the duplicate email.
4. THE Application SHALL provide a login form accepting email address and password.
5. WHEN a Customer submits valid login credentials, THE Application SHALL authenticate the Customer and redirect to the customer dashboard.
6. IF a user submits invalid login credentials, THEN THE Application SHALL return an authentication error without revealing which field is incorrect.
7. WHEN an authenticated user requests logout, THE Application SHALL invalidate the session and redirect to the landing page.
8. THE Application SHALL provide a password reset flow via email link for users who have forgotten their password.
9. WHILE a user is unauthenticated, THE Application SHALL restrict access to all customer and admin routes, redirecting to the login page.

---

### Requirement 3: Role-Based Access Control

**User Story:** As a restaurant owner, I want role-based access control, so that customers cannot access admin functionality and admins have full management capabilities.

#### Acceptance Criteria

1. THE Application SHALL assign every registered user exactly one role from the set: `customer`, `admin`.
2. WHILE a user holds the `customer` role, THE Application SHALL permit access only to public routes and customer-scoped routes.
3. WHILE a user holds the `admin` role, THE Application SHALL permit access to all routes including the admin dashboard.
4. IF a Customer attempts to access an admin route, THEN THE Application SHALL return a 403 Forbidden response and redirect to the customer dashboard.
5. THE Application SHALL expose an Inertia shared prop containing the authenticated user's role so that the React frontend can conditionally render role-appropriate navigation and UI elements.

---

### Requirement 4: Public Menu Browsing

**User Story:** As a Guest or Customer, I want to browse the full restaurant menu, so that I can explore available dishes and make informed choices.

#### Acceptance Criteria

1. THE Application SHALL render a public menu page accessible without authentication.
2. THE Menu_Page SHALL display all active Menu_Items grouped by Category.
3. THE Menu_Page SHALL display each Menu_Item's name, description, price, and availability status.
4. WHEN a Menu_Item is marked unavailable, THE Menu_Page SHALL display the item with a visual unavailability indicator and disable the add-to-cart action for that item.
5. THE Menu_Page SHALL provide a category filter allowing users to view Menu_Items belonging to a single selected Category.
6. THE Menu_Page SHALL provide a text search input; WHEN a user enters a search term, THE Menu_Page SHALL display only Menu_Items whose name or description contains the search term.
7. WHERE a Menu_Item has an associated image, THE Menu_Page SHALL display that image alongside the item details.

---

### Requirement 5: Shopping Cart

**User Story:** As a Customer, I want to manage a shopping cart, so that I can assemble my order before submitting it.

#### Acceptance Criteria

1. WHILE a Customer is authenticated, THE Application SHALL maintain a persistent Cart associated with the Customer's session.
2. WHEN a Customer adds an available Menu_Item to the Cart, THE Cart SHALL store the Menu_Item, quantity, and any customization notes provided by the Customer.
3. WHEN a Customer adds a Menu_Item already present in the Cart, THE Cart SHALL increment the quantity of that item rather than creating a duplicate entry.
4. WHEN a Customer updates the quantity of a Cart item to zero, THE Cart SHALL remove that item from the Cart.
5. THE Cart SHALL display a running subtotal calculated as the sum of (Menu_Item price × quantity) for all Cart items.
6. WHEN a Customer clears the Cart, THE Cart SHALL remove all items and display an empty state.
7. THE Application SHALL persist the Cart contents across page navigations within the same authenticated session.

---

### Requirement 6: Order Placement

**User Story:** As a Customer, I want to place an order from my cart, so that I can receive food for dine-in, takeaway, or delivery.

#### Acceptance Criteria

1. WHEN a Customer proceeds to checkout, THE Application SHALL present an order summary showing all Cart items, quantities, individual prices, and the total amount.
2. THE Checkout_Page SHALL require the Customer to select an order type from: `dine-in`, `takeaway`, or `delivery`.
3. WHERE the Customer selects `delivery`, THE Checkout_Page SHALL require a delivery address.
4. WHERE the Customer selects `dine-in`, THE Checkout_Page SHALL require a table number or allow the Customer to indicate they will be seated by staff.
5. WHEN a Customer submits a valid order, THE Application SHALL create an Order with status `pending`, associate it with the Customer, and clear the Cart.
6. WHEN an Order is created, THE Application SHALL display an order confirmation page with the Order reference number and estimated preparation time.
7. THE Application SHALL allow a Customer to view the current status of all their Orders on a dedicated order history page.
8. WHEN an Order's status changes, THE Application SHALL reflect the updated status on the Customer's order history page upon next page load or refresh.

---

### Requirement 7: Table Reservations

**User Story:** As a Customer, I want to make a table reservation, so that I can guarantee a seat at the restaurant on a specific date and time.

#### Acceptance Criteria

1. THE Application SHALL provide a reservation booking page accessible to authenticated Customers.
2. THE Reservation_Form SHALL collect: date, time slot, party size, and an optional special requests field.
3. WHEN a Customer submits a reservation request, THE Application SHALL validate that the requested date is not in the past.
4. WHEN a Customer submits a reservation request, THE Application SHALL validate that the party size is a positive integer between 1 and the maximum configurable party size.
5. WHEN a valid reservation is submitted, THE Application SHALL create a Reservation with status `pending` and send a confirmation notification to the Customer's email address.
6. THE Application SHALL allow a Customer to view all their upcoming and past Reservations on a reservations page.
7. WHEN a Customer cancels a Reservation with status `pending` or `confirmed`, THE Application SHALL update the Reservation status to `cancelled` and send a cancellation notification to the Customer's email address.
8. IF a Customer attempts to cancel a Reservation with status `completed` or `cancelled`, THEN THE Application SHALL return a validation error indicating the Reservation cannot be cancelled.

---

### Requirement 8: Customer Profile Management

**User Story:** As a Customer, I want to manage my profile, so that I can keep my personal information and preferences up to date.

#### Acceptance Criteria

1. THE Application SHALL provide a profile page where an authenticated Customer can view and update their name and email address.
2. WHEN a Customer submits a profile update with a valid name and email, THE Application SHALL persist the changes and display a success confirmation.
3. IF a Customer submits a profile update with an email address already used by another account, THEN THE Application SHALL return a validation error.
4. THE Application SHALL allow a Customer to change their password by providing their current password and a new password.
5. IF a Customer provides an incorrect current password during a password change, THEN THE Application SHALL return a validation error without updating the password.
6. THE Application SHALL allow a Customer to delete their account; WHEN account deletion is confirmed, THE Application SHALL soft-delete the Customer record and invalidate the session.

---

### Requirement 9: Admin — Menu Management

**User Story:** As an Admin, I want to manage the restaurant menu, so that I can keep dishes, prices, and availability accurate for customers.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL provide a menu management section listing all Menu_Items with their Category, price, and availability status.
2. WHEN an Admin creates a new Menu_Item by providing a name, description, price, Category, and availability status, THE Application SHALL persist the Menu_Item and make it visible on the public menu page.
3. WHEN an Admin updates an existing Menu_Item's fields, THE Application SHALL persist the changes and immediately reflect them on the public menu page.
4. WHEN an Admin marks a Menu_Item as unavailable, THE Application SHALL display the item on the public menu with an unavailability indicator and prevent customers from adding it to their Cart.
5. WHEN an Admin deletes a Menu_Item, THE Application SHALL soft-delete the record so that existing Orders referencing the item retain their historical data.
6. THE Admin_Dashboard SHALL allow an Admin to create, rename, and delete Categories.
7. WHEN an Admin deletes a Category that contains Menu_Items, THE Application SHALL require the Admin to reassign or delete those Menu_Items before the Category deletion is confirmed.
8. WHERE a Menu_Item requires an image, THE Application SHALL allow the Admin to upload an image file; THE Application SHALL store the image and associate it with the Menu_Item.

---

### Requirement 10: Admin — Order Management

**User Story:** As an Admin, I want to manage incoming orders, so that I can track, update, and fulfil customer orders efficiently.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display a real-time-refreshing list of all Orders sorted by creation time descending, showing Order reference, Customer name, order type, total amount, and current status.
2. THE Admin_Dashboard SHALL allow an Admin to filter Orders by status (`pending`, `confirmed`, `preparing`, `ready`, `completed`, `cancelled`).
3. WHEN an Admin updates an Order's status, THE Application SHALL persist the new status and reflect it on the Customer's order history page.
4. THE Admin_Dashboard SHALL display the full detail of a selected Order including all Order_Items, quantities, customization notes, and the delivery address or table number.
5. WHEN an Admin cancels an Order, THE Application SHALL update the Order status to `cancelled` and send a cancellation notification to the Customer's email address.
6. THE Admin_Dashboard SHALL display an order count badge for Orders with `pending` status to alert staff of new incoming orders.

---

### Requirement 11: Admin — Reservation Management

**User Story:** As an Admin, I want to manage reservations, so that I can confirm, adjust, or cancel bookings and plan table allocation.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display all Reservations with Customer name, date, time, party size, status, and special requests.
2. THE Admin_Dashboard SHALL allow an Admin to filter Reservations by date and by status (`pending`, `confirmed`, `cancelled`, `completed`).
3. WHEN an Admin confirms a Reservation, THE Application SHALL update the Reservation status to `confirmed` and send a confirmation notification to the Customer's email address.
4. WHEN an Admin cancels a Reservation, THE Application SHALL update the Reservation status to `cancelled` and send a cancellation notification to the Customer's email address.
5. WHEN an Admin marks a Reservation as `completed`, THE Application SHALL update the Reservation status to `completed`.
6. THE Admin_Dashboard SHALL display a count of `pending` Reservations requiring action.

---

### Requirement 12: Admin — User Management

**User Story:** As an Admin, I want to manage user accounts, so that I can oversee the customer base and grant or revoke admin privileges.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display a paginated list of all registered users showing name, email, role, and registration date.
2. THE Admin_Dashboard SHALL allow an Admin to search users by name or email address.
3. WHEN an Admin changes a user's role, THE Application SHALL persist the new role and enforce the updated permissions on the user's next authenticated request.
4. WHEN an Admin deactivates a user account, THE Application SHALL prevent that user from authenticating until the account is reactivated.
5. IF an Admin attempts to deactivate their own account, THEN THE Application SHALL return a validation error preventing self-deactivation.

---

### Requirement 13: Admin — Dashboard Overview

**User Story:** As an Admin, I want a summary dashboard, so that I can quickly assess the restaurant's current operational status at a glance.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display today's total Order count, total revenue, and count of pending Orders.
2. THE Admin_Dashboard SHALL display today's total Reservation count and count of pending Reservations.
3. THE Admin_Dashboard SHALL display the count of currently active Menu_Items and Categories.
4. THE Admin_Dashboard SHALL display a list of the most recent 5 Orders with their status and total amount.
5. THE Admin_Dashboard SHALL display a list of upcoming Reservations for the current day.

---

### Requirement 14: Navigation and SPA Routing

**User Story:** As any user, I want seamless SPA navigation, so that the application feels fast and responsive without full page reloads.

#### Acceptance Criteria

1. THE Application SHALL use Inertia.js to handle all internal navigation without triggering full browser page reloads.
2. THE Application SHALL render a persistent navigation bar for authenticated users showing role-appropriate links and the current user's name.
3. WHILE a user holds the `customer` role, THE Navigation_Bar SHALL display links to: Menu, Cart, My Orders, My Reservations, and Profile.
4. WHILE a user holds the `admin` role, THE Navigation_Bar SHALL display links to: Dashboard, Menu Management, Orders, Reservations, and User Management.
5. THE Application SHALL update the browser URL and history on each Inertia navigation so that the browser back and forward buttons function correctly.
6. IF a user navigates to a route that does not exist, THEN THE Application SHALL render a 404 Not Found page within the SPA layout.

---

### Requirement 15: Notifications and Email

**User Story:** As a Customer, I want to receive email notifications for key events, so that I am kept informed about my orders and reservations.

#### Acceptance Criteria

1. WHEN a new Order is created, THE Application SHALL send an order confirmation email to the Customer containing the Order reference, items, total, and estimated preparation time.
2. WHEN an Order status changes to `ready` or `cancelled`, THE Application SHALL send a status update email to the Customer.
3. WHEN a Reservation is created, THE Application SHALL send a reservation confirmation email to the Customer containing the date, time, party size, and Reservation reference.
4. WHEN a Reservation status changes to `confirmed` or `cancelled`, THE Application SHALL send a status update email to the Customer.
5. THE Application SHALL queue all outbound emails using Laravel's job queue to avoid blocking the HTTP response.
