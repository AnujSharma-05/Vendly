
# Vendly

![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Project Status](https://img.shields.io/badge/status-in%20development-orange.svg)

Vendly is a multi-tenant, role-based, real-time auction platform. Its core mission is to provide a fair, transparent, and high-precision bidding environment. The platform serves as an orchestrator for Clients (auction hosts) to conduct auctions for registered Participants. All platform activities are overseen by Admins.

---

## Table of Contents
- [Vision & Core Philosophy](#vision--core-philosophy)
- [Core Entities & Roles](#core-entities--roles)
- [Technology Stack](#technology-stack)
- [Data Models](#data-models-mongodb-collections)
- [API Endpoint Specification](#api-endpoint-specification-core-endpoints)
- [Getting Started](#getting-started)
- [Development Roadmap](#development-roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Vision & Core Philosophy

Vendly is built on the principles of Separation of Concerns, Role-Based Access Control (RBAC), and Scalability. The platform ensures fairness and transparency in online bidding, handling interactions with millisecond-level accuracy. The guiding philosophy is: **"the first valid bid wins."**

---

## Core Entities & Roles

**Admin:** Superuser with global oversight. Approves/suspends Clients, resolves disputes, and manages platform health. Cannot host auctions.

**Client:** Verified host who conducts auctions. Creates auctions, defines rules, uploads items, and manages participants for their events.

**Participant:** Default user role. Can browse and join auctions to bid or watch as a spectator.

**Spectator:** Contextual role for Participants within a specific auction, granting view-only access.

---

## Technology Stack

| Component        | Technology         | Rationale                                                                 |
|------------------|-------------------|--------------------------------------------------------------------------|
| **Backend**      | FastAPI (Python)  | High-performance, async, automatic validation & docs                      |
| **Frontend**     | React             | Dynamic, component-based UI                                              |
| **Database**     | MongoDB           | Flexible, scalable NoSQL for evolving data structures                    |
| **Real-Time**    | WebSockets        | Persistent, low-latency communication                                    |

---

## Data Models (MongoDB Collections)

| Collection Name   | Description                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| users            | Source of truth for identity/authentication. Contains all user accounts.     |
| client_profiles  | Supplementary data for Client users. Tracks approval status.                 |
| auctions         | Central "room" or event. Contains rules, schedule, and configuration.        |
| auction_items    | Items being sold within an auction. Linked one-to-many with an Auction.      |
| auction_roster   | Guest list for each auction. Tracks users joined and their contextual role.  |
| transactions     | Record of all financial movements post-auction (payments, fees, payouts).    |

---

## API Endpoint Specification (Core Endpoints)

### /auth - Authentication
| Method | Path         | Required Role | Description                                                                 |
|--------|--------------|--------------|-----------------------------------------------------------------------------|
| POST   | /register    | Public       | Creates a new User account. If role is Client, also creates pending profile. |
| POST   | /login       | Public       | Authenticates a user and returns a JWT access token.                         |

### /admin - Platform Administration
| Method | Path                          | Required Role | Description                                         |
|--------|-------------------------------|--------------|-----------------------------------------------------|
| GET    | /clients/pending              | Admin        | Lists all ClientProfiles with pending_approval.      |
| POST   | /clients/{client_id}/approve  | Admin        | Approves a client, sets profile status to approved.  |
| POST   | /clients/{client_id}/suspend  | Admin        | Suspends a client's ability to host auctions.        |

### /client - Client (Host) Management
| Method | Path                              | Required Role     | Description                                         |
|--------|-----------------------------------|------------------|-----------------------------------------------------|
| GET    | /auctions/me                      | Approved Client  | Lists all auctions created by the authenticated client. |
| POST   | /auctions                         | Approved Client  | Creates a new Auction room with rules/config.        |
| POST   | /auctions/{auction_id}/items      | Approved Client (Owner) | Adds a new item for sale to a specific auction. |

### /auctions - Public & Participant Interaction
| Method | Path                  | Required Role | Description                                                      |
|--------|-----------------------|--------------|------------------------------------------------------------------|
| GET    | /                     | Public       | Lists all publicly available and active auctions.                 |
| GET    | /{auction_id}         | Public       | Gets detailed information for a single auction.                   |
| POST   | /{auction_id}/join    | Participant  | Allows a user to join an auction (as participant or spectator).   |

### /ws - Real-Time Bidding (WebSockets)
| Method | Path                          | Required Role                  | Description                                                        |
|--------|-------------------------------|-------------------------------|--------------------------------------------------------------------|
| WS     | /ws/auctions/{auction_id}     | Participant/Spectator (Roster) | WebSocket for real-time updates and (for participants) to send bids.|

---

## Getting Started

To run Vendly locally for development, ensure you have **Docker** and **Docker Compose** installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/vendly.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd vendly
   ```
3. **Build and run the application:**
   ```bash
   docker-compose up --build
   ```

**Access the application:**
- React Frontend: [http://localhost:3000](http://localhost:3000)
- FastAPI Backend: [http://localhost:8000](http://localhost:8000)
- API Documentation (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Development Roadmap

Vendly's development is structured into key stages, each building towards a robust, feature-complete platform.

### Stage 1: Foundation & Core Architecture
**Goal:** Establish a stable, containerized environment and define data architecture.
- Docker-based local development environment
- Finalized MongoDB schemas for users, products, auctions, and bids
- Structured project layout for frontend and backend
- Basic WebSocket connection manager (backend)

### Stage 2: English Auction MVP
**Goal:** Enable users to participate in a complete English auction.
- Backend REST APIs for products and auctions
- Real-time WebSocket endpoint for live bids
- Atomic bid-processing logic to prevent race conditions
- React frontend for auction list and details
- Real-time bidding interface

### Stage 3: Platform Maturity & User Features
**Goal:** Transform the auction engine into a commercially viable product.
- Secure user authentication (JWT)
- Protected routes and endpoints
- User dashboards for sellers and bidders
- Automated background scheduling for auctions
- Synchronized countdown timers

### Stage 4: Future Expansion
**Goal:** Extend platform capabilities leveraging scalable architecture.
- Additional auction types (Dutch, Sealed-Bid, etc.)
- Secure payment gateway integration (e.g., Stripe)
- Notification system (outbid alerts, auction ending soon)
- Advanced features (anti-sniping, "Buy Now" pricing)
- Administrative back-office

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request to get involved.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
