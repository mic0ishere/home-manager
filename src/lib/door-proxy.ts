import type { DoorConfig } from "./types";

function getDoorProxyUrl(path: string): string {
  const proxyHost = process.env.DOOR_CONTROL_PROXY_HOST;
  if (!proxyHost) {
    throw new Error("DOOR_CONTROL_PROXY_HOST environment variable is not set");
  }

  const baseUrl =
    proxyHost.startsWith("http://") || proxyHost.startsWith("https://")
      ? proxyHost
      : `https://${proxyHost}`;

  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return `${normalizedBaseUrl}/${normalizedPath}`;
}

function getDoorProxyAuthHeaders() {
  const proxyAuth = process.env.DOOR_CONTROL_PROXY_AUTH;
  if (!proxyAuth) {
    throw new Error("DOOR_CONTROL_PROXY_AUTH environment variable is not set");
  }
  return {
    Authorization: `Bearer ${proxyAuth}`,
  };
}

export async function getDoorsConfig(): Promise<DoorConfig[]> {
  const url = getDoorProxyUrl("doors-config");
  const proxyResponse = await fetch(url, {
    method: "GET",
    headers: getDoorProxyAuthHeaders(),
  });

  if (!proxyResponse.ok) {
    const errorText = await proxyResponse.text();
    console.error("Failed to fetch doors config:", errorText);
    return [];
  }

  const configData = await proxyResponse.json();
  if (!configData.doors || !Array.isArray(configData.doors)) {
    console.error("Invalid doors config format:", configData);
    return [];
  }

  return configData.doors || [];
}

interface DoorOpenResponse {
  error: string | null;
  success: boolean;
}

export async function openDoor(doorId: string): Promise<DoorOpenResponse> {
  const url = getDoorProxyUrl(`open-door?id=${doorId}`);
  const proxyResponse = await fetch(url, {
    method: "GET",
    headers: getDoorProxyAuthHeaders(),
  });

  if (!proxyResponse.ok) {
    const errorText = await proxyResponse.text();
    console.error(`Failed to open door ${doorId}:`, errorText);

    return {
      success: false,
      error: errorText,
    };
  }

  const responseData = await proxyResponse.text();
  console.log(`Door ${doorId} open response:`, responseData);

  return {
    success: true,
    error: null,
  };
}
