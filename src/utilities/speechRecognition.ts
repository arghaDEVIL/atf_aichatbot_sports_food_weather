import { useState, useCallback, useRef, useEffect } from 'react'

interface UseVoiceInputProps {
  onResult: (transcript: string) => void
  language: 'en' | 'ja'
}

interface UseVoiceInputReturn {
  isListening: boolean
  isSupported: boolean
  error: string | null
  transcript: string
  startListening: () => void
  stopListening: () => void
}

// Declare global types for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export function useSpeechRecognition({
  onResult,
  language
}: UseVoiceInputProps): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState('')

  const recognitionRef = useRef<any>(null)
  const isStoppingRef = useRef(false)

  useEffect(() => {
    // Check if SpeechRecognition is supported
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition

    console.log('Speech Recognition supported:', !!SpeechRecognition)

    if (SpeechRecognition) {
      setIsSupported(true)

      const recognition = new SpeechRecognition()
      recognition.continuous = true  // Allow continuous listening
      recognition.interimResults = true  // Get interim results
      recognition.lang = language === 'en' ? 'en-US' : 'ja-JP'
      recognition.maxAlternatives = 1

      console.log('Setting up speech recognition for language:', recognition.lang)

      recognition.onstart = () => {
        console.log('Speech recognition started')
        isStoppingRef.current = false
        setIsListening(true)
        setError(null)
        setTranscript('')
      }

      recognition.onresult = (event: any) => {
        console.log('Speech recognition result received')
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interimTranscript += result[0].transcript
          }
        }

        const currentTranscript = finalTranscript || interimTranscript
        console.log('Transcript:', currentTranscript)
        setTranscript(currentTranscript)

        if (finalTranscript.trim()) {
          onResult(finalTranscript.trim())
          isStoppingRef.current = true
          recognition.stop() // Stop after getting final result
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        
        // Don't show error for aborted or if we're intentionally stopping
        if (event.error === 'aborted' || isStoppingRef.current) {
          setIsListening(false)
          return
        }

        let errorMessage

        switch (event.error) {
          case 'no-speech':
            errorMessage = language === 'en'
              ? 'No speech was detected. Please try again.'
              : '音声が検出されませんでした。もう一度お試しください。'
            break
          case 'audio-capture':
            errorMessage = language === 'en'
              ? 'No microphone was found. Please check your microphone.'
              : 'マイクが見つかりません。マイクを確認してください。'
            break
          case 'not-allowed':
            errorMessage = language === 'en'
              ? 'Microphone access was denied. Please allow microphone access.'
              : 'マイクアクセスが拒否されました。マイクアクセスを許可してください。'
            break
          case 'network':
            errorMessage = language === 'en'
              ? 'Network error occurred. Please check your internet connection.'
              : 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
            break
          default:
            errorMessage = language === 'en'
              ? `Speech recognition error: ${event.error}`
              : `音声認識エラー: ${event.error}`
        }

        setError(errorMessage)
        setIsListening(false)
      }

      recognition.onend = () => {
        console.log('Speech recognition ended')
        setIsListening(false)
      }

      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
      const errorMessage = language === 'en'
        ? 'Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'
        : 'お使いのブラウザは音声認識に対応していません。Chrome、Edge、またはSafariをご利用ください。'
      setError(errorMessage)
    }

    return () => {
      if (recognitionRef.current) {
        try {
          // Only abort if it's actually running
          if (isListening) {
            recognitionRef.current.stop()
          }
        } catch (e) {
          console.log('Error stopping recognition:', e)
        }
      }
    }
  }, [language, onResult])

  const startListening = useCallback(async () => {
    console.log('Attempting to start speech recognition...')
    console.log('Current state - isListening:', isListening, 'isSupported:', isSupported)

    if (!isSupported) {
      const errorMessage = language === 'en'
        ? 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'
        : 'お使いのブラウザは音声認識に対応していません。Chrome、Edge、またはSafariをご利用ください。'
      setError(errorMessage)
      return
    }

    if (isListening) {
      console.log('Speech recognition is already listening')
      return
    }

    // Check microphone permissions first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('Microphone permission granted')
      // Stop the stream immediately as we only need permission
      stream.getTracks().forEach(track => track.stop())
    } catch (permissionError) {
      console.error('Microphone permission denied:', permissionError)
      const errorMessage = language === 'en'
        ? 'Microphone permission is required for voice input. Please allow microphone access and try again.'
        : 'マイクへのアクセス許可が必要です。マイクへのアクセスを許可して再度お試しください。'
      setError(errorMessage)
      return
    }

    if (recognitionRef.current) {
      try {
        // Reset any previous errors
        setError(null)
        setTranscript('')
        isStoppingRef.current = false
        
        console.log('Starting speech recognition with language:', recognitionRef.current.lang)
        recognitionRef.current.start()
        console.log('Speech recognition start() called successfully')
      } catch (err) {
        console.error('Failed to start speech recognition:', err)
        const errorMessage = language === 'en'
          ? `Could not start voice recognition: ${err}`
          : `音声認識を開始できませんでした: ${err}`
        setError(errorMessage)
        setIsListening(false)
      }
    } else {
      const errorMessage = language === 'en'
        ? 'Speech recognition not initialized'
        : '音声認識が初期化されていません'
      setError(errorMessage)
    }
  }, [isListening, language, isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      isStoppingRef.current = true
      recognitionRef.current.stop()
    }
  }, [isListening])

  return {
    isListening,
    isSupported,
    error,
    transcript,
    startListening,
    stopListening,
  }
}