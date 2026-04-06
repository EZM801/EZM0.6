import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface CompanyMove {
  id: string;
  name: string;
  status: string;
  priority: string;
  startDate: string;
  clientName: string;
  moveType: string;
}

async function fetchCompanyMoves() {
  try {
    const response = await fetch("/api/company-moves");
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch moves:", errorData);
      throw new Error(errorData.error || "Failed to fetch moves");
    }
    const data = await response.json();
    if (!data.success) {
      console.error("API returned error:", data);
      throw new Error(data.error || "Failed to fetch moves");
    }
    console.log("Successfully fetched moves:", data);
    return data.data;
  } catch (error) {
    console.error("Error in fetchCompanyMoves:", error);
    throw error;
  }
}

export function CompanyMoveList() {
  const router = useRouter();
  const { data: moves, isLoading, error } = useQuery({
    queryKey: ["company-moves"],
    queryFn: fetchCompanyMoves,
    retry: 1,
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    console.error("Error in CompanyMoveList:", error);
    return (
      <div className="flex items-center justify-center py-8 text-destructive">
        Failed to load moves. Please try again.
      </div>
    );
  }

  if (!moves?.length) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        No moves found. Create your first move to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {moves.map((move: CompanyMove) => (
            <TableRow key={move.id}>
              <TableCell className="font-medium">{move.name}</TableCell>
              <TableCell>{move.clientName}</TableCell>
              <TableCell>{move.moveType}</TableCell>
              <TableCell>{formatDate(move.startDate)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    move.status === "COMPLETED"
                      ? "secondary"
                      : move.status === "IN_PROGRESS"
                      ? "outline"
                      : "default"
                  }
                >
                  {move.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    move.priority === "HIGH"
                      ? "destructive"
                      : move.priority === "MEDIUM"
                      ? "outline"
                      : "default"
                  }
                >
                  {move.priority}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/dashboard/company/moves/${move.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 