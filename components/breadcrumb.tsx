"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbProps {
  homeElement?: React.ReactNode
  separator?: React.ReactNode
  containerClasses?: string
  listClasses?: string
  activeClasses?: string
  capitalizeLinks?: boolean
}

export function Breadcrumb({
  homeElement = <Home className="h-4 w-4" />,
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  containerClasses = "flex py-3",
  listClasses = "flex items-center space-x-2 text-sm text-muted-foreground",
  activeClasses = "font-medium text-foreground",
  capitalizeLinks = true,
}: BreadcrumbProps) {
  const paths = usePathname()
  const pathNames = paths.split("/").filter((path) => path)

  return (
    <nav aria-label="Breadcrumb" className={containerClasses}>
      <ol className={listClasses}>
        <li className="flex items-center">
          <Link href="/" className="flex items-center hover:text-foreground transition-colors">
            {homeElement}
          </Link>
        </li>

        {pathNames.length > 0 && separator && (
          <li aria-hidden="true" className="flex items-center">
            {separator}
          </li>
        )}

        {pathNames.map((link, index) => {
          const isLast = index === pathNames.length - 1
          const href = `/${pathNames.slice(0, index + 1).join("/")}`

          // Format the link text
          let formattedLink = link

          // Replace hyphens and underscores with spaces
          formattedLink = formattedLink.replace(/[-_]/g, " ")

          // Handle dynamic routes with [id]
          if (formattedLink.includes("[") && formattedLink.includes("]")) {
            formattedLink = "Details"
          }

          // Capitalize if needed
          if (capitalizeLinks) {
            formattedLink = formattedLink
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
          }

          return (
            <React.Fragment key={href}>
              <li className="flex items-center">
                {isLast ? (
                  <span className={activeClasses}>{formattedLink}</span>
                ) : (
                  <Link href={href} className="hover:text-foreground transition-colors">
                    {formattedLink}
                  </Link>
                )}
              </li>

              {!isLast && separator && (
                <li aria-hidden="true" className="flex items-center">
                  {separator}
                </li>
              )}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

