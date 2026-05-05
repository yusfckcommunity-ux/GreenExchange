"use client"

import { Leaf } from "lucide-react"
import { RegisterIssueForm } from "@/components/dashboard/register-issue-form"

export default function RegisterIssuePage() {
  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-6">
      {/* Hero Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Register Your Asset</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          List your green energy project or carbon credit on our marketplace. 
          Complete the form below and our team will review your submission.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          Fill out details
        </span>
        <span className="text-border">—</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted"></span>
          Submit for review
        </span>
        <span className="text-border">—</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted"></span>
          Go live
        </span>
      </div>

      {/* Form */}
      <RegisterIssueForm />
    </div>
  )
}
