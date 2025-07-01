// PROSECU - Configuración principal de la aplicación Next.js
import { SessionProvider } from 'next-auth/react'
import Head from 'next/head'
import '../styles/globals.css'

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>PROSECU - Sistema de Gestión de Personal</title>
        <meta name="description" content="Sistema integral de gestión de personal para mantenimiento de transformadores" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  )
}