'use client'
import { useState } from 'react'
import Image from 'next/image'
import styles from './page.module.css'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Loader from '@/components/Loader'

// create your API key here https://aistudio.google.com/app/apikey
const API_KEY = process.env.NEXT_PUBLIC_API_KEY
const Home = () => {
  const [file, setFile] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const genAI = new GoogleGenerativeAI(API_KEY)

  async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result.split(',')[1])
      reader.readAsDataURL(file)
    })
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type }
    }
  }

  const fetchDataProVision = async () => {
    if (!file || !prompt) {
      alert('Please select an image and enter a prompt')
      return
    }
    setResponse(null)
    setLoading(true)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    try {
      const fileInputEl = document.querySelector('input[type=file]')
      const imageParts = await Promise.all(
        [...fileInputEl.files].map(fileToGenerativePart)
      )

      const result = await model.generateContent([prompt, ...imageParts])
      const response = await result.response
      const text = response.text()
      setLoading(false)
      setResponse(text)
      setPrompt('')
    } catch (error) {
      setError(`Oops, an error occurred: ${error}`)
      console.log(error)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    const reader = new FileReader()
    reader.onloadend = () => {
      setFile(reader.result)
    }
    if (file && allowedTypes.includes(file.type)) {
      reader.readAsDataURL(file)
    } else {
      alert('Please select a valid image file')
      event.target.value = null;
    }
  }

  const handlePromptChange = (event) => {
    setPrompt(event.target.value)
  }

  const getTitle = () => {
    return <h1 className={styles.main__title}>Gemini 1.5 Flash Demo</h1>
  }

  const getImage = () => {
    if (file) {
      return (
        <Image
          className={styles.main__img}
          src={file}
          alt='Selected'
          width={400}
          height={400}
        ></Image>
      )
    }
    return (
      <Image
        className={styles.main__img}
        src={'/placeholder.jpg'}
        alt='Selected'
        width={400}
        height={400}
        priority
      ></Image>
    )
  }

  const getInputFile = () => {
    return (
      <input
        className={styles.main__inputFile}
        type='file'
        aria-label='Select an image'
        onChange={handleFileChange}
      />
    )
  }

  const getInputPrompt = () => {
    return (
      <textarea
        rows='4'
        cols='50'
        className={styles.main__inputPrompt}
        type='text'
        value={prompt}
        onChange={handlePromptChange}
        placeholder='Enter a prompt or what you want to solve!'
      />
    )
  }
  //ggs
  //noice
//done
//ok
//let's see

  const getButton = () => {
    if (loading) return null
    return (
      <button className={styles.main__btn} onClick={fetchDataProVision}>
        Generate
      </button>
    )
  }

  const getResponse = () => {
    if (response === null) return null
    if (response === '') return <p className={styles.main__response}>No response found, try a different prompt.</p>
    return <p className={styles.main__response}>Response: {response}</p>
  }

  const getLoader = () => {
    if (!loading) return null
    return <Loader/>
  }

  const getError = () => {
    if (error) return <p className={styles.main__error}>Error: {error}</p>
  }

  return (
    <main className={styles.main}>
        {getTitle()}
        {getImage()}
        {getInputFile()}
        {getInputPrompt()}
        {getButton()}
        {getLoader()}
        {getResponse()}
        {getError()}
    </main>
  )
}

export default Home
