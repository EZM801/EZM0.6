import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export type Move = {
  id: string;
  name: string;
  clientEmail: string;
  status: string;
  fromAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  toAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
};

export const columns: ColumnDef<Move>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'clientEmail',
    header: 'Client Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'fromAddress',
    header: 'From',
    cell: ({ row }) => {
      const address = row.getValue('fromAddress') as Move['fromAddress'];
      return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
    },
  },
  {
    accessorKey: 'toAddress',
    header: 'To',
    cell: ({ row }) => {
      const address = row.getValue('toAddress') as Move['toAddress'];
      return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      return format(new Date(date), 'MMM d, yyyy');
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const move = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(move.id)}
            >
              Copy move ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View move details</DropdownMenuItem>
            <DropdownMenuItem>Edit move</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete move</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 