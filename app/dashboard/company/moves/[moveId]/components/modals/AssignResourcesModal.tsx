import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AssignResourcesModalProps {
  open: boolean
  onClose: () => void
  moveId: string
}

export function AssignResourcesModal({ open, onClose, moveId }: AssignResourcesModalProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("employees")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      type: activeTab,
      resourceId: formData.get("resourceId") as string,
      quantity: formData.get("quantity") as string,
      role: formData.get("role") as string,
    }

    try {
      const response = await fetch(`/api/company/moves/${moveId}/resources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to assign resource")
      }

      toast({
        title: "Success",
        description: "Resource assigned successfully",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign resource",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Resources</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="supplies">Supplies</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <TabsContent value="employees">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee</Label>
                  <Select name="resourceId">
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Employee options will be populated from API */}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select name="role">
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOVER">Mover</SelectItem>
                      <SelectItem value="DRIVER">Driver</SelectItem>
                      <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vehicles">
              <div className="space-y-2">
                <Label htmlFor="vehicleId">Vehicle</Label>
                <Select name="resourceId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Vehicle options will be populated from API */}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="equipment">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="equipmentId">Equipment</Label>
                  <Select name="resourceId">
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Equipment options will be populated from API */}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    defaultValue="1"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="supplies">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supplyId">Supply</Label>
                  <Select name="resourceId">
                    <SelectTrigger>
                      <SelectValue placeholder="Select supply" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Supply options will be populated from API */}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    defaultValue="1"
                  />
                </div>
              </div>
            </TabsContent>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Assigning..." : "Assign Resource"}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 