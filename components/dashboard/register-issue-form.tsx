"use client"

import { useState, useRef } from "react"
import { 
  Loader2, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  MapPin, 
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { submitIssue, type IssueSubmission } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { cn } from "@/lib/utils"

const PROJECT_CLASSES = [
  { value: "REC", label: "Renewable Energy Certificate (REC)" },
  { value: "CARBON", label: "Carbon Credit" },
  { value: "SOLAR", label: "Solar Energy" },
  { value: "WIND", label: "Wind Energy" },
  { value: "HYDRO", label: "Hydro Power" },
]

const PROJECT_TYPES = [
  { value: "solar_farm", label: "Solar Farm" },
  { value: "wind_farm", label: "Wind Farm" },
  { value: "hydro_plant", label: "Hydro Plant" },
  { value: "biomass", label: "Biomass" },
  { value: "geothermal", label: "Geothermal" },
  { value: "other", label: "Other" },
]

const REGIONS = [
  { value: "jakarta", label: "Jakarta" },
  { value: "west_java", label: "West Java" },
  { value: "central_java", label: "Central Java" },
  { value: "east_java", label: "East Java" },
  { value: "bali", label: "Bali" },
  { value: "sumatra", label: "Sumatra" },
  { value: "kalimantan", label: "Kalimantan" },
  { value: "sulawesi", label: "Sulawesi" },
  { value: "papua", label: "Papua" },
]

const CREDIT_UNITS = [
  { value: "MWh", label: "MWh (Megawatt-hour)" },
  { value: "tCO2", label: "tCO2 (Ton CO2 equivalent)" },
  { value: "kWh", label: "kWh (Kilowatt-hour)" },
]

interface FormErrors {
  [key: string]: string
}

function ImagePreview({ url, onRemove, label }: { url: string; onRemove: () => void; label: string }) {
  if (!url) return null
  
  return (
    <div className="relative group">
      <img 
        src={url} 
        alt={label}
        className="w-full h-24 object-cover rounded-lg border border-border"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none'
        }}
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

export function RegisterIssueForm() {
  const userId = useAuthStore((state) => state.userId)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    class: "",
    description: "",
    logo_url: "",
    certification: "",
    issuer: "",
    project_type: "",
    region: "",
    commissioned_year: new Date().getFullYear(),
    credit_unit: "MWh",
    total_credit: 0,
    credit_per_qty: 0,
    last_price: 0,
    min_qty: 1,
    image_url_1: "",
    image_url_2: "",
    image_url_3: "",
    image_url_4: "",
    image_url_5: "",
    certificate_url: "",
    map_url: "",
  })

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    // Basic Info validation
    if (!formData.symbol.trim()) {
      newErrors.symbol = "Symbol is required"
    } else if (!/^[A-Z]{2,6}$/.test(formData.symbol.toUpperCase())) {
      newErrors.symbol = "Symbol must be 2-6 uppercase letters"
    }
    
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required"
    }
    
    if (!formData.class) {
      newErrors.class = "Asset class is required"
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters"
    }
    
    // Project Metadata validation
    if (!formData.issuer.trim()) {
      newErrors.issuer = "Issuer/Company name is required"
    }
    
    if (!formData.project_type) {
      newErrors.project_type = "Project type is required"
    }
    
    if (!formData.region) {
      newErrors.region = "Region is required"
    }
    
    if (formData.commissioned_year < 2000 || formData.commissioned_year > new Date().getFullYear() + 5) {
      newErrors.commissioned_year = "Please enter a valid year"
    }
    
    // Credit Info validation
    if (formData.total_credit <= 0) {
      newErrors.total_credit = "Total credit must be greater than 0"
    }
    
    if (formData.credit_per_qty <= 0) {
      newErrors.credit_per_qty = "Credit per quantity must be greater than 0"
    }
    
    if (formData.last_price <= 0) {
      newErrors.last_price = "Initial price must be greater than 0"
    }
    
    if (formData.min_qty < 1) {
      newErrors.min_qty = "Minimum quantity must be at least 1"
    }
    
    // Media validation - at least logo is required
    if (!formData.logo_url.trim()) {
      newErrors.logo_url = "Logo URL is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    if (!userId) {
      setSubmitError("You must be logged in to submit")
      return
    }

    setIsLoading(true)
    setSubmitError("")

    const payload: IssueSubmission = {
      user_id: parseInt(userId),
      symbol: formData.symbol.toUpperCase(),
      name: formData.name,
      class: formData.class,
      is_active: true,
      last_price: formData.last_price,
      min_qty: formData.min_qty,
      description: formData.description,
      logo_url: formData.logo_url,
      certification: formData.certification,
      issuer: formData.issuer,
      project_type: formData.project_type,
      region: formData.region,
      commissioned_year: formData.commissioned_year,
      credit_unit: formData.credit_unit,
      total_credit: formData.total_credit,
      credit_per_qty: formData.credit_per_qty,
      status: "pending",
      image_url_1: formData.image_url_1 || undefined,
      image_url_2: formData.image_url_2 || undefined,
      image_url_3: formData.image_url_3 || undefined,
      image_url_4: formData.image_url_4 || undefined,
      image_url_5: formData.image_url_5 || undefined,
      certificate_url: formData.certificate_url || undefined,
      map_url: formData.map_url || undefined,
    }

    const res = await submitIssue(payload)

    if (res.success) {
      setSuccess(true)
    } else {
      setSubmitError(res.error || "Failed to submit. Please try again.")
    }

    setIsLoading(false)
  }

  const resetForm = () => {
    setFormData({
      symbol: "",
      name: "",
      class: "",
      description: "",
      logo_url: "",
      certification: "",
      issuer: "",
      project_type: "",
      region: "",
      commissioned_year: new Date().getFullYear(),
      credit_unit: "MWh",
      total_credit: 0,
      credit_per_qty: 0,
      last_price: 0,
      min_qty: 1,
      image_url_1: "",
      image_url_2: "",
      image_url_3: "",
      image_url_4: "",
      image_url_5: "",
      certificate_url: "",
      map_url: "",
    })
    setErrors({})
    setSuccess(false)
    setSubmitError("")
  }

  // Success State
  if (success) {
    return (
      <Card className="max-w-2xl mx-auto border-primary/20">
        <CardContent className="pt-12 pb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Submission Received!</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Your project has been submitted for review. Our team will evaluate your submission and get back to you within 3-5 business days.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={resetForm} variant="outline">
              Submit Another
            </Button>
            <Button asChild>
              <a href="/dashboard">Back to Dashboard</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">1</div>
            Basic Information
          </CardTitle>
          <CardDescription>
            Tell us about your green asset or project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-6 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="symbol">Symbol *</FieldLabel>
                <Input
                  id="symbol"
                  placeholder="e.g. SLR"
                  value={formData.symbol}
                  onChange={(e) => updateField("symbol", e.target.value.toUpperCase())}
                  className={cn("bg-input border-border font-mono uppercase", errors.symbol && "border-destructive")}
                  maxLength={6}
                />
                <FieldDescription>Unique trading symbol (2-6 letters)</FieldDescription>
                {errors.symbol && <FieldError>{errors.symbol}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="name">Project Name *</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g. Solar Farm Alpha"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={cn("bg-input border-border", errors.name && "border-destructive")}
                />
                {errors.name && <FieldError>{errors.name}</FieldError>}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="class">Asset Class *</FieldLabel>
              <Select 
                value={formData.class} 
                onValueChange={(value) => updateField("class", value)}
              >
                <SelectTrigger className={cn("w-full bg-input border-border", errors.class && "border-destructive")}>
                  <SelectValue placeholder="Select asset class" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_CLASSES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.class && <FieldError>{errors.class}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description *</FieldLabel>
              <Textarea
                id="description"
                placeholder="Describe your project, its impact, and key features..."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                className={cn("bg-input border-border min-h-[120px]", errors.description && "border-destructive")}
              />
              <FieldDescription>{formData.description.length}/50 minimum characters</FieldDescription>
              {errors.description && <FieldError>{errors.description}</FieldError>}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Section 2: Project Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">2</div>
            Project Details
          </CardTitle>
          <CardDescription>
            Provide specific details about your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-6 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="issuer">Issuer / Company *</FieldLabel>
                <Input
                  id="issuer"
                  placeholder="e.g. Green Energy Corp"
                  value={formData.issuer}
                  onChange={(e) => updateField("issuer", e.target.value)}
                  className={cn("bg-input border-border", errors.issuer && "border-destructive")}
                />
                {errors.issuer && <FieldError>{errors.issuer}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="certification">Certification</FieldLabel>
                <Input
                  id="certification"
                  placeholder="e.g. Gold Standard, VCS"
                  value={formData.certification}
                  onChange={(e) => updateField("certification", e.target.value)}
                  className="bg-input border-border"
                />
              </Field>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="project_type">Project Type *</FieldLabel>
                <Select 
                  value={formData.project_type} 
                  onValueChange={(value) => updateField("project_type", value)}
                >
                  <SelectTrigger className={cn("w-full bg-input border-border", errors.project_type && "border-destructive")}>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.project_type && <FieldError>{errors.project_type}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="region">Region *</FieldLabel>
                <Select 
                  value={formData.region} 
                  onValueChange={(value) => updateField("region", value)}
                >
                  <SelectTrigger className={cn("w-full bg-input border-border", errors.region && "border-destructive")}>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.region && <FieldError>{errors.region}</FieldError>}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="commissioned_year">Commissioned Year</FieldLabel>
              <Input
                id="commissioned_year"
                type="number"
                min={2000}
                max={new Date().getFullYear() + 5}
                value={formData.commissioned_year}
                onChange={(e) => updateField("commissioned_year", parseInt(e.target.value) || 0)}
                className={cn("bg-input border-border font-mono max-w-[200px]", errors.commissioned_year && "border-destructive")}
              />
              {errors.commissioned_year && <FieldError>{errors.commissioned_year}</FieldError>}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Section 3: Credit Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">3</div>
            Credit Information
          </CardTitle>
          <CardDescription>
            Define the credit parameters for your asset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-6 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="credit_unit">Credit Unit *</FieldLabel>
                <Select 
                  value={formData.credit_unit} 
                  onValueChange={(value) => updateField("credit_unit", value)}
                >
                  <SelectTrigger className="w-full bg-input border-border">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {CREDIT_UNITS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="total_credit">Total Credit *</FieldLabel>
                <Input
                  id="total_credit"
                  type="number"
                  placeholder="e.g. 15"
                  min={0}
                  step="0.001"
                  value={formData.total_credit || ""}
                  onChange={(e) => updateField("total_credit", parseFloat(e.target.value) || 0)}
                  className={cn("bg-input border-border font-mono", errors.total_credit && "border-destructive")}
                />
                <FieldDescription>Total credits available</FieldDescription>
                {errors.total_credit && <FieldError>{errors.total_credit}</FieldError>}
              </Field>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="credit_per_qty">Credit per Qty *</FieldLabel>
                <Input
                  id="credit_per_qty"
                  type="number"
                  placeholder="e.g. 0.014"
                  min={0}
                  step="0.0001"
                  value={formData.credit_per_qty || ""}
                  onChange={(e) => updateField("credit_per_qty", parseFloat(e.target.value) || 0)}
                  className={cn("bg-input border-border font-mono", errors.credit_per_qty && "border-destructive")}
                />
                {errors.credit_per_qty && <FieldError>{errors.credit_per_qty}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="last_price">Initial Price (IDR) *</FieldLabel>
                <Input
                  id="last_price"
                  type="number"
                  placeholder="e.g. 246100"
                  min={0}
                  value={formData.last_price || ""}
                  onChange={(e) => updateField("last_price", parseInt(e.target.value) || 0)}
                  className={cn("bg-input border-border font-mono", errors.last_price && "border-destructive")}
                />
                {errors.last_price && <FieldError>{errors.last_price}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="min_qty">Min Quantity *</FieldLabel>
                <Input
                  id="min_qty"
                  type="number"
                  placeholder="e.g. 1"
                  min={1}
                  value={formData.min_qty || ""}
                  onChange={(e) => updateField("min_qty", parseInt(e.target.value) || 1)}
                  className={cn("bg-input border-border font-mono", errors.min_qty && "border-destructive")}
                />
                {errors.min_qty && <FieldError>{errors.min_qty}</FieldError>}
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Section 4: Media & Docs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">4</div>
            Media & Documentation
          </CardTitle>
          <CardDescription>
            Add images and documents to showcase your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="logo_url">Logo URL *</FieldLabel>
              <div className="flex gap-3">
                <Input
                  id="logo_url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo_url}
                  onChange={(e) => updateField("logo_url", e.target.value)}
                  className={cn("bg-input border-border flex-1", errors.logo_url && "border-destructive")}
                />
                {formData.logo_url && (
                  <div className="w-12 h-10 rounded border border-border overflow-hidden flex-shrink-0">
                    <img 
                      src={formData.logo_url} 
                      alt="Logo preview"
                      className="w-full h-full object-contain bg-secondary"
                      onError={(e) => (e.target as HTMLImageElement).src = ''}
                    />
                  </div>
                )}
              </div>
              {errors.logo_url && <FieldError>{errors.logo_url}</FieldError>}
            </Field>

            <div>
              <FieldLabel className="mb-3">Project Images</FieldLabel>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <Field key={num}>
                    <Input
                      placeholder={`Image ${num} URL`}
                      value={formData[`image_url_${num}` as keyof typeof formData] as string}
                      onChange={(e) => updateField(`image_url_${num}`, e.target.value)}
                      className="bg-input border-border text-xs"
                    />
                    {formData[`image_url_${num}` as keyof typeof formData] && (
                      <ImagePreview 
                        url={formData[`image_url_${num}` as keyof typeof formData] as string}
                        onRemove={() => updateField(`image_url_${num}`, "")}
                        label={`Image ${num}`}
                      />
                    )}
                  </Field>
                ))}
              </div>
              <FieldDescription className="mt-2">Add up to 5 project images</FieldDescription>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="certificate_url" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Certificate URL
                </FieldLabel>
                <Input
                  id="certificate_url"
                  placeholder="https://example.com/certificate.pdf"
                  value={formData.certificate_url}
                  onChange={(e) => updateField("certificate_url", e.target.value)}
                  className="bg-input border-border"
                />
                <FieldDescription>Link to certification document</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="map_url" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Map URL
                </FieldLabel>
                <Input
                  id="map_url"
                  placeholder="https://maps.google.com/..."
                  value={formData.map_url}
                  onChange={(e) => updateField("map_url", e.target.value)}
                  className="bg-input border-border"
                />
                <FieldDescription>Google Maps or location link</FieldDescription>
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Error Message */}
      {submitError && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{submitError}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={resetForm}>
          Reset Form
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[180px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Submit for Review
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
