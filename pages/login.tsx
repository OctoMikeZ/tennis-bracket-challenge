import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) alert(error.message)
      else {
        const returnUrl = router.query.returnUrl as string || '/'
        router.push(returnUrl)
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) alert(error.message)
      else alert('Check your email for confirmation!')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl mb-6">
        {isLogin ? 'Login' : 'Sign Up'} to Fantasy Tennis
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
        <button 
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-blue-500 underline"
        >
          {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
        </button>
      </form>
    </div>
  )
}