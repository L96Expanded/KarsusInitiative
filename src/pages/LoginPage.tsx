import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Shield } from 'lucide-react'

const loginSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = loginSchema.extend({
  username: z.string().min(2, 'Username must be at least 2 characters').max(30),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})

type LoginForm    = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export default function LoginPage() {
  const { login, register: registerUser } = useAuth()
  const [mode, setMode]         = useState<'login' | 'register'>('login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const handleLogin = loginForm.handleSubmit(async (data) => {
    setLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('Welcome back, adventurer!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  })

  const handleRegister = registerForm.handleSubmit(async (data) => {
    setLoading(true)
    try {
      await registerUser(data.email, data.username, data.password)
      toast.success('Your legend begins!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  })

  return (
    <div className="min-h-screen bg-adventure bg-dragon-scale flex items-center justify-center p-4">
      {/* Atmospheric background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-dnd-amber/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-dnd-teal/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-dnd-crimson/6 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-dnd-crimson/20 border-2 border-dnd-crimson mb-4 shadow-glow-red">
            <Shield className="w-10 h-10 text-dnd-gold" />
          </div>
          <h1 className="font-display text-3xl text-dnd-gold tracking-widest">KARSUS</h1>
          <p className="font-body text-dnd-muted tracking-[0.3em] text-sm mt-1">INITIATIVE TRACKER</p>
        </div>

        {/* Card */}
        <div className="dnd-card p-8">
          {/* Tabs */}
          <div className="flex mb-8 border-b border-dnd-border">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 pb-3 font-body text-sm tracking-widest uppercase transition-colors ${
                mode === 'login'
                  ? 'text-dnd-gold border-b-2 border-dnd-gold -mb-px'
                  : 'text-dnd-muted hover:text-dnd-parchment'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 pb-3 font-body text-sm tracking-widest uppercase transition-colors ${
                mode === 'register'
                  ? 'text-dnd-gold border-b-2 border-dnd-gold -mb-px'
                  : 'text-dnd-muted hover:text-dnd-parchment'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="dnd-label">Email</label>
                <input
                  {...loginForm.register('email')}
                  id="login-email"
                  type="email"
                  placeholder="adventurer@realm.com"
                  className="dnd-input"
                  autoComplete="email"
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-red-400 text-xs">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="login-password" className="dnd-label">Password</label>
                <div className="relative">
                  <input
                    {...loginForm.register('password')}
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="dnd-input pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dnd-muted hover:text-dnd-parchment"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-red-400 text-xs">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <button type="submit" disabled={loading} className="dnd-button-primary w-full mt-2">
                {loading ? 'Entering the Realm…' : 'Enter the Realm'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label htmlFor="register-email" className="dnd-label">Email</label>
                <input
                  {...registerForm.register('email')}
                  id="register-email"
                  type="email"
                  placeholder="adventurer@realm.com"
                  className="dnd-input"
                  autoComplete="email"
                />
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-red-400 text-xs">{registerForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="register-username" className="dnd-label">Username</label>
                <input
                  {...registerForm.register('username')}
                  id="register-username"
                  type="text"
                  placeholder="TheLegendaryDM"
                  className="dnd-input"
                  autoComplete="username"
                />
                {registerForm.formState.errors.username && (
                  <p className="mt-1 text-red-400 text-xs">{registerForm.formState.errors.username.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="register-password" className="dnd-label">Password</label>
                <div className="relative">
                  <input
                    {...registerForm.register('password')}
                    id="register-password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="dnd-input pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dnd-muted hover:text-dnd-parchment"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-red-400 text-xs">{registerForm.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="register-confirm" className="dnd-label">Confirm Password</label>
                <input
                  {...registerForm.register('confirm')}
                  id="register-confirm"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="dnd-input"
                  autoComplete="new-password"
                />
                {registerForm.formState.errors.confirm && (
                  <p className="mt-1 text-red-400 text-xs">{registerForm.formState.errors.confirm.message}</p>
                )}
              </div>
              <button type="submit" disabled={loading} className="dnd-button-primary w-full mt-2">
                {loading ? 'Forging Legend…' : 'Begin Your Legend'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-dnd-muted text-xs mt-6 font-ui italic">
          "Roll for initiative."
        </p>
      </div>
    </div>
  )
}
