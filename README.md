# Vireo

A full-featured Twitter clone built with modern technologies, offering authentication, user and post management, notifications, and more.

## Live Demo
[Version 1.0](https://twitter-clone-9vy8.onrender.com/)

## Features
- **Authentication**: Email verification, JWT-based access & refresh tokens.
- **User Management**: Update profile, follow/unfollow users.
- **Post Management**: Create, edit, delete posts.
- **Post Suggestion Algorithm**: Dynamic visibility based on user interactions.
- **User Suggestions**: Based on popularity and engagement.
- **Save Posts & Tags**: Bookmark posts and use hashtags.
- **Comments & Replies**: Full CRUD support.
- **Notifications**: Alerts for likes and follows.

## Tech Stack
- **Backend**: [Bun](https://bun.sh/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/), [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm)
- **Cache**: [Redis](https://redis.io/)
- **Storage**: [Cloudinary](https://cloudinary.com/)
- **Security**: [Helmet](https://helmetjs.github.io/), JWT, [Joi](https://joi.dev/)
- **Linting & Formatting**: [ESLint](https://eslint.org/), Prettier

## Architecture
This project follows a **REST API** architecture, ensuring scalability and decoupling between services.

### Post Suggestion Algorithm
The **Futures Algorithm** dynamically determines post visibility based on user interactions. It considers:
- **Engagement Score**: Calculated from likes, comments, and reposts.
- **Recency**: Newer posts receive a temporary visibility boost.
- **User Relevance**: Prioritizes posts from followed users and those with similar interests.
- **Decay Factor**: Older posts gradually lose visibility unless engagement is high.

## Installation

### Prerequisites
- Install [Bun](https://bun.sh/)
- Install [Docker](https://www.docker.com/)

### Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/twitter-clone.git && cd twitter-clone
   ```
2. Copy the example environment file and configure it:
   ```sh
   cp .env.example .env
   ```
3. Install dependencies:
   ```sh
   bun install
   ```
4. Start required services with Docker:
   ```sh
   docker-compose --env-file .env up -d
   ```
5. Generate the database schema:
   ```sh
   bun run db:generate
   ```
6. Apply migrations:
   ```sh
   bun run db:migrate
   ```
7. Start the application:
   ```sh
   bun run dev
   ```

### Optional Commands
- **Build Docker image**: `docker build -t twitter-clone .`
- **Run Docker container**: `docker run -p 7319:7319 twitter-clone`
- **Open Drizzle Studio**: `bun run db:studio`
- **Seed the database**: `bun run db:seed`

## Scripts
```sh
bun run dev          # Run in development mode
bun run db:generate  # Generate database schema
bun run db:migrate   # Apply database migrations
bun run db:studio    # Open Drizzle Studio
```

## License
MIT License
