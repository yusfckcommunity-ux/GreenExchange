"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2, User, Mail, Phone, Building2, Shield, Camera, CheckCircle2, AlertCircle } from "lucide-react"
import useSWR, { preload } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { getUserProfile, updateAccount, type UserProfile } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"

// Preload profile data fetcher
const profileFetcher = (key: [string, string]) => getUserProfile(key[1])

export default function SettingsPage() {
  const router = useRouter()
  const { userId, isAuthenticated } = useAuthStore()
  
  // Preload data on component mount
  useEffect(() => {
    if (userId) {
      preload(['profile', userId], profileFetcher)
    }
  }, [userId])
  
  const { data: profileData, isLoading: isProfileLoading, mutate } = useSWR(
    userId ? ['profile', userId] : null,
    profileFetcher,
    { 
      revalidateOnFocus: false,
      dedupingInterval: 5000
    }
  )
  
  const profile = profileData?.data
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    company_name: "",
    avatar_url: "",
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (profile && !isInitialized) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        company_name: profile.company_name || "",
        avatar_url: profile.avatar_url || "",
      })
      setIsInitialized(true)
    }
  }, [profile, isInitialized])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) return
    
    setIsLoading(true)
    setError("")
    setSuccess("")

    const res = await updateAccount({
      user_id: userId,
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      company_name: formData.company_name,
      avatar_url: formData.avatar_url,
    })
    
    if (res.success) {
      setSuccess("Profile updated successfully")
      mutate()
    } else {
      setError(res.error || "Failed to update profile")
    }
    
    setIsLoading(false)
  }

  const getKycBadge = (status: string | undefined) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-chart-3/20 text-chart-3 border-chart-3/30">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Pending
          </Badge>
        )
      default:
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unverified
          </Badge>
        )
    }
  }

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Summary Card */}
        <Card className="bg-card border-border md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden relative">
                  {formData.avatar_url ? (
                    <Image 
                      src={formData.avatar_url} 
                      alt="Avatar" 
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <button 
                  type="button"
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    const url = prompt("Enter avatar URL:")
                    if (url) handleChange("avatar_url", url)
                  }}
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              
              <h3 className="mt-4 font-semibold text-foreground">
                {profile?.full_name || profile?.username || "User"}
              </h3>
              <p className="text-sm text-muted-foreground">@{profile?.username}</p>
              
              <div className="mt-3">
                {getKycBadge(profile?.kyc_status)}
              </div>
              
              <div className="mt-4 w-full pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-foreground capitalize">{profile?.status || "Active"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card className="bg-card border-border md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="full_name">Full Name</FieldLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.full_name}
                      onChange={(e) => handleChange("full_name", e.target.value)}
                      className="pl-10 bg-input border-border"
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="pl-10 bg-input border-border"
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+62 xxx"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="pl-10 bg-input border-border"
                      />
                    </div>
                  </Field>
                  
                  <Field>
                    <FieldLabel htmlFor="company_name">Company</FieldLabel>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="company_name"
                        type="text"
                        placeholder="Company name"
                        value={formData.company_name}
                        onChange={(e) => handleChange("company_name", e.target.value)}
                        className="pl-10 bg-input border-border"
                      />
                    </div>
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="avatar_url">Avatar URL</FieldLabel>
                  <Input
                    id="avatar_url"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatar_url}
                    onChange={(e) => handleChange("avatar_url", e.target.value)}
                    className="bg-input border-border"
                  />
                  <FieldDescription>Enter a URL for your profile picture</FieldDescription>
                </Field>
              </FieldGroup>
              
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm mt-4">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              {success && (
                <div className="flex items-center gap-2 text-primary text-sm mt-4">
                  <CheckCircle2 className="h-4 w-4" />
                  {success}
                </div>
              )}
              
              <Button
                type="submit"
                className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* KYC Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg text-foreground">KYC Verification</CardTitle>
          </div>
          <CardDescription>Complete identity verification to unlock full trading features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Verification Status</p>
              <p className="text-sm text-muted-foreground mt-1">
                {profile?.kyc_status === "verified" 
                  ? "Your account is fully verified"
                  : profile?.kyc_status === "pending"
                  ? "Your verification is being processed"
                  : "Complete KYC to increase trading limits"
                }
              </p>
            </div>
            {getKycBadge(profile?.kyc_status)}
          </div>
          
          {profile?.kyc_status !== "verified" && (
            <Button 
              variant="outline" 
              className="mt-4 border-primary text-primary hover:bg-primary/10"
              disabled
            >
              Start Verification
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
