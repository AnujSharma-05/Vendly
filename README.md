# Vendly

![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Project Status](https://img.shields.io/badge/status-in%20development-orange.svg)

Vendly is a real-time, high-precision auction web application designed to ensure fairness and transparency in online bidding. Built from the ground up, Vendly handles interactions with millisecond-level accuracy, upholding the core principle: **"the first valid bid wins."**

---

## Table of Contents
- [Core Philosophy](#core-philosophy)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Development Roadmap](#development-roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Core Philosophy: Fairness Through Precision

In fast-paced auctions, ties should not exist. Vendly is architected to ensure that the winner is always the person who acted first.

- **Server-Side Authority:** User clocks are never trusted. All bids are assigned a high-precision timestamp the moment they are received by the server.
- **Atomic Operations:** Bid validation and auction state updates are performed as atomic database operations, preventing race conditions and ensuring only one winning bid per event.
- **Real-Time Transparency:** All participants are instantly notified of successful bids via WebSockets, guaranteeing a consistent auction state for everyone.

---

## Technology Stack

Vendly leverages a modern, high-performance technology stack tailored for real-time applications:

| Component        | Technology         | Rationale                                                                 |
|------------------|-------------------|--------------------------------------------------------------------------|
| **Backend**      | FastAPI (Python)  | Exceptional performance and native async support for thousands of WebSockets |
| **Frontend**     | React             | Dynamic, component-based UI that reacts instantly to new data            |
| **Database**     | MongoDB           | Flexible NoSQL, enabling rapid development and atomic bid operations     |
| **Real-Time**    | WebSockets        | Persistent, low-latency, bidirectional communication                     |
| **Containerization** | Docker        | Consistent, reproducible environments for all team members               |

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
