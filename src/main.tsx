import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://ntdia-nestjs-api-production.up.railway.app/graphql',
  cache: new InMemoryCache(),
})

const root = createRoot(document.getElementById('root')!)
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
)

