"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Leaf, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { login } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"

const BACKGROUND_IMAGE = "https://static.independent.co.uk/2022/04/06/10/solar%20panel%20night%20electricity.jpg?width=1200&height=800&crop=1200:800"

export default function LoginPage() {
  const router = useRouter()
  const loginStore = useAuthStore((state) => state.login)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const res = await login(username, password)
    
    if (res.success && res.user_id) {
      loginStore(res.user_id)
      router.push("/dashboard")
    } else {
      setError("Invalid username or password")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-4 left-4 z-20 p-2 rounded-lg hover:bg-background/20 transition-colors"
      >
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back to About</span>
        </Button>
      </Link>

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={BACKGROUND_IMAGE}
          alt="Solar panels at night"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        {/* Dark blur overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>
      
      <Card className="w-full max-w-md bg-card/95 border-border backdrop-blur-sm relative z-10 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">GreenExchange</CardTitle>
          <CardDescription className="text-muted-foreground">
            Trade Renewable Energy Certificates & Carbon Credits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input border-border"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input border-border"
                  required
                />
              </Field>
            </FieldGroup>
            
            {error && (
              <p className="text-destructive text-sm mt-4">{error}</p>
            )}
            
            <Button
              type="submit"
              className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          <p className="text-center text-muted-foreground text-sm mt-6">
            Demo credentials: user1 / pass1
          </p>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          
          <p className="text-center text-muted-foreground text-sm">
            {"Don't have an account?"}{" "}
            <Link href="/register" className="text-primary hover:underline">
              Create Account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
