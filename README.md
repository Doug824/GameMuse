# GameKindle

GameKindle is a React-based web application that helps users discover new video games based on their interests. It uses the RAWG API to fetch game data and provides features like game search, filters, favorites, and detailed game information.

## Features

- Search for games by title
- View game details including screenshots, platforms, ratings, and descriptions
- Discover similar games
- Save and manage favorite games
- Filter games by genre, release year, platform, and more
- Sort games by various criteria

## Tech Stack

- React (with Vite)
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- RAWG Video Games Database API
- React Context API for state management

## Setup and Installation

1. Clone this repository
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your RAWG API key:
   ```
   VITE_RAWG_API_KEY=your_rawg_api_key_here
   ```
   You can get an API key by creating an account at [RAWG API](https://rawg.io/apidocs)

4. Start the development server
   ```
   npm run dev
   ```

## Required Dependencies

Make sure to install these dependencies:

```
npm install react-router-dom axios @tailwindcss/typography
```

## Build for Production

```
npm run build
```

## License

MIT