import { API_URL } from './api'

interface LoginDto {
  email: string
  password: string
}

interface RegisterDto {
  email: string
  password: string
  username?: string
}

export async function loginApi(dto: LoginDto) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

export async function registerApi(dto: RegisterDto) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })
  if (!res.ok) throw new Error('Register failed')
  return res.json()
}

export default { loginApi, registerApi }
