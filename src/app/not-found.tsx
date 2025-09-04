import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      padding: '1rem',
      backgroundColor: '#F6F8F7'
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#22C58B' }}>404</h1>
      <h2 style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>Page non trouvée</h2>
      <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link 
        href="/" 
        style={{ 
          marginTop: '1.5rem', 
          padding: '0.75rem 1.5rem',
          backgroundColor: '#22C58B',
          color: 'white',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          fontWeight: '500'
        }}>
        Retour à l'accueil
      </Link>
    </div>
  )
}
