# **NestJS GraphQL Permission System**

This is a backend system built with **NestJS** and **GraphQL** to manage a permission system based on tweets, groups, and user roles. The application allows users to interact with tweets and groups, and manages permissions like viewing and editing tweets, following a group-based model.

## **Project Overview**
This project implements a **permission system** for managing tweets in a platform inspired by Twitter. Users can create groups, assign permissions for viewing and editing tweets, and decide on inheritance strategies.

The project uses **NestJS** with **TypeScript** and **GraphQL** for the API. It also incorporates caching, and optimized query handling for high traffic.

---

## **Features**
- **Group Management**: Users can create and manage groups.
- **Tweet Permissions**: Users can set view/edit permissions for tweets and configure inheritance of permissions from parent tweets.
- **Caching**: Optimized querying with caching mechanisms for frequently accessed data.
- **Pagination**: Supports paginated tweet queries to handle large datasets efficiently.
---

## **Tech Stack**
- **NestJS**: Framework for building scalable backend applications with Node.js.
- **GraphQL**: API query language for better flexibility in data fetching.
- **PostgreSQL**: Relational database to store groups, users, and tweet data.
- **TypeORM**: ORM for interacting with PostgreSQL.
- **Redis**: Optional for caching tweet permissions.

---

## **Requirements**
- **Node.js** >= 18.x.x
- **NestJS CLI** (Optional, for easier project setup)
- **PostgreSQL** database
- **Redis** (Optional for caching)

---

## **Installation**

### **1. Clone the Repository**

```bash
git clone https://github.com/nekooei/permission-system.git
cd permission-system
```

### **2. Install Dependencies**

```bash
npm install
```
or
```bash
yarn install
```

### **3. Set up Environment Variables**

Create a `.env` file in the root directory and configure the following variables:

```env
NODE_ENV=development
DATABASE_URL=postgres://bettermode_user:bettermode_pass@localhost:5432/bettermode_db
CACHE_TTL=60
PORT=3000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### **4. Database Setup**
You don't need any work for setup Database, the **typeorm** will synchronise the entity on running application.
This is not a real world practice but for this development purpose it is enough.

**For Real world practice we should have migrations and seed for database setup**

### **Also you can seed sample data from `data.zip` file provided in this repository**

### **5. Run the Project (Stand Alone)**

To start the application locally:

```bash
npm run start:dev
```

### **6. Run the Project (Using Docker)**

To start the application locally:

```bash
docker-compose up --build -d
```

This will run the app in development mode at `http://localhost:3000/graphql`.

---

## **GraphQL API Overview**

The API exposes the following operations via GraphQL:

### **Mutations**

#### 1. **createGroup**: Create a group with users and other groups
```graphql
mutation {
    createGroup(
        input: {
            title: "Investors"
            userIds: [

            ]
        }
    ) {
        id
        title
    }
}

```

#### 2. **createTweet**: Create a tweet
```graphql
mutation {
    createTweet(
        input: {
            authorId: "a58421ff-d29a-463d-9e09-0ba562f42710"
            content: "Reply To the tweet!"
            hashtags: ["First", "Hello world!"]
            category: News
            parentTweetId:"7766006e-f5d8-4fd1-be45-54a5bc32433a"
        }
    ) {
        id
    }
}
```

#### 3. **updateTweetPermissions**: Update permissions for a tweet
```graphql
mutation {
    updateTweetPermissions(
        input: {
            actorId: "a58421ff-d29a-463d-9e09-0ba562f42710"
            tweetId: "7766006e-f5d8-4fd1-be45-54a5bc32433a"
            viewPermissions: [
                "a58421ff-d29a-463d-9e09-0ba562f42710"
            ]
            inheritViewPermissions: true
            inheritEditPermissions: false
            editPermissions: ["a58421ff-d29a-463d-9e09-0ba562f42710"]
            viewPermissionGroups: []
        }
    )
}

```

### **Queries**

#### 1. **paginateTweets**: Get paginated tweets for a specific user
```graphql
query {
    getAllTweets(pagination: { limit: 13, page: 1 }) {
        nodes {
            id
            content
            parentTweetId
            author{
                id
                name
            }
        }
        hasNextPage
    }
}
```

#### 2. **canEditTweet**: Check if a user can edit a tweet
```graphql
query {
  canEditTweet(userId: "user1", tweetId: "tweetId") 
}
```

#### 3. **canViewTweet**: Check if a user can view a tweet
```graphql
query {
    canViewTweet(
        userId: "19a9834e-6d4a-4b3c-9c19-3f9ab0e960bd"
        tweetId: "976558b1-e789-4d4d-a76a-f11d288e4fdc"
    )
}
```
#### 3. **getAllGroups**: List all groups with their members
```graphql
query{
  getAllGroups{
    id
    title
    users{
      id
      name
    }
  }
}
```

## **Caching**

The application uses **Redis** (optional) for caching permissions and tweets, ensuring faster data retrieval under high traffic conditions.

### **Cache Invalidation Strategy**
- **User-specific cache**: Cache tweets and permissions for specific users to avoid recalculating access on each request.
- **Permissions update**: When permissions for a tweet are updated, the cache for that tweet is invalidated.

---

## **Performance Considerations**
- **Database Optimization**: The system is designed to handle millions of tweets and group memberships, leveraging **PostgreSQL** optimizations.
- **Horizontal Scaling**: For high availability and scalability, consider deploying multiple instances of the application with a load balancer.

---



Let me know if you need further details or any adjustments!