"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"

declare global {
  interface Window {
    google: any
  }
}

interface AddressInputProps {
  form?: UseFormReturn<any>
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  onAddressSelect?: (address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }) => void
}

export function AddressInput({ 
  form, 
  name, 
  label, 
  placeholder, 
  required = false,
  onAddressSelect 
}: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [autocomplete, setAutocomplete] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load Google Places API script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      setIsLoading(false)
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (!isLoading && inputRef.current && !autocomplete) {
      const autocompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "us" },
        fields: ["address_components", "formatted_address"],
        types: ["address"],
      })

      autocompleteInstance.addListener("place_changed", () => {
        const place = autocompleteInstance.getPlace()
        if (!place.address_components) return

        // Extract address components
        const addressComponents = place.address_components.reduce((acc: any, component: any) => {
          const type = component.types[0]
          acc[type] = component.long_name
          return acc
        }, {})

        const address = {
          street: `${addressComponents.street_number || ""} ${addressComponents.route || ""}`.trim(),
          city: addressComponents.locality || "",
          state: addressComponents.administrative_area_level_1 || "",
          zipCode: addressComponents.postal_code || "",
          country: addressComponents.country || "US",
        }

        if (form && name) {
        // Update form with address components
          form.setValue(`${name}.street`, address.street)
          form.setValue(`${name}.city`, address.city)
          form.setValue(`${name}.state`, address.state)
          form.setValue(`${name}.zipCode`, address.zipCode)
          form.setValue(`${name}.country`, address.country)

        // Clear any previous errors
        form.clearErrors(`${name}.street`)
        form.clearErrors(`${name}.city`)
        form.clearErrors(`${name}.state`)
        form.clearErrors(`${name}.zipCode`)
        }

        if (onAddressSelect) {
          onAddressSelect(address)
        }
      })

      setAutocomplete(autocompleteInstance)
    }
  }, [isLoading, form, name, onAddressSelect])

  if (form && name) {
  return (
    <FormField
      control={form.control}
      name={`${name}.street`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label} {required && <span className="text-destructive">*</span>}</FormLabel>
          <FormControl>
            <Input
              {...field}
              ref={inputRef}
              placeholder={placeholder || "Enter address"}
              onChange={(e) => {
                field.onChange(e)
                // Clear other fields when address changes
                form.setValue(`${name}.city`, "")
                form.setValue(`${name}.state`, "")
                form.setValue(`${name}.zipCode`, "")
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    )
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label} {required && <span className="text-destructive">*</span>}</Label>}
      <Input
        ref={inputRef}
        placeholder={placeholder || "Enter address"}
      />
    </div>
  )
} 