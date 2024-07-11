# Twitter Clone Project

## [Version 1.0](https://your-project-v1-link.com)

## Introduction

This is a comprehensive Twitter clone built with modern technologies including [Bun](https://bun.sh/), [Express](https://expressjs.com/), [PostgreSQL](https://www.postgresql.org/), [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm), [Redis](https://redis.io/), and [TypeScript](https://www.typescriptlang.org/). It offers a full-featured backend infrastructure for managing various aspects of a social media platform.

## Features

- **Authentication**: Supports email verification and JWT-based authentication with access and refresh tokens.
- **Email Verification**: Sends verification codes to users' emails.
- **User Management**: 
  - Update profile and account information.
  - Follow/unfollow users.
- **Post Management**: Create, edit, and delete posts.
- **Post Suggestion Algorithm**: 
  - Automatically suggests posts to 15% of total users.
  - Liked posts increase the suggestion percentage, making them visible to more users.
  - Disliked posts decrease the suggestion percentage.
  - Comments have the same effect as likes.
  - If a user frequently likes posts from a specific user, more posts from that user will be suggested.
- **User Suggestion Algorithm**:
  - Suggests users with the most followers.
  - Suggests users whose posts are frequently liked by the current user.
  - Suggests users followed by the people I follow.
  - Suggests users who like similar posts as the current user.
- **Save Posts**: Users can save posts.
- **Tags**: Supports tagging posts.
- **CRUD Operations**: Full CRUD operations for comments and replies.
- **Notifications**: Notifies users when their posts are liked or when they are followed.

## Technologies Used

### Docker
Docker is a platform designed to help developers build, share, and run applications in containers. Containers are lightweight, portable, and ensure consistency across different environments. Docker simplifies deployment and scaling of applications. [Docker](https://www.docker.com/)

### Drizzle ORM
Drizzle ORM is a lightweight TypeScript ORM for SQL databases. It provides type-safe database interactions and simplifies complex SQL queries. Drizzle ORM integrates well with TypeScript, making it easier to manage database schema and migrations. [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm)

### PostgreSQL
PostgreSQL is a powerful, open-source relational database system. It is known for its robustness, scalability, and support for advanced data types and performance optimization features. PostgreSQL is widely used in modern web applications for reliable data storage. [PostgreSQL](https://www.postgresql.org/)

### Express
Express is a minimal and flexible Node.js web application framework. It provides a robust set of features for building web and mobile applications, such as routing, middleware support, and template engines. Express is widely used for creating RESTful APIs. [Express](https://expressjs.com/)

### Cloudinary
Cloudinary is a cloud-based service that provides an end-to-end solution for managing images and videos. It offers powerful APIs for uploading, storing, transforming, and delivering media content efficiently. Cloudinary is useful for handling media in web applications. [Cloudinary](https://cloudinary.com/)

### Helmet
Helmet is a middleware for Express applications that helps secure HTTP headers. It provides various security features, such as preventing cross-site scripting (XSS) attacks, clickjacking, and other vulnerabilities by setting appropriate HTTP headers. [Helmet](https://helmetjs.github.io/)

### Redis
Redis is an in-memory data structure store used as a database, cache, and message broker. It supports various data structures, such as strings, hashes, lists, and sets. Redis is known for its high performance and is often used for caching and session management. [Redis](https://redis.io/)

### Joi
Joi is a powerful schema description language and data validator for JavaScript. It allows you to create blueprints for JavaScript objects to ensure data validation and integrity. Joi is often used for validating request payloads in APIs. [Joi](https://joi.dev/)

### JSON Web Token (jsonwebtoken)
JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties. JWTs are commonly used for authentication and authorization in web applications. The `jsonwebtoken` library provides tools for generating and verifying JWTs. [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)

### TypeScript
TypeScript is a strongly typed superset of JavaScript that compiles to plain JavaScript. It adds optional static typing to the language, enhancing code quality and maintainability. TypeScript is widely used in modern web development for building large-scale applications. [TypeScript](https://www.typescriptlang.org/)

### ESLint
ESLint is a static code analysis tool for identifying problematic patterns in JavaScript and TypeScript code. It helps maintain code quality by enforcing coding standards and best practices. ESLint is highly configurable and supports custom rules. [ESLint](https://eslint.org/)

## Installation

### Install Dependencies

```shell
npm install -g bun
bun install # install project dependencies
```

#### Setting up
3. Install dependencies of backend using : `bun install`
4. Run the database using Docker : `docker-compose --env-file .env up -d`
5. Generate database schema with Drizzle : `bun run db:generate` 
6. Apply database migrations with Drizzle : `bun run db:migrate` 
7. Start the application in development mode : `bun run dev`
8. `Optional` : Creating a Docker image : `docker build -t twitter-clone .` 
9. `Optional` : Running a Docker container : `docker run -p 7319:7319 twitter-clone` 
10. `Optional` : Open Drizzle Studio for database management : `bun run db:studio` 
11. `Optional` : Populate the database with initial data : `bun run db:seed`

### Setup .env file
Create a .env file in the root directory of your project and add the following environment variables:
``` shell
PORT 
DATABASE_URL 
REDIS_URL 
NODE_ENV 
CLOUDINARY_CLOUD_NAME 
CLOUDINARY_API_KEY 
CLOUDINARY_API_SECRET 
ACTIVATION_TOKEN 
ACCESS_TOKEN 
REFRESH_TOKEN 
ACCESS_TOKEN_EXPIRE 
REFRESH_TOKEN_EXPIRE 
SMTP_HOST 
SMTP_PORT 
SMTP_SERVICE 
SMTP_MAIL 
SMTP_PASSWORD 
ORIGIN 
```

### Scripts
```shell
bun run dev # Run in development mode with --watch
bun run db:generate # Generate database schema with Drizzle
bun run db:migrate # Apply database migrations with Drizzle
bun run db:studio # Open Drizzle Studio for database management
```