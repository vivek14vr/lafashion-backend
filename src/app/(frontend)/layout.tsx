import React from 'react'

export const metadata = {
  description: 'LA Fashion Closet CMS',
  title: 'LA Fashion Closet Admin',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
