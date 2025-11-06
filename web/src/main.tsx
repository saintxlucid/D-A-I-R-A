import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAuthStore } from './state/auth'
import './index.css'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
const httpLink = createHttpLink({ uri: `${apiUrl}/graphql` })
const authLink = setContext((_, { headers }) => {
  const token = useAuthStore.getState().token
  return { headers: { ...headers, authorization: token ? `Bearer ${token}` : '' } }
})

export const apollo = new ApolloClient({ 
  link: authLink.concat(httpLink), 
  cache: new InMemoryCache() 
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={apollo}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)