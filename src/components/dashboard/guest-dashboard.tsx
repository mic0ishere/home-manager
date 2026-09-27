"use client";

import * as React from "react";
import { DoorClosed, DoorOpen, Check, Copy, Wifi } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface GuestDashboardProps {
  wifiName?: string;
  wifiPassword?: string;
}

export function GuestDashboard({
  wifiName = "HomeManager-Guest",
  wifiPassword = "welcome-home",
}: GuestDashboardProps) {
  const [openingDoor, setOpeningDoor] = React.useState<string | null>(null);
  const [lastDoorAlert, setLastDoorAlert] = React.useState<{
    id: string;
    message: string;
    timestamp: Date;
  } | null>(null);

  const [copiedField, setCopiedField] = React.useState<
    "all" | "password" | null
  >(null);

  async function handleOpenDoor(id: string) {
    if (openingDoor) return;
    setOpeningDoor(id);

    try {
      const res = await fetch(`/api/open-door?id=${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to open door");
      }

      setLastDoorAlert({
        id,
        message: data.message || `${id} door opened`,
        timestamp: new Date(),
      });
      toast.success(data.message || "Door opened");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error opening door";
      toast.error(errorMessage);
    } finally {
      setOpeningDoor(null);
    }
  }

  async function copyToClipboard(text: string, type: "all" | "password") {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(type);
      toast.success(
        type === "all"
          ? "Wi-Fi network and password copied!"
          : "Wi-Fi password copied!",
      );
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }

  return (
    <div className="space-y-6">
      {lastDoorAlert && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100">
          <DoorOpen className="text-emerald-600 dark:text-emerald-400" />
          <AlertTitle className="font-semibold">Door Status</AlertTitle>
          <AlertDescription className="text-emerald-900 dark:text-emerald-200">
            {lastDoorAlert.message} at{" "}
            {lastDoorAlert.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Door Opening Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DoorClosed className="size-4 text-muted-foreground" />
              <CardTitle>Door Access</CardTitle>
            </div>
            <CardDescription>
              Select an entrance to remotely unlock the door.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 justify-center h-11 text-sm font-medium"
                disabled={openingDoor !== null}
                onClick={() => handleOpenDoor("main")}
              >
                {openingDoor === "main" ? (
                  <>
                    <Spinner className="mr-2 size-4" />
                    Opening Main Door...
                  </>
                ) : (
                  <>
                    <DoorOpen className="mr-2 size-4 text-primary" />
                    Open Main Door
                  </>
                )}
              </Button>
            </div>

            {openingDoor && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 animate-pulse">
                <Spinner className="size-3" />
                Unlocking in progress (takes ~5 seconds)...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Wi-Fi Details Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wifi className="size-4 text-muted-foreground" />
              <CardTitle>Wi-Fi Network</CardTitle>
            </div>
            <CardDescription>
              Connect your devices to the wireless network.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 bg-muted/50 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Network (SSID)</span>
                <span className="font-mono font-medium text-foreground">
                  {wifiName}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-muted-foreground">Password</span>
                <span className="font-mono font-medium text-foreground">
                  {wifiPassword}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                className="flex-1 text-xs"
                onClick={() => copyToClipboard(wifiPassword, "password")}
              >
                {copiedField === "password" ? (
                  <>
                    <Check className="mr-1.5 size-3.5" />
                    Password Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 size-3.5" />
                    Copy Password
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() =>
                  copyToClipboard(
                    `Wi-Fi: ${wifiName}\nPassword: ${wifiPassword}`,
                    "all",
                  )
                }
              >
                {copiedField === "all" ? (
                  <>
                    <Check className="mr-1.5 size-3.5" />
                    Details Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 size-3.5" />
                    Copy All Details
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
