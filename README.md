# Semantic Bookmarker
https://github.com/Trieuh2/semantic-bookmarker/assets/34781377/e1490ec0-a172-44e1-aac1-d7b8b30e3320



## Description

Semantic Bookmarker is an enhanced bookmarking tool that allows users to attribute addtitional text information with every bookmark. The application delivers a traditional bookmarking experience but introduces new capabilities to help manage, search, and maintain large amounts of bookmarks with ease.

### Key Functionalities
- **Semantic Categorization**: Utilizes TensorFlow and Universal Sentence Encoder model to automatically categorize a bookmark a user's most relevant pre-existing collection.
- **Enhanced Bookmarking**: Save and organize bookmarks with additional metadata, including web-scraped excerpts and user-defined tags, collections, and notes.
- **Enriched Search Results**: Search results provide bookmarks that contain the search query in any of the bookmark's metadata (title, note, collection name, tags, url, and web-scraped excerpt). 
- **Browser Extension**: Create, update and delete bookmarks using the custom browser extension.
- **Real-Time Updates**: Bookmark updates are performed in real-time with user input using Redis and a custom batch processing service worker on the backend server.
- **Session Synchronization**: User sessions are synchronized between the web application and local browser extension.
- **Responsive Design**: Optimistic updates provide a snappy experience similar to using offline programs.
- **Reusable Design**: Frontend components are developed in React and reused between the extension and web application for consistent UX.
- **User Friendly**: Click on the extension icon to add a bookmark for the current page. This app was designed with a traditional but enhanced experience in mind.
- **Authentication**: Users can login with Google OAuth or register with username and credentials (both integrated using Next-Auth).
- **Security**: Zero-trust architecture for performing actions/accessing resources. Passwords are encrypted using Bcrypt and temporary data stored in Redis is encrypted using AES-256-CBC.

## Browser Extension

