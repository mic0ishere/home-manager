"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2Icon, UserPlusIcon, UserRoundIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

const listUsersQueryKey = ["admin", "list-users"] as const;

type ListedUser = {
  id: string;
  name?: string | null;
  email: string;
  role?: string | null;
  createdAt?: Date | string;
};

function formatCreatedAt(value?: Date | string) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

export function UsersSection({ ownerId }: { ownerId: string }) {
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ListedUser | null>(null);

  const { data, isPending, isError } = useQuery({
    queryKey: listUsersQueryKey,
    queryFn: async () => {
      const { data, error } = await authClient.admin.listUsers({
        query: { limit: 100 },
      });
      if (error) throw new Error(errorMessage(error, "Failed to load users"));
      return data;
    },
  });

  const users = (data?.users ?? []).sort((a, b) =>
    (a.name ?? a.email).localeCompare(b.name ?? b.email),
  );

  const createGuest = useMutation({
    mutationFn: async (input: { name: string; email: string }) => {
      // No `role` in the body on purpose: the server's `defaultRole: "guest"`
      // assigns it. Passing a role would require the `set-role` permission,
      // which the owner role deliberately lacks — that is what keeps `owner`
      // a single, seed-only account (a direct API call with
      // `role: "owner"` is rejected server-side).
      const { data, error } = await authClient.admin.createUser({
        name: input.name,
        email: input.email,
      });
      if (error) {
        throw new Error(errorMessage(error, "Failed to create guest"));
      }
      // Welcome sign-in link. In dev this is printed to the server console
      // by the `sendMagicLink` callback; with a real email provider it is
      // delivered by the same call.
      await authClient.signIn.magicLink({
        email: input.email,
        name: input.name,
        callbackURL: "/",
        metadata: {
          type: "welcome",
          name: input.name,
        },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Guest created — welcome link printed to the dev console");
      setCreateOpen(false);
      void queryClient.invalidateQueries({ queryKey: listUsersQueryKey });
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Failed to create guest"));
    },
  });

  const deleteGuest = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await authClient.admin.removeUser({ userId });
      if (error) {
        throw new Error(errorMessage(error, "Failed to remove guest"));
      }
    },
    onSuccess: () => {
      toast.success("Guest removed");
      setToDelete(null);
      void queryClient.invalidateQueries({ queryKey: listUsersQueryKey });
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Failed to remove guest"));
    },
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <h2 className="truncate text-sm font-semibold">Guests</h2>
        <Button className="shrink-0" size="sm" onClick={() => setCreateOpen(true)}>
          <UserPlusIcon className="size-4" />
          Add guest
        </Button>
      </div>

      <Card className="p-0">
        {isPending ? (
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Could not load the guest list.
          </div>
        ) : users.length === 0 ? (
          <Empty className="m-0 rounded-none border-0 px-6 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserRoundIcon />
              </EmptyMedia>
              <EmptyTitle>No guests yet</EmptyTitle>
              <EmptyDescription>
                Add your first guest — their sign-in link will be printed to
                the dev console.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <UserPlusIcon className="size-4" />
                Add guest
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <ItemGroup className="gap-0">
            {users.map((user, index) => {
              const isSelf = user.id === ownerId;
              const created = formatCreatedAt(user.createdAt);
              return (
                <Item key={user.id}>
                  {index > 0 && <ItemSeparator className="mb-2 -mt-2" />}
                  <ItemMedia>
                    <UserRoundIcon className="size-4" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{user.name ?? user.email}</ItemTitle>
                    <ItemDescription>{user.email}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Badge variant={isSelf ? "default" : "secondary"}>
                      {isSelf ? "Owner" : "Guest"}
                    </Badge>
                    {created && (
                      <span className="text-xs text-muted-foreground">
                        {created}
                      </span>
                    )}
                    {!isSelf && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Remove ${user.email}`}
                        onClick={() => setToDelete(user)}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    )}
                  </ItemActions>
                </Item>
              );
            })}
          </ItemGroup>
        )}
      </Card>

      <CreateGuestDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(input) => createGuest.mutate(input)}
        isPending={createGuest.isPending}
      />

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {toDelete?.name || toDelete?.email}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They will no longer be able to sign in, and their existing
              sessions are revoked. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteGuest.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteGuest.isPending}
              onClick={() =>
                toDelete && deleteGuest.mutate(toDelete.id)
              }
            >
              {deleteGuest.isPending ? "Removing…" : "Remove"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CreateGuestDialog({
  open,
  onOpenChange,
  onCreate,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: { name: string; email: string }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onCreate({ name: name.trim(), email: email.trim().toLowerCase() });
    setName("");
    setEmail("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a guest</DialogTitle>
          <DialogDescription>
            A sign-in link will be printed to the dev console when the guest
            is created.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="guest-name">Name</Label>
            <Input
              id="guest-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ada Lovelace"
              autoComplete="off"
              required
              disabled={isPending}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="guest-email">Email</Label>
            <Input
              id="guest-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="guest@example.com"
              autoComplete="off"
              required
              disabled={isPending}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating…" : "Create guest"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
