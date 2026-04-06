"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { useMove } from "@/app/hooks/useMove"
import { useRouteParams } from "@/app/hooks/useRouteParams"
import { Skeleton } from "@/components/ui/skeleton"
import { DatePicker } from "@/components/ui/date-picker"
import { Move, MoveType } from '@/app/types/MoveType'
import { useQuery, useMutation } from '@tanstack/react-query'
import { movesApi } from "@/app/lib/api/moves"

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  moveType: z.enum(["residential", "commercial", "storage", "packing", "unpacking"], {
    required_error: "Please select a move type",
  }),
  startDate: z.date({ required_error: "Please select a move date" }),
  endDate: z.date().nullable().optional(),
  fromAddress: z.object({
    street: z.string().min(1, { message: "Street address is required" }),
    city: z.string().min(1, { message: "City is required" }),
    state: z.string().min(1, { message: "State is required" }),
    zipCode: z.string().min(1, { message: "ZIP code is required" }),
  }).nullable().optional(),
  toAddress: z.object({
    street: z.string().min(1, { message: "Street address is required" }),
    city: z.string().min(1, { message: "City is required" }),
    state: z.string().min(1, { message: "State is required" }),
    zipCode: z.string().min(1, { message: "ZIP code is required" }),
  }).nullable().optional(),
  stops: z.array(z.object({
    name: z.string().min(1, { message: "Name is required" }),
    address: z.string().min(1, { message: "Address is required" }),
    city: z.string().min(1, { message: "City is required" }),
    state: z.string().min(1, { message: "State is required" }),
    zipCode: z.string().min(1, { message: "ZIP code is required" }),
    country: z.string().min(1, { message: "Country is required" }),
    arrivalDate: z.string().nullable().optional(),
    departureDate: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })).default([]),
})

type FormValues = z.infer<typeof formSchema>;

