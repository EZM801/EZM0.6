import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, QrCode } from "lucide-react"
import React from "react"

export interface ItemCardProps {
  item: {
    id: string
    name: string
    description: string | null
    weight: number | null
    value: number | null
    isFragile: boolean
    specialInstructions: string | null
    packingStatus: string
    qrCode: string | null
    originRoomName?: string | null
    destinationRoomName?: string | null
    stopRoomName?: string | null
    createdAt: string
    updatedAt: string
  }
  statusConfig: {
    icon: React.ElementType
    label: string
    color: string
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: (id: string) => void
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, statusConfig, onEdit, onDelete, onClick }) => {
  const StatusIcon = statusConfig.icon
  return (
    <Card
      className="border-none rounded-3xl soft-shadow hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={() => onClick?.(item.id)}
      tabIndex={0}
      aria-label={`View details for ${item.name}`}
      role="button"
      onKeyDown={e => { if (e.key === 'Enter') onClick?.(item.id) }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {item.qrCode && <QrCode className="h-4 w-4 text-muted-foreground" />}
            {item.name}
          </CardTitle>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${statusConfig.color}`}
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </div>
        {item.description && (
          <CardDescription className="line-clamp-2">
            {item.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {item.isFragile && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                Fragile
              </Badge>
            )}
            {item.weight !== null && (
              <Badge variant="outline">Weight: {item.weight} lbs</Badge>
            )}
            {item.value !== null && (
              <Badge variant="outline">Value: ${item.value}</Badge>
            )}
            {item.qrCode && (
              <Badge variant="outline" className="flex items-center gap-1">
                <QrCode className="h-3 w-3" /> QR
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold">Special Instructions:</span> {item.specialInstructions || "None"}
          </div>
          <div className="flex flex-wrap gap-4 text-xs mt-2">
            <span><span className="font-semibold">Origin:</span> {item.originRoomName || "-"}</span>
            <span><span className="font-semibold">Destination:</span> {item.destinationRoomName || "-"}</span>
            <span><span className="font-semibold">Stop:</span> {item.stopRoomName || "-"}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          Created {new Date(item.createdAt).toLocaleDateString()}<br />
          Updated {new Date(item.updatedAt).toLocaleDateString()}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Edit Item"
              onClick={e => { e.stopPropagation(); onEdit(item.id) }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Delete Item"
              onClick={e => { e.stopPropagation(); onDelete(item.id) }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
} 