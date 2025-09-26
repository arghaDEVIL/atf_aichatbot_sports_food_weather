# WeatherFood & Sports Setup Guide

## API Keys Required

### 1. Google Gemini API Key (Required)
- Visit: https://ai.google.dev/
- Create an account and get your API key
- Already configured in `.env` file

### 2. OpenWeatherMap API Key (Required for weather data)
- Visit: https://openweathermap.org/api
- Sign up for a free account
- Get your API key from the dashboard
- Add it to `.env` file:
  ```
  VITE_OPENWEATHER_API_KEY=your_actual_api_key_here
  ```

## Features

### 🌤️ Weather Integration
- Real-time weather data from OpenWeatherMap API
- Automatic city detection from user input using AI
- Comprehensive weather metrics (temperature, humidity, wind, etc.)

### 🍽️ Food Recommendations
- AI-powered food suggestions based on weather conditions
- Considers temperature, humidity, and weather conditions
- Personalized recommendations for different weather scenarios

### 🏃‍♂️ Sports & Activities
- Weather-appropriate sports and activity suggestions
- Indoor and outdoor options based on conditions
- Safety considerations for different weather types

### 🤖 AI Conversation
- Natural language processing with Google Gemini
- Context-aware conversations about weather, food, and sports
- Maintains conversation history for better responses

## How It Works

1. **User Input**: User asks about weather, food, or sports
2. **AI Processing**: Gemini extracts city and date from the query
3. **Weather Fetch**: Real weather data is fetched from OpenWeatherMap
4. **AI Recommendations**: Gemini generates food and sports suggestions
5. **Response**: User gets weather data + personalized recommendations

## Example Queries

- "What's the weather like in Tokyo today?"
- "What should I eat on a cold day in London?"
- "Best sports for sunny weather in Miami?"
- "Weather forecast for New York tomorrow?"

## Setup Steps

1. Clone the repository
2. Install dependencies: `npm install`
3. Get API keys (see above)
4. Update `.env` file with your OpenWeatherMap API key
5. Run the app: `npm run dev`

## Current Status

✅ **Gemini API**: Already configured and working
⚠️ **OpenWeatherMap API**: Needs configuration (currently using mock data)

## Note

The app will work with mock weather data if OpenWeatherMap API key is not configured. For real weather data, add your OpenWeatherMap API key to the `.env` file.

## Testing

Try these example queries:
- "What's the weather like in Tokyo?"
- "Food recommendations for cold weather"
- "Best sports for rainy days"