export default function EditMovePage() {
  const router = useRouter()
  const params = useRouteParams<{ id: string }>()
  const moveId = params.id
  const { data: move, isLoading, error } = useMove(moveId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFromAddress, setShowFromAddress] = useState(false)
  const [showToAddress, setShowToAddress] = useState(false)

  const [formData, setFormData] = useState<FormValues>({
    name: "",
    description: "",
    moveType: "residential",
    startDate: new Date(),
    endDate: null,
    fromAddress: null,
    toAddress: null,
    stops: [],
  });

  // Fetch move data
  const { data: moveData, isLoading: queryLoading } = useQuery({
    queryKey: ['move', moveId],
    queryFn: () => movesApi.getMove(moveId as string),
    enabled: !!moveId,
  });

  // Update form data when move is loaded
  useEffect(() => {
    if (moveData) {
      setFormData({
        name: moveData.name || "",
        description: moveData.description || "",
        moveType: (moveData.moveType as MoveType) || "residential",
        startDate: moveData.startDate ? new Date(moveData.startDate) : new Date(),
        endDate: moveData.endDate ? new Date(moveData.endDate) : null,
        fromAddress: moveData.fromAddress ? {
          street: moveData.fromAddress.street || "",
          city: moveData.fromAddress.city || "",
          state: moveData.fromAddress.state || "",
          zipCode: moveData.fromAddress.zipCode || "",
        } : null,
        toAddress: moveData.toAddress ? {
          street: moveData.toAddress.street || "",
          city: moveData.toAddress.city || "",
          state: moveData.toAddress.state || "",
          zipCode: moveData.toAddress.zipCode || "",
        } : null,
        stops: moveData.stops?.map(stop => ({
          name: stop.name || "",
          address: stop.address || "",
          city: stop.city || "",
          state: stop.state || "",
          zipCode: stop.zipCode || "",
          country: stop.country || "US",
          arrivalDate: stop.arrivalDate ? new Date(stop.arrivalDate).toISOString() : null,
          departureDate: stop.departureDate ? new Date(stop.departureDate).toISOString() : null,
          notes: stop.notes || null,
        })) || [],
      });
      // Show address sections if addresses exist
      setShowFromAddress(!!moveData.fromAddress)
      setShowToAddress(!!moveData.toAddress)
    }
  }, [moveData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : null }))
  }

  const handleAddressVisibility = (type: 'from' | 'to', show: boolean) => {
    if (type === 'from') {
      setShowFromAddress(show)
      if (!show) {
        setFormData(prev => ({ ...prev, fromAddress: null }))
      } else {
        setFormData(prev => ({
          ...prev,
          fromAddress: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            hasElevator: false,
            floorNumber: null,
            specialInstructions: null,
          }
        }))
      }
    } else {
      setShowToAddress(show)
      if (!show) {
        setFormData(prev => ({ ...prev, toAddress: null }))
      } else {
        setFormData(prev => ({
          ...prev,
          toAddress: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            hasElevator: false,
            floorNumber: null,
            specialInstructions: null,
          }
        }))
      }
    }
  }

  const handleAddressChange = (type: 'from' | 'to', field: string, value: string | boolean | number | null) => {
    setFormData(prev => ({
      ...prev,
      [`${type}Address`]: {
        ...prev[`${type}Address`],
        [field]: value
      }
    }))
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this move?')) {
      return
    }

    try {
      const response = await fetch(`/api/moves/${moveId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete move')
      }

      toast.success('Move deleted successfully')
      router.push('/dashboard/move')
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete move')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!moveId) return;
      
      const response = await fetch(`/api/moves/${moveId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate?.toISOString() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update move');
      }

      toast.success("Move updated successfully", {
        description: "Your changes have been saved",
        action: {
          label: "View Move",
          onClick: () => router.push(`/dashboard/move/${moveId}`)
        }
      })
      
      // Redirect to move details page after a short delay
      setTimeout(() => {
        router.push(`/dashboard/move/${moveId}`)
      }, 1500)
    } catch (error) {
      console.error('Error updating move:', error);
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to update move')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add a new stop
  const handleAddStop = () => {
    setFormData(prev => ({
      ...prev,
      stops: [
        ...prev.stops,
        {
          name: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: "US",
          arrivalDate: null,
          departureDate: null,
          notes: null,
        }
      ]
    }))
  }

  // Remove a stop
  const handleRemoveStop = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index)
    }))
  }

  // Update a stop
  const handleStopChange = (index: number, field: string, value: string | boolean | number | null) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.map((stop, i) => {
        if (i !== index) return stop;
        
        // Handle date fields
        if (field === 'arrivalDate' || field === 'departureDate') {
          return {
            ...stop,
            [field]: value ? new Date(value as string) : null
          };
        }
        
        return { ...stop, [field]: value };
      })
    }))
  }

  // Update the form data state setter
  const handleDateChange = (field: string, value: Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update the stop date change handler
  const handleStopDateChange = (index: number, field: string, value: Date | null) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.map((stop, i) => 
        i === index ? { 
          ...stop, 
          [field]: value ? value.toISOString() : null 
        } : stop
      )
    }));
  };

  if (isLoading || queryLoading) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Card className="mx-auto max-w-2xl border-none rounded-3xl soft-shadow">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 rounded-full">
            <Link href="/dashboard/move">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Moves
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Error</h1>
          <p className="text-destructive">Failed to load move. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 rounded-full">
          <Link href={`/dashboard/move/${moveId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Move
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Edit Move</h1>
        <p className="text-muted-foreground">Update your move details</p>
      </div>

      <Card className="mx-auto max-w-2xl border-none rounded-3xl soft-shadow">
        <CardHeader>
          <CardTitle>Move Details</CardTitle>
          <CardDescription>Update the details of your move</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Move Title *</Label>
                <Input
                  id="title"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Moving to New House"
                  className="rounded-full"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="moveType">Move Type *</Label>
                <Select
                  value={formData.moveType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, moveType: value as MoveType }))}
                >
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Select move type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential Move</SelectItem>
                    <SelectItem value="commercial">Commercial Move</SelectItem>
                    <SelectItem value="storage">Storage Move</SelectItem>
                    <SelectItem value="packing">Packing Only</SelectItem>
                    <SelectItem value="unpacking">Unpacking Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Start Date *</Label>
                <DatePicker
                  value={formData.startDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, startDate: date || new Date() }))}
                />
              </div>

              <div className="grid gap-2">
                <Label>End Date</Label>
                <DatePicker
                  value={formData.endDate || undefined}
                  onChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>From Address</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddressVisibility('from', !showFromAddress)}
                    className="rounded-full"
                  >
                    {showFromAddress ? "Remove" : "Add"}
                  </Button>
                </div>

                {showFromAddress && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fromStreet">Street Address *</Label>
                      <Input
                        id="fromStreet"
                        value={formData.fromAddress?.street || ""}
                        onChange={(e) => handleAddressChange('from', 'street', e.target.value)}
                        placeholder="Enter street address"
                        className="rounded-full"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="fromCity">City *</Label>
                        <Input
                          id="fromCity"
                          value={formData.fromAddress?.city || ""}
                          onChange={(e) => handleAddressChange('from', 'city', e.target.value)}
                          placeholder="City"
                          className="rounded-full"
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="fromState">State *</Label>
                        <Input
                          id="fromState"
                          value={formData.fromAddress?.state || ""}
                          onChange={(e) => handleAddressChange('from', 'state', e.target.value)}
                          placeholder="State"
                          className="rounded-full"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="fromZipCode">ZIP Code *</Label>
                      <Input
                        id="fromZipCode"
                        value={formData.fromAddress?.zipCode || ""}
                        onChange={(e) => handleAddressChange('from', 'zipCode', e.target.value)}
                        placeholder="ZIP code"
                        className="rounded-full"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>To Address</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddressVisibility('to', !showToAddress)}
                    className="rounded-full"
                  >
                    {showToAddress ? "Remove" : "Add"}
                  </Button>
                </div>

                {showToAddress && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="toStreet">Street Address *</Label>
                      <Input
                        id="toStreet"
                        value={formData.toAddress?.street || ""}
                        onChange={(e) => handleAddressChange('to', 'street', e.target.value)}
                        placeholder="Enter street address"
                        className="rounded-full"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="toCity">City *</Label>
                        <Input
                          id="toCity"
                          value={formData.toAddress?.city || ""}
                          onChange={(e) => handleAddressChange('to', 'city', e.target.value)}
                          placeholder="City"
                          className="rounded-full"
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="toState">State *</Label>
                        <Input
                          id="toState"
                          value={formData.toAddress?.state || ""}
                          onChange={(e) => handleAddressChange('to', 'state', e.target.value)}
                          placeholder="State"
                          className="rounded-full"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="toZipCode">ZIP Code *</Label>
                      <Input
                        id="toZipCode"
                        value={formData.toAddress?.zipCode || ""}
                        onChange={(e) => handleAddressChange('to', 'zipCode', e.target.value)}
                        placeholder="ZIP code"
                        className="rounded-full"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add any additional information about your move"
                  className="min-h-[100px] rounded-2xl"
                />
              </div>
            </div>

            {/* Stops Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Additional Stops</CardTitle>
                <CardDescription>
                  Add any additional stops during your move, such as storage units or intermediate locations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formData.stops.map((stop, index) => (
                  <div key={index} className="mb-6 p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Stop {index + 1}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStop(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`stop-name-${index}`}>Name</Label>
                          <Input
                            id={`stop-name-${index}`}
                            value={stop.name}
                            onChange={(e) => handleStopChange(index, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`stop-address-${index}`}>Address</Label>
                          <Input
                            id={`stop-address-${index}`}
                            value={stop.address}
                            onChange={(e) => handleStopChange(index, 'address', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`stop-city-${index}`}>City</Label>
                          <Input
                            id={`stop-city-${index}`}
                            value={stop.city}
                            onChange={(e) => handleStopChange(index, 'city', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`stop-state-${index}`}>State</Label>
                          <Input
                            id={`stop-state-${index}`}
                            value={stop.state}
                            onChange={(e) => handleStopChange(index, 'state', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`stop-zipCode-${index}`}>ZIP Code</Label>
                          <Input
                            id={`stop-zipCode-${index}`}
                            value={stop.zipCode}
                            onChange={(e) => handleStopChange(index, 'zipCode', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`stop-country-${index}`}>Country</Label>
                          <Input
                            id={`stop-country-${index}`}
                            value={stop.country}
                            onChange={(e) => handleStopChange(index, 'country', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`stop-arrivalDate-${index}`}>Arrival Date</Label>
                          <DatePicker
                            value={stop.arrivalDate ? new Date(stop.arrivalDate) : undefined}
                            onChange={(date) => handleStopDateChange(index, 'arrivalDate', date || null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`stop-departureDate-${index}`}>Departure Date</Label>
                          <DatePicker
                            value={stop.departureDate ? new Date(stop.departureDate) : undefined}
                            onChange={(date) => handleStopDateChange(index, 'departureDate', date || null)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`stop-notes-${index}`}>Notes</Label>
                        <Textarea
                          id={`stop-notes-${index}`}
                          value={stop.notes || ''}
                          onChange={(e) => handleStopChange(index, 'notes', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddStop}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stop
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                className="rounded-full"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Move
              </Button>
              <div className="flex gap-4">
                <Button variant="outline" type="button" asChild className="rounded-full">
                  <Link href={`/dashboard/move/${moveId}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 