![React badge](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript badge](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS badge](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Chrome Browser badge](https://img.shields.io/badge/Google_chrome-4285F4?style=for-the-badge&logo=Google-chrome&logoColor=white)

![Semantic Bookmarker Extension Demo](https://github.com/Trieuh2/semantic-bookmarker/assets/34781377/10a662f5-6876-465e-8d5d-cd491850a8c5)

### Frontend

The extension is built with React, TypeScript, and Tailwind CSS, providing a consistent user experience with the web application. It uses the Chrome Extensions API to extract information from the active tab's webpage and access the local cookie of the Semantic Bookmarker site for session synchronization and validation.

### Data Flow

![Screenshot of data flow diagram illustrating how data is transferred between client, server and databases](<media/Extension Data Flow.png>)
When the user clicks on the extension button, various requests are performed to validate the user session and perform any CRUD operations for Bookmarks, Tags, and Collections. The diagram illustrates the client, server, and database interactions that occur from within the browser extension as the starting point.

Every CRUD operation is always validated by the server using the sessionToken as the bearer token before performing any database action.

## Web Application

![React badge](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript badge](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS badge](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NextJS badge](https://img.shields.io/badge/next%20js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![MongoDB badge](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis badge](https://img.shields.io/badge/redis-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white)
![Prisma badge](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Cloudinary badge](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=white)
![TensorFlow badge](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)

![Semantic Bookmarker Web Demo](https://github.com/Trieuh2/semantic-bookmarker/assets/34781377/0f39dce0-41c2-4d14-9714-b42a1485a43c)

### Frontend

The frontend of the web application is built with React and TypeScript, ensuring a robust and scalable architecture. TailwindCSS is used for styling, providing a highly customizable and responsive design framework. This combination allows for a seamless and interactive user experience, aligning with the design principles established for the browser extension.

### Backend

Next.js was chosen as it simplified the development process by providing a cohesive environment for both frontend and backend development.

### MongoDB and Prisma

MongoDB is utilized for data storage with Prisma for managing complex data relationships:

- Collection can store multiple bookmarks. (1:M)
- Bookmarks belong to one collection. (1:1)
- Tags can be associated with multiple bookmarks (1:M)
- Bookmarks can have multiple tags (1:M)

### Cloudinary Integration

Cloudinary was chosen for this project due to its storage optimization, performance, and scalability.

- **Optimized FavIcon Storage**: To optimize storage and ensure consistency, the favIcons are stored based on each domain name (not each bookmark). This allows all bookmarks underneath a website to be represented by a single favIcon and allows for efficient storage and maintenance.
- **User-Specific Storage**: FavIcons are stored on a per-user basis to ensure unique user data and provide data isolation. This also means that favIcons belonging to a common non-unique domain name can differentiate between users (such as localhost).

### Machine Learning

This project uses [TensorFlow](https://www.tensorflow.org/js/guide/nodejs) and the [Universal Sentence Encoder (USE)](https://www.tensorflow.org/hub/tutorials/semantic_similarity_with_tf_hub_universal_encoder) model to semantically rank and match a user's bookmarks against their collections. This allows users to categorize their bookmarks based on the contextual meaning of their saved bookmark, rather than having to manually organize bookmarks to a contextually related collection.



#### Overview:
Note: This is currently implemented server-side.
1. Embeddings are created against all of the user's collection names.
2. An embedding is created using bookmark's metadata (combines the title, note, url, and excerpt).
3. Cosine similarity ranks the best matching collection to the bookmark.
4. Server returns the highest ranked collection to client for approving/denying the auto-match changes.

## Future Considerations

#### Server: Changing TensorFlow Models

The current implementation utilizes the [Universal Sentence Encoder (USE) model](https://www.tensorflow.org/hub/tutorials/semantic_similarity_with_tf_hub_universal_encoder) with TensorFlow in order to semantically rank and match a user's bookmark against all of their collections. Using a lighter-weight model can make the classification process more faster, but also may provide less useful classifications than the USE model.

#### Server: Switching to GPU-based TensorFlow

The current implementation uses the vanilla TensorFlow package, which runs pure JavaScript on the CPU. Switching to the [GPU-based package](https://www.tensorflow.org/js/guide/nodejs) is mentioned to be at least an order of magnitude faster than other binding options.

This would significantly improve the speed of all semantic matching operations and make batch-matching a possible additional feature to provide.

#### Client: Web Scraping

Implementing a client-side web-scraping process to extract the entire body of the page will further improve search results and semantic matching functionality.

#### Server: Additional Rate Limiting

Additional rate limiting can be implemented on more granular levels (per-user, per IP address, etc.) to prevent resource exhaustion and mitigate denial of service attacks.

DDoS mitigation services (CloudFlare, Akamai, AWS Shield, etc.) can also be integrated to frontload the large volumes of traffic and protect the server from malicious traffic.

#### Database: Fuzzy Search

Creating text indexes against the Bookmark model's string fields would allow for fuzzy searching and allow users to find bookmarks without having to enter very specific keywords to retrieve desired results. It may also remove the need for semantic matching on the server-level, since the NLP-based features would be used on the database-level.

**Resource**: https://www.mongodb.com/resources/basics/full-text-search

## Lessons Learned:

Developing the Semantic Bookmarker has provided valuable insights into various aspects of full-stack development, including:

- **Browser Extension Development**:
  - Managing extension lifecycle under [Chrome Extensions API Manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3) requirements.
  - Synchronizing user session from local cookie data to database sessions.
- **Optimizing Data Flow**:
  - Ensuring efficient and secure data flow between the client (extension and web app), server, and database.
  - Implementing scalable storage method for images in Cloudinary to improve data accuracy and storage utilization.
  - Batching real-time updates through Redis before serving long-term storage (MongoDB).
- **Handling Real-time Data**:
  - Ensuring cost-efficient and performant request handling via batched updates to Redis prior to executing requests to long-term storage (MongoDB).
- **Security and Authentication**:
  - Incorporating Zero-Trust architecture across all resources in both the web app and extension.
  - Building custom authentication and session management mechanisms.
  - Encrypting batched updates at rest within Redis using AES-256-CBC.
- **Client-side Optimizations**:
  - Implementing custom optimistic updates in every area of the web application to improve UI responsiveness.
