import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Language, LanguageContextType } from '../models'

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    // Header
    appTitle: 'Munch and Match',
    appSubtitle: 'AI-Powered Weather Companion',
    headerTagline: 'Food × Sports × Weather',

    // Hero
    heroTagline: '🌟 Your Personal Weather Advisor',
    heroTitle: 'Discover Your Perfect Day',
    heroSubtitle: 'Get personalized food and sports recommendations based on weather conditions and AI insights',
    voiceSupport: 'Voice Commands',
    realTimeWeather: 'Live Weather Data',
    aiSuggestions: 'Smart Recommendations',

    // Weather Card
    currentWeather: '🌡️ Current Conditions',
    humidity: '💧 Humidity',
    windSpeed: '💨 Wind Speed',
    temperature: '🌡️ Temperature',
    feelsLike: '🌡️ Feels Like',
    visibility: '👁️ Visibility',

    // Chat
    assistantTitle: 'Your Weather Assistant',
    assistantDescription: '🍽️ AI-powered food and sports suggestions for any weather',
    welcomeTitle: 'Hello there!',
    welcomeMessage: 'I\'m here to help you enjoy the perfect food and activities based on today\'s weather',
    exampleQueries: {
      weather: '"How\'s the weather in Tokyo?"',
      food: '"What should I eat on a cold day?"',
      sports: '"Best sports for sunny weather?"'
    },
    thinking: 'AI is thinking...',

    // Input
    inputTitle: 'Ask me anything',
    inputDescription: 'Weather, food, sports, or any question you have',
    inputPlaceholder: 'Ask me about weather, food, or sports...',
    listening: '🎤 Listening to your voice...',
    voiceNotSupported: 'ℹ️ Voice input is not available in this browser',
    voiceError: '⚠️',
    send: 'Send',
    sending: 'Sending...',

    // System
    systemPrompt: 'You are a helpful AI assistant specializing in food and sports recommendations based on weather conditions. Please respond in English and provide practical, enjoyable advice.'
  },
  ja: {
    // Header
    appTitle: 'ムンク＆マッチ',
    appSubtitle: 'AI搭載天気コンパニオン',
    headerTagline: '食べ物 × スポーツ × 天気',

    // Hero
    heroTagline: '🌟 あなた専用の天気アドバイザー',
    heroTitle: '完璧な一日を見つけよう',
    heroSubtitle: '天気とAIの洞察に基づいて、パーソナライズされた食べ物とスポーツの提案を受け取りましょう',
    voiceSupport: '音声コマンド',
    realTimeWeather: 'リアルタイム天気データ',
    aiSuggestions: 'スマート提案',

    // Weather Card
    currentWeather: '🌡️ 現在の天候',
    humidity: '💧 湿度',
    windSpeed: '💨 風速',
    temperature: '🌡️ 気温',
    feelsLike: '🌡️ 体感温度',
    visibility: '👁️ 視界',

    // Chat
    assistantTitle: 'あなたの天気アシスタント',
    assistantDescription: '🍽️ どんな天気でもAI搭載の食べ物とスポーツの提案',
    welcomeTitle: 'こんにちは！',
    welcomeMessage: '今日の天気に基づいて、完璧な食べ物とアクティビティを楽しむお手伝いをします',
    exampleQueries: {
      weather: '「東京の天気はどう？」',
      food: '「寒い日は何を食べればいい？」',
      sports: '「晴れた日に最適なスポーツは？」'
    },
    thinking: 'AIが考え中...',

    // Input
    inputTitle: '何でも聞いてください',
    inputDescription: '天気、食べ物、スポーツ、何でも質問してください',
    inputPlaceholder: '天気、食べ物、スポーツについて聞いてみて...',
    listening: '🎤 あなたの声を聞いています...',
    voiceNotSupported: 'ℹ️ このブラウザでは音声入力が利用できません',
    voiceError: '⚠️',
    send: '送信',
    sending: '送信中...',

    // System
    systemPrompt: 'あなたは天気に基づいた食べ物とスポーツの提案を専門とする親切なAIアシスタントです。日本語で回答し、実用的で楽しいアドバイスを提供してください。'
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('weather-app-language') as Language
    if (saved && (saved === 'en' || saved === 'ja')) {
      setLanguage(saved)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('weather-app-language', language)
  }, [language])

  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}