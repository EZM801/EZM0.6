import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './moves-columns';
import { Plus } from 'lucide-react';

async function fetchMoves() {
  const response = await fetch('/api/company-moves');
  if (!response.ok) {
    throw new Error('Failed to fetch moves');
  }
  return response.json();
}

export function MovesList() {
  const { data: moves, isLoading, error } = useQuery({
    queryKey: ['moves'],
    queryFn: fetchMoves,
  });

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">Error loading moves: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Moves</CardTitle>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Move
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={moves || []}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
} 