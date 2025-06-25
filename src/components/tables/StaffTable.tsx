"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { User } from "../../db/schema/users.schema";
import { Pencil, Trash2 } from "lucide-react";

export function StaffTable({ data }: { data: User[] }) {
  const handleEdit = (id: string) => {
    // TODO: Implement edit functionality
    console.log("Edit staff:", id);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    console.log("Delete staff:", id);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[200px]">First Name</TableHead>
            <TableHead className="w-[200px]">Last Name</TableHead>
            <TableHead className="w-[250px]">Email</TableHead>
            <TableHead className="w-[200px]">Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((staff) => (
            <TableRow
              key={staff.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">
                {staff.first_name ?? (
                  <span className="text-muted-foreground italic">N/A</span>
                )}
              </TableCell>
              <TableCell>
                {staff.last_name ?? (
                  <span className="text-muted-foreground italic">N/A</span>
                )}
              </TableCell>
              <TableCell>{staff.email}</TableCell>
              <TableCell>
                {format(new Date(staff.created_at), "PPP p")}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(staff.id)}
                  className="hover:text-blue-500"
                >
                  <Pencil className="size-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(staff.id)}
                  className="hover:text-red-500"
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
