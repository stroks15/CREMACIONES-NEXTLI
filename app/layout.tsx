import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'NEXTLI · Cremación de Mascotas', description: 'Servicios de cremación de mascotas NEXTLI', manifest: '/manifest.webmanifest' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html> }
