import RegisterForm from '@/components/auth/RegisterForm'

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass mx-auto max-w-sm w-full p-6 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-2 gradient-brand bg-clip-text text-transparent">
          Create account
        </h1>
        <p className="text-neutral-400 text-sm mb-6">Get started with Daira</p>
        <RegisterForm />
      </div>
    </div>
  )
}
