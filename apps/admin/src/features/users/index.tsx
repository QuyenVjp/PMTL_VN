import { MoreHorizontalIcon, PlusIcon, SlidersHorizontalIcon, UserPlusIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const users = [
  ["freeman.dicki", "Freeman Dicki", "freeman83@gmail.com", "+16972759140", "Invited", "Cashier"],
  ["nick.bashirian-lowe", "Nick Bashirian-Lowe", "nick_donnelly@gmail.com", "+17425632370", "Invited", "Admin"],
  ["ardith_jast", "Ardith Jast", "ardith_crist@gmail.com", "+13553118532", "Suspended", "Cashier"],
  ["jeffrey_collins81", "Jeffrey Collins", "jeffrey.stark98@hotmail.com", "+14646410541", "Inactive", "Manager"],
  ["ashton.auer", "Ashton Auer", "ashton_hegmann67@yahoo.com", "+14345495030", "Suspended", "Superadmin"],
  ["golda.gleason", "Golda Gleason", "golda.smith32@gmail.com", "+14606427316", "Active", "Manager"],
  ["maurine.rutherford", "Maurine Rutherford", "maurine_bechtelar@gmail.com", "+16544865144", "Suspended", "Manager"],
  ["alford.wehner", "Alford Wehner", "alford36@hotmail.com", "+12134843128", "Active", "Manager"],
];

function statusVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "Active") return "secondary";
  if (status === "Invited") return "outline";
  return "default";
}

export function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User List</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your users and their roles here.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline">
            <UserPlusIcon />
            Invite User
          </Button>
          <Button>
            <PlusIcon />
            Add User
          </Button>
        </div>
      </div>
      <Card className="gap-4">
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 pt-6">
            <Input className="max-w-xs" placeholder="Filter users..." aria-label="Filter users" />
            <Button variant="outline" size="sm">Status</Button>
            <Button variant="outline" size="sm">Role</Button>
            <div className="ms-auto">
              <Button variant="outline">
                <SlidersHorizontalIcon />
                View
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(([username, name, email, phone, status, role]) => (
                <TableRow key={username}>
                  <TableCell className="font-medium">{username}</TableCell>
                  <TableCell>{name}</TableCell>
                  <TableCell>{email}</TableCell>
                  <TableCell>{phone}</TableCell>
                  <TableCell><Badge variant={statusVariant(status)}>{status}</Badge></TableCell>
                  <TableCell>{role}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" aria-label={`Open actions for ${username}`}>
                      <MoreHorizontalIcon className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <Badge variant="outline">10</Badge>
            </div>
            <div>Page 1 of 50</div>
            <div className="flex items-center gap-2">
              <Badge>1</Badge>
              <Badge variant="outline">2</Badge>
              <Badge variant="outline">3</Badge>
              <Badge variant="outline">4</Badge>
              <Badge variant="outline">50</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
