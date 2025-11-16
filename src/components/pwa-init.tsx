'use client'

import { useEffect } from 'react'

export function PWAInit() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration)

            // Check for updates periodically
            setInterval(() => {
              registration.update()
            }, 60 * 60 * 1000) // Check every hour
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error)
          })
      })
    }

    // Add to home screen prompt
    let deferredPrompt: any
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e

      // Show custom install button (you can implement this)
      const installButton = document.getElementById('pwa-install-button')
      if (installButton) {
        installButton.style.display = 'block'
        installButton.addEventListener('click', () => {
          if (deferredPrompt) {
            deferredPrompt.prompt()
            deferredPrompt.userChoice.then((choiceResult: any) => {
              if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt')
              }
              deferredPrompt = null
            })
          }
        })
      }
    })

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed')
    })
  }, [])

  return null
}